import { Employee, PaginatedResponse, Transaction } from "../utils/types";

type UseTypeBaseResult<TValue> = {
  data: TValue;
  loading: boolean;
  invalidateData: () => void;
};

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>;
};

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>;
};

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null>;

export type PaginatedTransactionsResult = UseTypeBaseAllResult<PaginatedResponse<Transaction[]> | null> & {
  hasMore: boolean;  // Add this property to indicate if there are more transactions to load
};

export type TransactionsByEmployeeResult = UseTypeBaseByIdResult<Transaction[] | null>;