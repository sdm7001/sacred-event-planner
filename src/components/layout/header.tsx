"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Sun, Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [userInitial, setUserInitial] = useState("A");
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    // Load current user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = (data.user.user_metadata?.full_name as string) || data.user.email || "Admin";
        setUserName(name);
        setUserEmail(data.user.email ?? "");
        setUserInitial(name.charAt(0).toUpperCase());
      }
    });

    // Count overdue tasks for notification badge
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", today)
      .not("status", "in", '("completed","canceled")')
      .then(({ count }) => {
        if (count && count > 0) setOverdueCount(count);
      });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events, participants, materials..."
          className="pl-10 bg-background"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value.trim();
              if (q) router.push(`/events?q=${encodeURIComponent(q)}`);
            }
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {overdueCount > 9 ? "9+" : overdueCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="p-2">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <DropdownMenuSeparator />
            {overdueCount > 0 ? (
              <DropdownMenuItem asChild>
                <Link href="/tasks" className="cursor-pointer">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm">{overdueCount} overdue task{overdueCount !== 1 ? "s" : ""} need attention</p>
                    <p className="text-xs text-muted-foreground">Click to view tasks</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No new notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-sage">{userInitial}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium truncate">{userName}</p>
              {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
            </div>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
