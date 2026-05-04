import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-terracotta-500" />
              <span className="text-terracotta-600 text-sm font-medium tracking-wide">Built for women investors</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-sage-900 leading-[1.1] mb-6">
              Invest with <em className="text-sage-700">intention</em>. Fund their future.
            </h1>
            
            <p className="text-lg text-sage-600 mb-8 max-w-xl leading-relaxed">
              The investment education platform designed specifically for women. Learn ETF and stock investing, plan your child's college fund, and manage your budget — all in one place.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="bg-sage-800 hover:bg-sage-900 text-white h-12 px-8">
                Start Free 14 Days
              </Button>
              <Button size="lg" variant="ghost" className="text-sage-700 hover:text-sage-900 hover:bg-sage-50 h-12 px-8">
                See $50 Calculator <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="pt-8 border-t border-sage-200">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-serif font-semibold text-sage-900 mb-1">64%</div>
                  <div className="text-sm text-sage-600">Women never invested</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-semibold text-terracotta-600 mb-1">+0.4%</div>
                  <div className="text-sm text-sage-600">Women outperform men</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-semibold text-champagne-500 mb-1">$18T</div>
                  <div className="text-sm text-sage-600">Women's investable assets</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="bg-white rounded-xl shadow-xl border border-sage-200 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sage-50 rounded-lg p-4">
                  <div className="text-xs text-sage-600 mb-1">Monthly Budget</div>
                  <div className="text-2xl font-serif font-semibold text-sage-900">$385</div>
                  <div className="text-xs text-sage-500 mt-1">Available to invest</div>
                </div>
                <div className="bg-terracotta-100 rounded-lg p-4">
                  <div className="text-xs text-terracotta-700 mb-1">College Fund</div>
                  <div className="text-2xl font-serif font-semibold text-terracotta-600">$42.8K</div>
                  <div className="text-xs text-terracotta-600 mt-1">Projected in 12 years</div>
                </div>
                <div className="bg-champagne-100 rounded-lg p-4">
                  <div className="text-xs text-champagne-700 mb-1">Top Pick</div>
                  <div className="text-2xl font-serif font-semibold text-sage-900">VTI</div>
                  <div className="text-xs text-champagne-600 mt-1">+11.3% avg return</div>
                </div>
                <div className="bg-signal-buy-bg rounded-lg p-4">
                  <div className="text-xs text-signal-buy mb-1">AI Signal</div>
                  <div className="text-2xl font-serif font-semibold text-signal-buy">BUY</div>
                  <div className="text-xs text-signal-buy mt-1">Strong fundamentals</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-sage-50 to-champagne-100 rounded-lg p-4 border border-champagne-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-xs font-medium text-sage-800">Did you know?</span>
                </div>
                <p className="text-sm text-sage-700 leading-relaxed">
                  Women investors consistently outperform men by 0.4% annually. Research shows patience and research-driven decisions lead to better long-term returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}