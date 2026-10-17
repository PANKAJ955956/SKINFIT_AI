"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Accessibility,
  Apple,
  Sparkle,
  ShoppingBag,
  Bot,
  LineChart,
  User,
  Shield
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Facial Skin Scan", href: "/skin-analysis", icon: Sparkles },
    { name: "Body & Posture", href: "/body-analysis", icon: Accessibility },
    { name: "Wellness & Nutrition", href: "/wellness", icon: Apple },
    { name: "Matched Routines", href: "/recommendations", icon: Sparkle },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "AI Health Advisor", href: "/assistant", icon: Bot },
    { name: "Progress & Metrics", href: "/progress", icon: LineChart },
    { name: "Profile & Privacy", href: "/profile", icon: User },
  ];

  return (
    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between py-6 px-4 ${className}`}>
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Wellness Control Panel
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-brand-50 to-brand-100/60 dark:from-brand-950/60 dark:to-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold shadow-sm border border-brand-200/50 dark:border-brand-800/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-gradient-to-br from-brand-50 to-accent-50/50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-brand-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Clinical Privacy Shield
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Biometric scans are encrypted and never sold. You can purge all photos at any time.
        </p>
      </div>
    </aside>
  );
};
