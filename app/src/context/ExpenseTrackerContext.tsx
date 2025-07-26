import React, { createContext, useReducer, ReactNode } from "react";
import uuid from "react-native-uuid";

// Define types
type Record = {
  id: string;
  type: "expense" | "income";
  date: string;
  amount: number;
  currency: string;
  accountId: string;
  categoryId: string;
  notes?: string;
};

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

type Category = {
  id: string;
  name: string;
  type: "expense" | "income";
};

type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: "weekly" | "monthly";
};

type State = {
  records: Record[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
};

type Action =
  | { type: "ADD_RECORD"; payload: Record }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "UPDATE_RECORDS"; payload: Record[] };

// Initial data
const initialCategories: Category[] = [
  { id: uuid.v4(), name: "Groceries", type: "expense" },
  { id: uuid.v4(), name: "Rent", type: "expense" },
  { id: uuid.v4(), name: "Utilities", type: "expense" },
  { id: uuid.v4(), name: "Transportation", type: "expense" },
  { id: uuid.v4(), name: "Entertainment", type: "expense" },
  { id: uuid.v4(), name: "Dining Out", type: "expense" },
  { id: uuid.v4(), name: "Salary", type: "income" },
  { id: uuid.v4(), name: "Freelance", type: "income" },
  { id: uuid.v4(), name: "Investments", type: "income" },
];

const initialAccounts: Account[] = [
  { id: uuid.v4(), name: "Checking", balance: 1000.0, currency: "USD" },
  { id: uuid.v4(), name: "Savings", balance: 5000.0, currency: "USD" },
  { id: uuid.v4(), name: "Cash", balance: 200.0, currency: "USD" },
];

const initialState: State = {
  records: [],
  accounts: initialAccounts,
  categories: initialCategories,
  budgets: [],
};

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_RECORD":
      return { ...state, records: [...state.records, action.payload] };
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "ADD_BUDGET":
      return { ...state, budgets: [...state.budgets, action.payload] };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
        // Optionally, remove records and budgets associated with this category:
        records: state.records.filter((rec) => rec.categoryId !== action.payload),
        budgets: state.budgets.filter((bud) => bud.categoryId !== action.payload),
      };
    case "UPDATE_RECORDS":
      return {
        ...state,
        records: action.payload,
      };
    default:
      return state;
  }
};

// Context
interface ExpenseTrackerContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

export type { Category, Record };
export const ExpenseTrackerContext = createContext<ExpenseTrackerContextType>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export const ExpenseTrackerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ExpenseTrackerContext.Provider value={{ state, dispatch }}>
      {children}
    </ExpenseTrackerContext.Provider>
  );
};
