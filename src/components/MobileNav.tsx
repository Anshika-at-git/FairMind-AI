"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Bot, Database, ShieldAlert, Menu } from "lucide-react";
import { cn } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-blue-500",
  },
  {
    label: "Text Bias Analyzer",
    icon: FileText,
    href: "/text-analyzer",
    color: "text-purple-500",
  },
  {
    label: "AI Output Auditor",
    icon: Bot,
    href: "/model-auditor",
    color: "text-emerald-500",
  },
  {
    label: "Dataset Fairness",
    icon: Database,
    href: "/dataset-analyzer",
    color: "text-amber-500",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 border-b border-white/10 backdrop-blur-xl">
      <div className="flex justify-between items-center px-4 py-2">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">FairMind AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-md hover:bg-white/10 focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-7 w-7 text-primary" />
          </button>
        </div>
      </div>
      {open && (
        <div className="flex flex-col px-4 pb-4 space-y-2 animate-fade-in-down">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center p-3 rounded-lg font-medium transition text-base",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400 hover:text-white hover:bg-white/10"
              )}
              onClick={() => setOpen(false)}
            >
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
