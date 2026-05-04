"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Budget() {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState({
    housing: 1500,
    food: 600,
    transport: 400,
    childcare: 800,
    bills: 300,
    leisure: 200
  });
  const [collegePercent, setCollegePercent] = useState(20);

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const disposable = income - totalExpenses;
  const collegeAmount = Math.max(0, disposable * (collegePercent / 100));
  const investAmount = Math.max(0, disposable - collegeAmount);

  const expensePercentages = Object.entries(expenses).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    amount: value,
    percent: (value / income) * 100
  }));

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Budget Planner</h1>
          <p className="text-sage-600">Calculate your monthly investing capacity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Monthly Income</h3>
              <div>
                <label className="block text-sm text-sage-600 mb-2">Take-Home Pay</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-800 outline-none font-mono text-lg"
                />
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Monthly Expenses</h3>
              <div className="space-y-3">
                {Object.entries(expenses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-sage-600 mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setExpenses({...expenses, [key]: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-800 outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">College Fund Allocation</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sage-600">Percentage for College</span>
                <span className="font-mono text-lg text-sage-900">{collegePercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={collegePercent}
                onChange={(e) => setCollegePercent(Number(e.target.value))}
                className="w-full accent-sage-800"
              />
              <div className="flex justify-between text-xs text-sage-500 mt-1">
                <span>10%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {expensePercentages.map(item => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-sage-700">{item.name}</span>
                      <span className="font-mono text-sage-900">${item.amount} ({item.percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-sage-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sage-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-xl p-6 text-white">
              <h3 className="text-lg font-serif mb-4">Your Investment Budget</h3>
              
              <div className="space-y-4">
                <div className="bg-sage-700/30 rounded-lg p-4">
                  <div className="text-xs text-sage-200 uppercase tracking-wider mb-1">Disposable Income</div>
                  <div className="text-3xl font-serif">${disposable.toFixed(0)}</div>
                  <div className="text-xs text-sage-300 mt-1">After all expenses</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-champagne-900/20 rounded-lg p-3 border border-champagne-700/30">
                    <div className="text-xs text-champagne-200 uppercase tracking-wider mb-1">College Fund</div>
                    <div className="text-2xl font-serif">${collegeAmount.toFixed(0)}</div>
                    <div className="text-xs text-champagne-300">{collegePercent}% of disposable</div>
                  </div>

                  <div className="bg-sage-700/20 rounded-lg p-3 border border-sage-600/30">
                    <div className="text-xs text-sage-200 uppercase tracking-wider mb-1">Investing</div>
                    <div className="text-2xl font-serif">${investAmount.toFixed(0)}</div>
                    <div className="text-xs text-sage-300">{(100 - collegePercent)}% of disposable</div>
                  </div>
                </div>
              </div>

              <Link href="/app/picks">
                <Button className="w-full mt-6 bg-white text-sage-900 hover:bg-sage-50">
                  View Investment Picks <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}