import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingUp, Percent } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminOverview() {
  const [stats, setStats] = useState({
    members: 0,
    mrr: 0,
    affiliateEarnings: 0,
    retention: 0
  });
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: subscriptions } = await supabase.from("subscriptions").select("*").eq("status", "active");
    const { data: affiliates } = await supabase.from("affiliate_clicks").select("*");

    const membersCount = profiles?.filter(p => p.plan === "member").length || 0;
    const mrr = (subscriptions?.length || 0) * 9.99;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const affiliateTotal = affiliates?.filter(a => a.clicked_at?.startsWith(thisMonth)).reduce((sum, a) => sum + (a.commission || 0), 0) || 0;
    const retention = membersCount > 0 ? ((membersCount / (profiles?.length || 1)) * 100) : 0;

    setStats({ members: membersCount, mrr, affiliateEarnings: affiliateTotal, retention });

    const recent = profiles?.slice(0, 10).map(p => ({
      ...p,
      status: p.plan === "member" ? "active" : p.plan === "trial" ? "trial" : "cancelled"
    })) || [];
    setRecentSignups(recent);
    setLoading(false);
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Subscriptions",
        data: [299, 399, 499, 599, 699, 799],
        backgroundColor: "#4A7A63",
      },
      {
        label: "Affiliate Earnings",
        data: [45, 67, 89, 102, 134, 156],
        backgroundColor: "#D4AF6A",
      }
    ]
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Overview</h1>
        <p className="text-slate-600">Platform analytics and recent activity</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.members}</div>
          <div className="text-sm text-slate-600">Total Members</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">${stats.mrr.toFixed(0)}</div>
          <div className="text-sm text-slate-600">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">${stats.affiliateEarnings.toFixed(0)}</div>
          <div className="text-sm text-slate-600">Affiliate Earnings (This Month)</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Percent className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.retention.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Retention Rate</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <h2 className="font-serif text-xl text-sage-800 mb-4">Revenue Trends</h2>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <h2 className="font-serif text-xl text-sage-800 mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {recentSignups.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sage-800 text-xs font-medium">
                    {user.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="font-medium text-sage-900 text-sm">{user.full_name || user.email}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  user.status === "active" ? "bg-green-100 text-green-700" :
                  user.status === "trial" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}