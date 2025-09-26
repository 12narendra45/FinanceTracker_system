import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/authContext";

const TransactionForm = ({ fetchTransactions }) => {
  const { token, user } = useContext(AuthContext);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food"); 
  const [note, setNote] = useState("");

  const expenseCategories = ["Food", "Travel", "Entertainment", "Rent", "Utilities", "Other"];
  const incomeCategories = ["Salary", "Bonus", "Interest", "Other"];

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    setCategory(newType === "income" ? incomeCategories[0] : expenseCategories[0]);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!(user?.role === "admin" || user?.role === "user")) return;

    try {
      await fetch("https://financetrackerbackend-dal1.onrender.com/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, type, category, note }),
      });
      setAmount("");
      setNote("");
      fetchTransactions();
    } catch (err) {
      console.error("Error creating transaction:", err);
    }
  }, [amount, type, category, note, token, user, fetchTransactions]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-4"
    >
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <select
        value={type}
        onChange={handleTypeChange} 
        className="border p-2 rounded"
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="border p-2 rounded"
        required
      >
        {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="border p-2 rounded md:col-span-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded col-span-1 md:col-span-5 mt-2 hover:bg-blue-600"
      >
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
