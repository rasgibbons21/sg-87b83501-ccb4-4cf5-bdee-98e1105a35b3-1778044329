import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { CrawlerTicker } from "@/components/CrawlerTicker";
import { LogOut, User } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (!data?.onboarding_completed && router.pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/app/dashboard" },
    { name: "Picks", href: "/app/picks" },
    { name: "Watchlist", href: "/app/watchlist" },
    { name: "Budget", href: "/app/budget" },
    { name: "College Fund", href: "/app/college" },
    { name: "Brokers", href: "/app/brokers" },
    { name: "Guides", href: "/app/guides" },
    { name: "Get App", href: "/app/getapp" },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <CrawlerTicker />
      
      <header className="border-b border-sage-200 bg-white sticky top-[34px] z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/app/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <span className="text-sm">🌿</span>
              </div>
              <span className="text-sage-800 font-serif text-xl font-semibold leading-none hidden sm:block">Bloom</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 overflow-x-auto">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`text-sm whitespace-nowrap transition-colors ${
                    router.pathname === link.href ? "text-sage-900 font-medium" : "text-sage-600 hover:text-sage-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-sage-50 px-3 py-1.5 rounded-full border border-sage-100">
                <div className="w-6 h-6 rounded-full bg-sage-200 flex items-center justify-center text-sage-800 text-xs font-medium">
                  {profile?.full_name?.charAt(0) || <User className="w-3 h-3" />}
                </div>
                <span className="text-sm font-medium text-sage-900 hidden sm:block">
                  {profile?.full_name?.split(" ")[0]}
                </span>
              </div>
              <button onClick={handleSignOut} className="text-sage-500 hover:text-terracotta-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}