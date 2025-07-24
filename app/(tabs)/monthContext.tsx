import React, { createContext, useContext, useState } from 'react';

const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState({ month: null, year: null });
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]); // { date, category, amount, note }

  const addExpense = (expense) => setExpenses((prev) => [...prev, expense]);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth, income, setIncome, expenses, addExpense, totalSpent }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => useContext(MonthContext); 