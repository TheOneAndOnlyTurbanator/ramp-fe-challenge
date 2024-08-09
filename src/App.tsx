import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, loading: employeesLoading, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, loading: transactionsLoading, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  
  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false); // New state

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(async () => {
    setIsFilteredByEmployee(false); // Reset filter state
    transactionsByEmployeeUtils.invalidateData();

    await employeeUtils.fetchAll();
    await paginatedTransactionsUtils.fetchAll();
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData();
      setIsFilteredByEmployee(true); // Set filter state
      await transactionsByEmployeeUtils.fetchById(employeeId);
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions();
    }
  }, [employeesLoading, employees, loadAllTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading} // Only dependent on employees loading state
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return;
            }

            // Check if the selected value is EMPTY_EMPLOYEE (i.e., "All Employees")
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions();
            } else {
              await loadTransactionsByEmployee(newValue.id);
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {!isFilteredByEmployee && paginatedTransactionsUtils.hasMore && (
            <button
              className="RampButton"
              disabled={transactionsLoading}
              onClick={async () => {
                await paginatedTransactionsUtils.fetchAll();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
