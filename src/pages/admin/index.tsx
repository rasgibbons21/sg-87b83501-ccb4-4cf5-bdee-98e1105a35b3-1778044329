import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, TrendingUp, Percent } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    mrr: 0,
    affiliateEarnings: 0,
    retention: 0
  });
  const [recentSignups, setRecentSignups] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*");

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active");

      const { data: clicks } = await supabase
        .from("affiliate_clicks")
        .select("commission")
        .gte("clicked_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalMembers = profiles?.filter(p => p.plan === "member").length || 0;
      const mrr = (subscriptions?.length || 0) * 9.99;
      const affiliateEarnings = clicks?.reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
      const retention = totalMembers > 0 ? 95 : 0;

      setStats({ totalMembers, mrr, affiliateEarnings, retention });
    };

    const fetchRecentSignups = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentSignups(data || []);
    };

    fetchStats();
    fetchRecentSignups();
  }, []);

  const revenueData = {
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Subscriptions",
        data: [299, 349, 419, 489, 559, 629],
        backgroundColor: "#2D4A3E"
      },
      {
        label: "Affiliate",
        data: [45, 62, 78, 94, 107, 125],
        backgroundColor: "#C4714A"
      }
    ]
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">Overview</h1>
          <p className="text-sage-600 mt-1">Dashboard and key metrics</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Total Members</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">MRR</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">${stats.mrr.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Affiliate (30d)</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">${stats.affiliateEarnings.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-terracotta-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Retention</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.retention}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Percent className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Revenue (Last 6 Months)</h3>
          <Bar
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Recent Signups</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Name</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Email</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Plan</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Joined</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((user) => (
                  <tr key={user.id} className="border-b border-sage-100 last:border-0">
                    <td className="py-3 text-sm text-sage-900">{user.full_name}</td>
                    <td className="py-3 text-sm text-sage-600">{user.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.plan === "member" ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-sage-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}