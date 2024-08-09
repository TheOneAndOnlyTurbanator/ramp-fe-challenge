import { useCallback, useState, useEffect } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();
  const [transactionList, setTransactionList] = useState(transactions || []); // Local state to manage the transaction list

  useEffect(() => {
    setTransactionList(transactions || []); // Update local state when transactions prop changes
  }, [transactions]);

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      // Update the transaction on the server
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });

      // Update the transaction in the local state
      setTransactionList((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, approved: newValue }
            : transaction
        )
      );
    },
    [fetchWithoutCache]
  );

  if (transactionList.length === 0) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactionList.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  );
};