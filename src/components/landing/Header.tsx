"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-[34px] z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sage-800 font-serif text-2xl font-semibold leading-none">Bloom</span>
                <span className="text-[9px] uppercase tracking-widest text-sage-400 leading-none mt-0.5">by Cinder Vault</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#calculator" className="text-sm text-sage-700 hover:text-sage-900 transition-colors">
                Calculator
              </Link>
              <Link href="#stories" className="text-sm text-sage-700 hover:text-sage-900 transition-colors">
                Stories
              </Link>
              <Link href="#guides" className="text-sm text-sage-700 hover:text-sage-900 transition-colors">
                Guides
              </Link>
              <Link href="#brokers" className="text-sm text-sage-700 hover:text-sage-900 transition-colors">
                Brokers
              </Link>
              <Link href="#pricing" className="text-sm text-sage-700 hover:text-sage-900 transition-colors">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setAuthModalOpen(true)}
                className="text-sage-700 hover:text-sage-900 hover:bg-sage-50"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-sage-800 hover:bg-sage-900 text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}