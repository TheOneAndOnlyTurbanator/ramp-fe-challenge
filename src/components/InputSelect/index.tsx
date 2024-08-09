import Downshift from "downshift"
import { useCallback, useEffect, useState } from "react"
import classNames from "classnames"
import { createPortal } from "react-dom"
import { DropdownPosition, GetDropdownPositionFn, InputSelectOnChange, InputSelectProps } from "./types"

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return
      }

      consumerOnChange(selectedItem)
      setSelectedValue(selectedItem)
    },
    [consumerOnChange]
  )

  const updateDropdownPosition = useCallback((target) => {
    setDropdownPosition(getDropdownPosition(target))
  }, [])

  useEffect(() => {
    if (isDropdownOpen) {
      const handleScroll = () => {
        updateDropdownPosition(document.getElementById('RampSelect'))
      }
      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleScroll)

      return () => {
        window.removeEventListener("scroll", handleScroll, true)
        window.removeEventListener("resize", handleScroll)
      }
    }
  }, [isDropdownOpen, updateDropdownPosition])

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
      onStateChange={(changes) => {
        if (changes.hasOwnProperty("isOpen")) {
          setIsDropdownOpen(!!changes.isOpen)
          if (changes.isOpen) {
            updateDropdownPosition(document.getElementById('RampSelect'))
          } else {
            setDropdownPosition(null)
          }
        }
      }}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps()
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem)

        return (
          <div className="RampInputSelect--root" id="RampSelect">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              onClick={(event) => {
                updateDropdownPosition(event.target)
                toggleProps.onClick(event)
              }}
            >
              {inputValue}
            </div>

            {isDropdownOpen && dropdownPosition && 
              createPortal(
                <div
                  className={classNames("RampInputSelect--dropdown-container", {
                    "RampInputSelect--dropdown-container-opened": isOpen,
                  })}
                  {...getMenuProps()}
                  style={{ 
                    top: dropdownPosition.top, 
                    left: dropdownPosition.left, 
                    position: "absolute",
                    maxHeight: '100px', 
                    overflowY: 'auto',  
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {renderItems()}
                </div>,
                document.body
              )
            }
          </div>
        )

        function renderItems() {
          if (!isOpen) {
            return null
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item)
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            )
          })
        }
      }}
    </Downshift>
  )
}

const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) {
    const { top, left, height } = target.getBoundingClientRect()
    const { scrollY } = window
    return {
      top: scrollY + top + height,
      left,
    }
  }

  return { top: 0, left: 0 }
}