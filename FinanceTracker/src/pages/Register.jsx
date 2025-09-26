import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaUsers } from "react-icons/fa";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("https://financetrackerbackend-dal1.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
         throw new Error(data.message);
      }else{
        navigate("/login");
        alert(data.message);
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-200 to-indigo-200">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Register</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex items-center border p-2 mb-4 rounded">
          <FaUser className="mr-2 text-gray-400" />
          <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full outline-none" required/>
        </div>
        <div className="flex items-center border p-2 mb-4 rounded">
          <FaEnvelope className="mr-2 text-gray-400" />
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full outline-none" required/>
        </div>
        <div className="flex items-center border p-2 mb-4 rounded">
          <FaLock className="mr-2 text-gray-400" />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full outline-none" required/>
        </div>
        <div className="flex items-center border p-2 mb-4 rounded">
          <FaUsers className="mr-2 text-gray-400" />
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full outline-none">
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="read-only">Read-only</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 w-full rounded hover:bg-indigo-700">Register</button>
      </form>
    </div>
  );
};
export default Register;
