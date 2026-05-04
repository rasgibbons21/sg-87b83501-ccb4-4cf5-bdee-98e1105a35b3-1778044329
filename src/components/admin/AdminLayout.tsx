import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CrawlerTicker } from "@/components/CrawlerTicker";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileEdit, DollarSign, Key, FileText, Settings, LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/picks", label: "Picks Editor", icon: FileEdit },
    { href: "/admin/affiliates", label: "Affiliates", icon: DollarSign },
    { href: "/admin/apikeys", label: "API Keys", icon: Key },
    { href: "/admin/pdfs", label: "PDF Products", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <CrawlerTicker />
      
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-[34px] z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sage-800 font-serif text-2xl font-semibold leading-none">Bloom Admin</span>
                <span className="text-[9px] uppercase tracking-widest text-sage-400 leading-none mt-0.5">by Cinder Vault</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full">
                <div className="w-7 h-7 rounded-full bg-sage-800 flex items-center justify-center text-white text-xs font-medium">
                  {profile?.full_name?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="text-sm text-sage-800 font-medium">{profile?.full_name || "Admin"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-sage-700 hover:text-sage-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-[1400px]">
        <div className="grid grid-cols-[210px_1fr] gap-8">
          <aside className="sticky top-[130px] h-fit">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-sage-800 text-white"
                        : "text-sage-700 hover:bg-sage-50 hover:text-sage-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}