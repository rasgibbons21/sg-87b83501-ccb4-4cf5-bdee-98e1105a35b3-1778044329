import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { CrawlerTicker } from "@/components/CrawlerTicker";
import { LogOut, BarChart3, Users, Edit3, DollarSign, Key, FileText, Settings } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (data?.role !== "admin") {
      router.push("/app/dashboard");
      return;
    }
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Users & Revenue", href: "/admin/users", icon: Users },
    { name: "Picks Editor", href: "/admin/picks", icon: Edit3 },
    { name: "Broker Affiliates", href: "/admin/affiliates", icon: DollarSign },
    { name: "API Keys", href: "/admin/apikeys", icon: Key },
    { name: "PDF Products", href: "/admin/pdfs", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <CrawlerTicker />
      
      <header className="border-b border-sage-200 bg-white sticky top-[34px] z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <span className="text-sm">🌿</span>
              </div>
              <div>
                <span className="text-sage-800 font-serif text-xl font-semibold leading-none">Bloom</span>
                <span className="text-xs text-slate-400 ml-2 uppercase tracking-wider">Admin</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-sage-50 px-3 py-1.5 rounded-full border border-sage-100">
                <div className="w-6 h-6 rounded-full bg-sage-200 flex items-center justify-center text-sage-800 text-xs font-medium">
                  {profile?.full_name?.charAt(0) || "A"}
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

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r border-sage-200 sticky top-[98px] h-[calc(100vh-98px)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = router.pathname === link.href || (link.href !== "/admin" && router.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-sage-100 text-sage-900 font-medium" : "text-slate-600 hover:bg-sage-50 hover:text-sage-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}