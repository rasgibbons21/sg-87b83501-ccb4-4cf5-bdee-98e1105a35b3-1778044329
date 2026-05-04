"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface CalculatorResult {
  strategy: string;
  invested: number;
  value: number;
  gain: number;
}

export function Calculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(50);
  const [timePeriod, setTimePeriod] = useState(5);
  const [strategy, setStrategy] = useState<"etf" | "stock" | "both">("both");

  const calculateFV = (monthly: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    return monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  };

  const results: CalculatorResult[] = [
    {
      strategy: "ETFs Only",
      invested: monthlyAmount * timePeriod * 12,
      value: calculateFV(monthlyAmount, 0.113, timePeriod),
      gain: 0,
    },
    {
      strategy: "Stocks Only",
      invested: monthlyAmount * timePeriod * 12,
      value: calculateFV(monthlyAmount, 0.142, timePeriod),
      gain: 0,
    },
    {
      strategy: "Alternating Both",
      invested: monthlyAmount * timePeriod * 12,
      value: calculateFV(monthlyAmount, 0.128, timePeriod),
      gain: 0,
    },
  ];

  results.forEach((r) => {
    r.gain = r.value - r.invested;
  });

  const selectedResult = results.find((r) => {
    if (strategy === "etf") return r.strategy === "ETFs Only";
    if (strategy === "stock") return r.strategy === "Stocks Only";
    return r.strategy === "Alternating Both";
  });

  const generateAnalysis = () => {
    const result = selectedResult!;
    const gainPct = (result.gain / result.invested) * 100;
    if (timePeriod >= 10) {
      return `Over ${timePeriod} years, your $${monthlyAmount}/month habit becomes ${result.value.toFixed(0)} dollars. That's ${gainPct.toFixed(0)}% growth from compounding alone — money working while you sleep.`;
    } else if (timePeriod >= 5) {
      return `In ${timePeriod} years, you'll turn $${result.invested.toFixed(0)} into $${result.value.toFixed(0)}. The ${result.strategy.toLowerCase()} approach gives you a ${gainPct.toFixed(0)}% return through steady contributions.`;
    } else {
      return `Even in ${timePeriod} year${timePeriod > 1 ? "s" : ""}, $${monthlyAmount} monthly grows to $${result.value.toFixed(0)}. Start small, stay consistent — that's how wealth builds.`;
    }
  };

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-terracotta-500" />
            <span className="text-terracotta-600 text-sm font-medium tracking-wide">The $50 Moment</span>
            <div className="h-px w-12 bg-terracotta-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-sage-900 mb-4">
            What does $50/month <em className="text-sage-700">actually</em> become?
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            Move the sliders and watch real numbers. This is the calculator that changed everything for 2,400+ women.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-sage-50 rounded-xl p-8 border border-sage-200">
            <h3 className="text-xl font-serif font-semibold text-sage-900 mb-6">Your inputs</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Monthly amount
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="flex-1 h-2 bg-sage-200 rounded-lg appearance-none cursor-pointer accent-sage-800"
                  />
                  <div className="text-2xl font-mono font-semibold text-sage-900 w-24 text-right">
                    ${monthlyAmount}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Time period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-sage-300 rounded-lg text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-800"
                >
                  <option value={1}>1 year</option>
                  <option value={3}>3 years</option>
                  <option value={5}>5 years</option>
                  <option value={10}>10 years</option>
                  <option value={20}>20 years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-3">
                  Strategy
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStrategy("etf")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      strategy === "etf"
                        ? "bg-sage-800 text-white shadow-lg"
                        : "bg-white text-sage-700 border border-sage-300 hover:border-sage-400"
                    }`}
                  >
                    ETFs Only
                  </button>
                  <button
                    onClick={() => setStrategy("stock")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      strategy === "stock"
                        ? "bg-sage-800 text-white shadow-lg"
                        : "bg-white text-sage-700 border border-sage-300 hover:border-sage-400"
                    }`}
                  >
                    Stocks Only
                  </button>
                  <button
                    onClick={() => setStrategy("both")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      strategy === "both"
                        ? "bg-sage-800 text-white shadow-lg"
                        : "bg-white text-sage-700 border border-sage-300 hover:border-sage-400"
                    }`}
                  >
                    Both
                  </button>
                </div>
                <p className="text-xs text-sage-600 mt-3">
                  <strong>Alternating Both:</strong> Invest in ETFs one month, stocks the next. Balances stability with growth potential.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-sage-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-sage-50 border-b border-sage-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sage-900">Strategy</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-sage-900">Invested</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-sage-900">Value</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-sage-900">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => {
                    const isSelected = result === selectedResult;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-sage-100 ${
                          isSelected ? "bg-sage-50" : "hover:bg-sage-50/50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-sage-900">
                          {result.strategy}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-mono text-sage-700">
                          ${result.invested.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-mono font-semibold text-sage-900">
                          ${result.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-mono text-signal-buy">
                          +${result.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-br from-sage-50 to-champagne-100 rounded-xl p-6 border border-champagne-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-champagne-500" />
                <span className="text-sm font-semibold text-sage-900">AI analysis</span>
              </div>
              <p className="text-sage-700 leading-relaxed italic">
                {generateAnalysis()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}