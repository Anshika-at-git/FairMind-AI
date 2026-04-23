"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Bot, Database, ShieldAlert } from "lucide-react"
import { cn } from "./ui/button"

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
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card/50 border-r border-white/5 backdrop-blur-xl">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14 space-x-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            FairMind AI
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
