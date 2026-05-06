import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingDown, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersRevenue() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    trialUsers: 0,
    arr: 0,
    churn: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      const usersWithSubs = profiles.map(profile => {
        const userSub = subscriptions?.find(sub => sub.user_id === profile.id);
        return {
          ...profile,
          subscription: userSub,
          status: profile.plan === "member" ? "active" : profile.plan === "trial" ? "trial" : "cancelled"
        };
      });
      setUsers(usersWithSubs);

      const activeCount = profiles.filter(p => p.plan === "member").length;
      const trialCount = profiles.filter(p => p.plan === "trial").length;
      const mrr = activeCount * 9.99;
      const churnRate = profiles.length > 0 ? ((profiles.filter(p => p.plan === "cancelled").length / profiles.length) * 100) : 0;

      setStats({
        activeSubscribers: activeCount,
        trialUsers: trialCount,
        arr: mrr * 12,
        churn: churnRate
      });
    }

    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Plan", "Status", "Joined", "Revenue"];
    const rows = filteredUsers.map(user => [
      user.full_name || "",
      user.email || "",
      user.plan || "",
      user.status || "",
      new Date(user.created_at).toLocaleDateString(),
      user.plan === "member" ? "$9.99" : "$0.00"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloom-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Users & Revenue</h1>
        <p className="text-slate-600">Member management and subscription analytics</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.activeSubscribers}</div>
          <div className="text-sm text-slate-600">Active Subscribers</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-amber-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.trialUsers}</div>
          <div className="text-sm text-slate-600">Trial Users</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Calculator className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">${stats.arr.toFixed(0)}</div>
          <div className="text-sm text-slate-600">Annual Recurring Revenue</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-terracotta-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.churn.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Monthly Churn Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-sage-800">All Users</h2>
          <div className="flex gap-3">
            <Input 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-sage-800 text-white rounded-lg hover:bg-sage-900 transition-colors text-sm font-medium"
            >
              Export to CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Next Billing</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-sage-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-sage-100 hover:bg-sage-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sage-800 text-xs font-medium">
                        {user.full_name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-sage-900">{user.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded uppercase">
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {user.subscription?.next_billing 
                      ? new Date(user.subscription.next_billing).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-3 px-4 font-mono text-sage-900">
                    {user.plan === "member" ? "$9.99" : "$0.00"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.status === "active" ? "bg-green-100 text-green-700" :
                      user.status === "trial" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}