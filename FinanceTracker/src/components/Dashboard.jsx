import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Pie, Bar, Line } from "react-chartjs-2";
import {Chart as ChartJS,ArcElement,BarElement,CategoryScale,LinearScale,LineElement,PointElement,Tooltip,Legend,} from "chart.js";

ChartJS.register(ArcElement,BarElement,CategoryScale,LinearScale,LineElement,PointElement,Tooltip,Legend);

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://financetrackerbackend-dal1.onrender.com/api/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Fetched analytics:", data);
        setAnalytics({
          pieData: data.pieData || { labels: [], datasets: [] },
          barData: data.barData || { labels: [], datasets: [] },
          lineData: data.lineData || { labels: [], datasets: [] },
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalytics({
          pieData: { labels: [], datasets: [] },
          barData: { labels: [], datasets: [] },
          lineData: { labels: [], datasets: [] },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) return <p className="text-center mt-5">Loading analytics...</p>;
  if (!analytics) return <p className="text-center mt-5">No analytics available.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Category Breakdown</h2>
        {analytics.pieData.labels?.length > 0 ? (
          <Pie data={analytics.pieData} />
        ) : (
          <p>No category data</p>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Income vs Expenses</h2>
        {analytics.barData.labels?.length > 0 ? (
          <Bar data={analytics.barData} />
        ) : (
          <p>No income/expense data</p>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Monthly Trends</h2>
        {analytics.lineData.labels?.length > 0 ? (
          <Line data={analytics.lineData} />
        ) : (
          <p>No trend data</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
