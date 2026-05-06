import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, MousePointer, TrendingUp, Percent } from "lucide-react";

export default function BrokerAffiliates() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalClicks: 0,
    totalSignups: 0,
    avgCommission: 0
  });
  const [brokerData, setBrokerData] = useState<any[]>([]);
  const [pdfData, setPdfData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: clicks } = await supabase.from("affiliate_clicks").select("*");

    if (clicks) {
      const brokerClicks = clicks.filter(c => c.click_type === "broker");
      const pdfClicks = clicks.filter(c => c.click_type === "pdf");

      const totalEarnings = clicks.reduce((sum, c) => sum + (c.commission || 0), 0);
      const totalClicks = clicks.length;
      const totalSignups = clicks.filter(c => c.converted).length;
      const avgCommission = totalSignups > 0 ? totalEarnings / totalSignups : 0;

      setStats({ totalEarnings, totalClicks, totalSignups, avgCommission });

      // Group by broker
      const brokerGroups = brokerClicks.reduce((acc: any, click) => {
        const broker = click.broker_name;
        if (!acc[broker]) {
          acc[broker] = { broker, clicks: 0, signups: 0, commission: 0, total: 0 };
        }
        acc[broker].clicks++;
        if (click.converted) acc[broker].signups++;
        acc[broker].total += click.commission || 0;
        return acc;
      }, {});

      const brokerArray = Object.values(brokerGroups).map((b: any) => ({
        ...b,
        conversion: b.clicks > 0 ? ((b.signups / b.clicks) * 100).toFixed(1) : "0.0",
        commission: b.signups > 0 ? (b.total / b.signups).toFixed(2) : "0.00"
      }));

      setBrokerData(brokerArray);

      // Group by PDF product
      const pdfGroups = pdfClicks.reduce((acc: any, click) => {
        const product = click.product_name || "Unknown";
        if (!acc[product]) {
          acc[product] = { product, clicks: 0, sales: 0, total: 0 };
        }
        acc[product].clicks++;
        if (click.converted) acc[product].sales++;
        acc[product].total += click.commission || 0;
        return acc;
      }, {});

      setPdfData(Object.values(pdfGroups));
    }

    setLoading(false);
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
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Broker Affiliates</h1>
        <p className="text-slate-600">Track affiliate clicks, conversions, and earnings</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">${stats.totalEarnings.toFixed(0)}</div>
          <div className="text-sm text-slate-600">This Month Earnings</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <MousePointer className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.totalClicks}</div>
          <div className="text-sm text-slate-600">Total Clicks</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{stats.totalSignups}</div>
          <div className="text-sm text-slate-600">Total Signups</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Percent className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">${stats.avgCommission.toFixed(2)}</div>
          <div className="text-sm text-slate-600">Avg Commission</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Broker Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Broker</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Clicks</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Signups</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Conv %</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Earned</th>
                </tr>
              </thead>
              <tbody>
                {brokerData.map((broker) => (
                  <tr key={broker.broker} className="border-b border-sage-100">
                    <td className="py-3 px-2 font-medium text-sage-900">{broker.broker}</td>
                    <td className="py-3 px-2 text-slate-600">{broker.clicks}</td>
                    <td className="py-3 px-2 text-slate-600">{broker.signups}</td>
                    <td className="py-3 px-2 text-slate-600">{broker.conversion}%</td>
                    <td className="py-3 px-2 font-mono text-sage-900">${broker.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">PDF Product Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Product</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Clicks</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Sales</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-sage-800">Earned</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.map((pdf: any) => (
                  <tr key={pdf.product} className="border-b border-sage-100">
                    <td className="py-3 px-2 font-medium text-sage-900 text-sm">{pdf.product}</td>
                    <td className="py-3 px-2 text-slate-600">{pdf.clicks}</td>
                    <td className="py-3 px-2 text-slate-600">{pdf.sales}</td>
                    <td className="py-3 px-2 font-mono text-sage-900">${pdf.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8">
        <h2 className="font-serif text-2xl text-sage-800 mb-6">How to Apply</h2>
        <div className="space-y-4">
          {[
            { name: "Fidelity Affiliate Program", url: "https://www.fidelity.com/affiliate-program" },
            { name: "Charles Schwab Referral Program", url: "https://www.schwab.com/affiliate" },
            { name: "Robinhood Referral Program", url: "https://robinhood.com/us/en/support/articles/robinhood-referral-program/" },
            { name: "Payhip Affiliate Dashboard", url: "https://payhip.com/affiliates" }
          ].map((program) => (
            <a
              key={program.name}
              href={program.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
            >
              <span className="font-medium text-sage-900">{program.name}</span>
              <span className="text-sage-600 text-sm">Visit →</span>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}