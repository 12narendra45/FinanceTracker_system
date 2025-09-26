import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import TransactionList from "../components/TransactionList";
import TransactionForm from "../components/TransactionForm";

const Home = () => {
  const { token, user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const canEdit = user?.role === "admin" || user?.role === "user";

  const fetchTransactions = async (filters = {}, resetPage = false) => {
    if (!token) return;

    if (resetPage) setPage(1);

    const params = new URLSearchParams({
      page: resetPage ? 1 : page,
      limit,
      ...filters, 
    });

    try {
      const res = await fetch(`https://financetrackerbackend-dal1.onrender.com/api/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
      setTotalPages(data?.pages || 1);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setTotalPages(1);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [page, token]);

  const totals = useMemo(() => {
    let income = 0,
      expense = 0;
    (transactions || []).forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else if (tx.type === "expense") expense += tx.amount;
    });
    return { income, expense };
  }, [transactions]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Transactions</h1>
      <div className="mb-4 bg-white p-4 rounded shadow">
        <p>Total Income: <span className="text-green-600">${totals.income}</span></p>
        <p>Total Expense: <span className="text-red-600">${totals.expense}</span>
</p>
      </div>
      {canEdit && <TransactionForm fetchTransactions={fetchTransactions} />}
      <TransactionList transactions={transactions} fetchTransactions={fetchTransactions} />
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          disabled={page === 1}
        >Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
