"use client";

import { useEffect, useState } from "react";

interface PriceData {
  ticker: string;
  price: number;
  changePct: number;
  priceUp: boolean;
}

export function CrawlerTicker() {
  const [prices, setPrices] = useState<PriceData[]>([]);

  // Mock initial prices for immediate display
  const mockPrices: PriceData[] = [
    { ticker: "VTI", price: 245.32, changePct: 0.42, priceUp: true },
    { ticker: "QQQ", price: 387.14, changePct: -0.18, priceUp: false },
    { ticker: "SCHD", price: 78.92, changePct: 0.28, priceUp: true },
    { ticker: "BND", price: 72.45, changePct: -0.05, priceUp: false },
    { ticker: "AAPL", price: 178.32, changePct: 1.24, priceUp: true },
    { ticker: "MSFT", price: 412.85, changePct: 0.87, priceUp: true },
    { ticker: "NVDA", price: 486.73, changePct: 2.15, priceUp: true },
    { ticker: "JNJ", price: 156.42, changePct: -0.32, priceUp: false },
    { ticker: "TSLA", price: 242.18, changePct: -1.42, priceUp: false },
    { ticker: "SPY", price: 498.67, changePct: 0.55, priceUp: true },
    { ticker: "GLD", price: 182.94, changePct: 0.12, priceUp: true },
    { ticker: "VXUS", price: 62.18, changePct: 0.38, priceUp: true },
  ];

  useEffect(() => {
    setPrices(mockPrices);

    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices");
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  // Duplicate the array to create seamless loop
  const displayPrices = [...prices, ...prices];

  return (
    <div className="sticky top-0 z-[300] h-[34px] bg-sage-800 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-sage-800 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-sage-800 to-transparent z-10" />
      
      <div className="flex items-center h-full animate-crawl whitespace-nowrap">
        {displayPrices.map((item, index) => (
          <div key={`${item.ticker}-${index}`} className="inline-flex items-center gap-2 px-6 font-mono text-[11px]">
            <span className="text-champagne-400 font-semibold">{item.ticker}</span>
            <span className="text-white/90">${item.price.toFixed(2)}</span>
            <span className={item.priceUp ? "text-[#6DD6A0]" : "text-[#F09090]"}>
              {item.priceUp ? "+" : ""}{item.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}