"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState<"trial" | "member">("trial");

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Check user profile for role and onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      window.location.href = "/admin";
    } else if (!profile?.onboarding_completed) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/app/dashboard";
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          plan: plan,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Update profile with plan
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName, plan: plan })
        .eq("id", data.user.id);

      window.location.href = "/onboarding";
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-sage-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold text-sage-900">
            {view === "signin" ? "Welcome back" : "Join Bloom"}
          </h2>
          <button
            onClick={onClose}
            className="text-sage-600 hover:text-sage-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {view === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-800"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-800 hover:bg-sage-900 text-white h-12"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                <p className="text-xs text-sage-700">
                  <strong>Demo hint:</strong> Use admin@bloom.com to access admin panel, or any other email for member app.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="text-sm text-sage-700 hover:text-sage-900"
                >
                  Don't have an account? <strong>Sign up</strong>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-800"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-3">
                  Choose your plan
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPlan("trial")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      plan === "trial"
                        ? "border-sage-800 bg-sage-50"
                        : "border-sage-200 hover:border-sage-400"
                    }`}
                  >
                    <div className="font-semibold text-sage-900">Free Trial</div>
                    <div className="text-sm text-sage-600">14 days free</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("member")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      plan === "member"
                        ? "border-sage-800 bg-sage-50"
                        : "border-sage-200 hover:border-sage-400"
                    }`}
                  >
                    <div className="font-semibold text-sage-900">Member</div>
                    <div className="text-sm text-sage-600">$9.99/month</div>
                  </button>
                </div>
              </div>

              {plan === "member" && (
                <div className="bg-champagne-100 rounded-lg p-4 border border-champagne-200">
                  <p className="text-sm text-sage-700 mb-3">
                    PayPal subscription will be set up after account creation during onboarding.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-800 hover:bg-sage-900 text-white h-12"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                <p className="text-xs text-sage-700">
                  <strong>Demo hint:</strong> Use admin@bloom.com to access admin panel, or any other email for member app.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-sm text-sage-700 hover:text-sage-900"
                >
                  Already have an account? <strong>Sign in</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}