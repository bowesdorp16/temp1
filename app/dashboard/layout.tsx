"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/database";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/signin");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: tokenData } = await supabase
          .from("tokens")
          .select("amount")
          .eq("user_id", user.id)
          .single();

        setProfile(profile);
        setTokens(tokenData?.amount || 0);

        // Check if profile is incomplete
        if (!profile?.name || !profile?.age || !profile?.weight || !profile?.height) {
          router.push("/onboarding");
          return;
        }

        // Check if goals are not set
        if (!profile?.goal || !profile?.activity_level || !profile?.target_calories) {
          router.push("/onboarding?step=2");
          return;
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, [router, pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/meals", label: "Meals" },
    { href: "/dashboard/consultation", label: "Consultation" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-bg">
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-primary icon-glow" />
              <span className="font-bold gradient-text">BulkBlitz</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    pathname === item.href ? "text-primary font-medium" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <Link
                href="/dashboard/tokens"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Coins className="h-4 w-4" />
                <span>{tokens} Tokens</span>
              </Link>

              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="hover-glow"
              >
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t md:hidden bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-muted-foreground hover:text-primary transition-colors ${
                    pathname === item.href ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <Link
                href="/dashboard/tokens"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Coins className="h-4 w-4" />
                <span>{tokens} Tokens</span>
              </Link>

              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full hover-glow"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}