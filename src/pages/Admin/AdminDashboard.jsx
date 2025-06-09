import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchAdminDashboard, fetchAdminTrends } from "@/services/adminService";
import { Bar, Line } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [dashboardRes, trendsRes] = await Promise.all([fetchAdminDashboard(), fetchAdminTrends()]);
      setStats(dashboardRes.data.data);
      setTrends(trendsRes.data.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="text-blue-600">📊</span> Admin Dashboard
        </h2>
        <p className="text-zinc-500 text-sm mb-4">Statistik dan tren aktivitas platform.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.totalPosts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Banned Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.bannedUsers}</CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Trend (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: trends.userTrendMonth.map((d) => d.month),
                datasets: [
                  {
                    label: "Users",
                    data: trends.userTrendMonth.map((d) => d.count),
                    borderColor: "#6366f1",
                    backgroundColor: "#6366f1",
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Post Trend (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: trends.postTrendMonth.map((d) => d.month),
                datasets: [
                  {
                    label: "Posts",
                    data: trends.postTrendMonth.map((d) => d.count),
                    backgroundColor: "#f59e42",
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
