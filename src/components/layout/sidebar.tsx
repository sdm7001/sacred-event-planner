"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  Package,
  Bell,
  Mail,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Participants", href: "/participants", icon: Users },
  { name: "Providers", href: "/providers", icon: UserCog },
  { name: "Materials", href: "/materials", icon: Package },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Email Templates", href: "/email-templates", icon: Mail },
  { name: "Communications", href: "/communications", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Checklists", href: "/checklists", icon: ClipboardList },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Audit Logs", href: "/audit-logs", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "User Management", href: "/settings/users", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userInitial, setUserInitial] = useState("A");
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Coordinator");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = (data.user.user_metadata?.full_name as string) || data.user.email || "Admin";
        setUserName(name.split(" ")[0]); // first name only for sidebar
        setUserInitial(name.charAt(0).toUpperCase());
        const role = (data.user.user_metadata?.role as string) || "Coordinator";
        setUserRole(role.charAt(0).toUpperCase() + role.slice(1));
      }
    });
  }, []);

  return (
    <TooltipProvider delayDuration={500}>
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sage flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-heading font-semibold text-foreground">
                Gather
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            const link = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sage/10 text-sage-700 dark:text-sage-300"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sage")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-sage">{userInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userRole}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
