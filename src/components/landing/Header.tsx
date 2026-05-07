"use client";

import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signup");
  const [activeMenu, setActiveMenu] = useState<"etfs" | "stocks" | null>(null);

  const openAuth = (view: "signin" | "signup") => {
    setAuthView(view);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-[34px] z-50 bg-white/95 backdrop-blur border-b border-sage-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-sage-800 leading-none">Bloom</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">by Cinder Vault</div>
              </div>
            </div>

            {/* ETFs & Stocks Menu */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveMenu(activeMenu === "etfs" ? null : "etfs")}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeMenu === "etfs" 
                    ? "bg-sage-800 text-white" 
                    : "text-sage-700 hover:bg-sage-50"
                }`}
              >
                ETFs
              </button>
              <button
                onClick={() => setActiveMenu(activeMenu === "stocks" ? null : "stocks")}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeMenu === "stocks" 
                    ? "bg-sage-800 text-white" 
                    : "text-sage-700 hover:bg-sage-50"
                }`}
              >
                Stocks
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth("signin")}
                className="px-5 py-2 text-sage-700 hover:text-sage-900 font-medium text-sm transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="px-6 py-2.5 bg-sage-800 hover:bg-sage-900 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialView={authView}
      />
    </>
  );
}