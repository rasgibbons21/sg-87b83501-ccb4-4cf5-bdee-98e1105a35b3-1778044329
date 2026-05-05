import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, DollarSign, Users, TrendingUp, Percent } from "lucide-react";

export default function AdminUsers() {
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    trialUsers: 0,
    arr: 0,
    churn: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*, subscriptions(*)");
      
      const activeSubscribers = profiles?.filter(p => 
        p.subscriptions?.some((s: any) => s.status === "active")
      ).length || 0;
      
      const trialUsers = profiles?.filter(p => p.plan === "trial").length || 0;
      const arr = activeSubscribers * 9.99 * 12;
      const churn = activeSubscribers > 0 ? 5 : 0;

      setStats({ activeSubscribers, trialUsers, arr, churn });
      setUsers(profiles || []);
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const csv = [
      ["Name", "Email", "Plan", "Status", "Joined"],
      ...filteredUsers.map(u => [
        u.full_name,
        u.email,
        u.plan,
        u.subscriptions?.[0]?.status || "trial",
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bloom-users.csv";
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-sage-900">Users & Revenue</h1>
            <p className="text-sage-600 mt-1">Member management and subscription tracking</p>
          </div>
          <Button onClick={exportCSV} className="bg-sage-800 hover:bg-sage-900">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Active Subscribers</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.activeSubscribers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Trial Users</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.trialUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">ARR</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">${stats.arr.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Monthly Churn</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.churn}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Percent className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Name</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Email</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Plan</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Next Billing</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Revenue</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const subscription = user.subscriptions?.[0];
                  const status = subscription?.status || "trial";
                  const revenue = status === "active" ? "$9.99/mo" : "$0";
                  
                  return (
                    <tr key={user.id} className="border-b border-sage-100 last:border-0">
                      <td className="py-3 text-sm text-sage-900">{user.full_name || "—"}</td>
                      <td className="py-3 text-sm text-sage-600">{user.email}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.plan === "member" ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-sage-600">
                        {subscription?.next_billing 
                          ? new Date(subscription.next_billing).toLocaleDateString()
                          : user.trial_ends_at 
                            ? new Date(user.trial_ends_at).toLocaleDateString()
                            : "—"
                        }
                      </td>
                      <td className="py-3 text-sm font-mono text-sage-900">{revenue}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === "active" ? "bg-green-100 text-green-800" :
                          status === "trial" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}