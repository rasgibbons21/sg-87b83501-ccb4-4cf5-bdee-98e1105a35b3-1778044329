import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, MousePointerClick, Users, TrendingUp, ExternalLink } from "lucide-react";

export default function AdminAffiliates() {
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    totalClicks: 0,
    totalSignups: 0,
    avgCommission: 0
  });
  const [brokerData, setBrokerData] = useState<any[]>([]);
  const [pdfData, setPdfData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: clicks } = await supabase
        .from("affiliate_clicks")
        .select("*")
        .gte("clicked_at", thirtyDaysAgo);

      const monthlyEarnings = clicks?.reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
      const totalClicks = clicks?.length || 0;
      const totalSignups = clicks?.filter(c => c.converted).length || 0;
      const avgCommission = totalSignups > 0 ? monthlyEarnings / totalSignups : 0;

      setStats({ monthlyEarnings, totalClicks, totalSignups, avgCommission });

      // Group by broker
      const brokerGroups = clicks?.filter(c => c.click_type === "broker")
        .reduce((acc: any, click) => {
          const broker = click.broker_name;
          if (!acc[broker]) {
            acc[broker] = { clicks: 0, signups: 0, earnings: 0 };
          }
          acc[broker].clicks++;
          if (click.converted) {
            acc[broker].signups++;
            acc[broker].earnings += click.commission || 0;
          }
          return acc;
        }, {});

      setBrokerData(
        Object.entries(brokerGroups || {}).map(([name, data]: any) => ({
          name,
          clicks: data.clicks,
          signups: data.signups,
          conversion: ((data.signups / data.clicks) * 100).toFixed(1),
          commission: (data.earnings / data.signups).toFixed(2),
          total: data.earnings.toFixed(2)
        }))
      );

      // Group by PDF
      const pdfGroups = clicks?.filter(c => c.click_type === "pdf")
        .reduce((acc: any, click) => {
          const product = click.product_name;
          if (!acc[product]) {
            acc[product] = { clicks: 0, sales: 0, earnings: 0 };
          }
          acc[product].clicks++;
          if (click.converted) {
            acc[product].sales++;
            acc[product].earnings += click.commission || 0;
          }
          return acc;
        }, {});

      setPdfData(
        Object.entries(pdfGroups || {}).map(([name, data]: any) => ({
          name,
          clicks: data.clicks,
          sales: data.sales,
          earnings: data.earnings.toFixed(2)
        }))
      );
    };
    fetchData();
  }, []);

  const affiliatePrograms = [
    { name: "Fidelity", url: "https://advisors.fidelity.com" },
    { name: "Charles Schwab", url: "https://www.schwabadvisorservices.com" },
    { name: "Vanguard", url: "https://advisors.vanguard.com" },
    { name: "Robinhood", url: "https://impact.com" },
    { name: "M1 Finance", url: "https://m1.com/affiliates" },
    { name: "Acorns", url: "https://acorns.com/affiliates" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">Broker Affiliates</h1>
          <p className="text-sage-600 mt-1">Track affiliate earnings and performance</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Monthly Earnings</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">
                  ${stats.monthlyEarnings.toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-terracotta-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Total Clicks</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.totalClicks}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Total Signups</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">{stats.totalSignups}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-sage-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Avg Commission</p>
                <p className="text-3xl font-serif font-semibold text-sage-900 mt-1">
                  ${stats.avgCommission.toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-terracotta-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Broker Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Broker</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Clicks</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Signups</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Conversion</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Commission/Signup</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {brokerData.map((broker) => (
                  <tr key={broker.name} className="border-b border-sage-100 last:border-0">
                    <td className="py-3 text-sm text-sage-900">{broker.name}</td>
                    <td className="py-3 text-sm text-sage-600">{broker.clicks}</td>
                    <td className="py-3 text-sm text-sage-600">{broker.signups}</td>
                    <td className="py-3 text-sm text-sage-600">{broker.conversion}%</td>
                    <td className="py-3 text-sm font-mono text-sage-900">${broker.commission}</td>
                    <td className="py-3 text-sm font-mono text-sage-900">${broker.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">PDF Product Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Product</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Clicks</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Sales</th>
                  <th className="text-left text-sm font-medium text-sage-700 pb-3">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.map((product) => (
                  <tr key={product.name} className="border-b border-sage-100 last:border-0">
                    <td className="py-3 text-sm text-sage-900">{product.name}</td>
                    <td className="py-3 text-sm text-sage-600">{product.clicks}</td>
                    <td className="py-3 text-sm text-sage-600">{product.sales}</td>
                    <td className="py-3 text-sm font-mono text-sage-900">${product.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Affiliate Program Applications</h3>
          <p className="text-sm text-sage-600 mb-4">
            Apply to these broker affiliate programs to start earning commissions on member signups:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {affiliatePrograms.map((program) => (
              <a
                key={program.name}
                href={program.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-sage-200 rounded-lg hover:border-sage-400 transition-colors"
              >
                <span className="text-sm font-medium text-sage-900">{program.name}</span>
                <ExternalLink className="w-4 h-4 text-sage-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}