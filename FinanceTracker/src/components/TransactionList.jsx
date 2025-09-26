import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";

const TransactionList = ({ transactions, fetchTransactions, users }) => {
  const { token, user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const list = transactions || [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userFilter, setUserFilter] = useState(""); 
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const expenseCategories = ["Food", "Rent", "Utilities", "Entertainment", "Other"];
  const incomeCategories = ["Salary", "Bonus", "Interest", "Other"];
  

  const categories = Array.from(new Set(
    typeFilter === "income"
      ? incomeCategories
      : typeFilter === "expense"
      ? expenseCategories
      : [...expenseCategories, ...incomeCategories]
  ));

  useEffect(() => {
    const filterOptions = { q: search, type: typeFilter, category: categoryFilter };
    if (isAdmin && userFilter) filterOptions.user = userFilter;
    fetchTransactions(filterOptions, true);
  }, [search, typeFilter, categoryFilter, userFilter]);

  const handleDelete = async (id) => {
    await fetch(`https://financetrackerbackend-dal1.onrender.com/api/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTransactions();
  };

  const handleEditInit = (tx) => {
    setEditingId(tx._id);
    setEditData({ ...tx });
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditSave = async () => {
    try {
      await fetch(`https://financetrackerbackend-dal1.onrender.com/api/transactions/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      setEditingId(null);
      setEditData({});
      fetchTransactions();
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="bg-white rounded shadow p-4 overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">
              Type
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCategoryFilter("");
                }}
                className="border ml-1 p-1 rounded"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </th>
            <th className="border px-2 py-1">
              Category
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border ml-1 p-1 rounded"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </th>
            <th className="border px-2 py-1">
              Note
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border ml-1 p-1 rounded w-full"
              />
            </th>
            {isAdmin && (
              <th className="border px-2 py-1">
                User
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="border ml-1 p-1 rounded"
                >
                  <option value="">All</option>
                  {users?.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username || u.email}
                    </option>
                  ))}
                </select>
              </th>
            )}
            {(isAdmin || user?.role === "user") && <th className="border px-2 py-1">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td
                colSpan={(isAdmin ? 7 : 6)}
                className="border px-2 py-4 text-center text-gray-500"
              >
                No transactions found
              </td>
            </tr>
          ) : (
            list.map((tx) => {
              const transactionOwnerId = tx.user?._id || tx.user;
              const canEditThisTx = isAdmin || (user?.role === "user" && transactionOwnerId === user._id);

              return (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">
                    {editingId === tx._id ? (
                      <input
                        type="date"
                        value={editData.date.split("T")[0]}
                        onChange={(e) => handleEditChange("date", e.target.value)}
                        className="border p-1 rounded"
                      />
                    ) : (
                      new Date(tx.date).toLocaleDateString()
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingId === tx._id ? (
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => handleEditChange("amount", e.target.value)}
                        className="border p-1 rounded w-20"
                      />
                    ) : (
                      `$${tx.amount}`
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingId === tx._id ? (
                      <select
                        value={editData.type}
                        onChange={(e) => handleEditChange("type", e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    ) : (
                      tx.type
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingId === tx._id ? (
                      <select
                        value={editData.category}
                        onChange={(e) => handleEditChange("category", e.target.value)}
                        className="border p-1 rounded"
                      >
                        {(editData.type === "income" ? incomeCategories : expenseCategories).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      tx.category
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingId === tx._id ? (
                      <input
                        type="text"
                        value={editData.note}
                        onChange={(e) => handleEditChange("note", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      tx.note
                    )}
                  </td>
                  {isAdmin && (
                    <td className="border px-2 py-1">
                      {tx.user ? tx.user.username || tx.user.email : "Unknown User"}
                    </td>
                  )}
                  {(isAdmin || user?.role === "user") && (
                    <td className="border px-2 py-1 flex gap-2">
                      {canEditThisTx ? (
                        editingId === tx._id ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditInit(tx)}
                              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
