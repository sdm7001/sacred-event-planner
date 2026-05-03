"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Languages,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLang } from "@/contexts/LanguageContext";
import type { translations } from "@/contexts/LanguageContext";

type NavKey = keyof typeof translations.en;

const navigation: { name: NavKey; href: string; icon: React.ElementType }[] = [
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
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "User Management", href: "/settings/users", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { t, toggleLang, lang } = useLang();

  return (
    <TooltipProvider delayDuration={0}>
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

            const label = t(item.name);

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
                {!collapsed && <span>{label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* User + Language section */}
        <div className="border-t p-4 space-y-3">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-sage">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t("Admin")}</p>
                <p className="text-xs text-muted-foreground truncate">{t("Coordinator")}</p>
              </div>
            </div>
          )}

          {/* Language toggle */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mx-auto flex"
                  onClick={toggleLang}
                  aria-label="Toggle language"
                >
                  <Languages className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {t("switchLang")}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={toggleLang}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Languages className="h-4 w-4 shrink-0" />
              <span>{t("switchLang")}</span>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                {t("langLabel")}
              </span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
