"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Search,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Discover IPOs", href: "/dashboard/ipos", icon: Search },
  { name: "Partnerships", href: "/dashboard/partnerships", icon: Users },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: TrendingUp },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

export function DashboardSidebar({ onCollapseChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className="lg:hidden fixed inset-0 bg-slate-900/50 z-40" />

      {/* Sidebar */}
      <motion.div
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            {!collapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg p-1.5 mr-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">IPO Matchmaker</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleCollapse} className="p-2">
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* User profile */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Trust: {user?.trustScore || 0}%
                    </Badge>
                    {user?.isVerified && <Shield className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "px-2" : "px-3",
                      isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Button variant="ghost" className={cn("w-full justify-start", collapsed ? "px-2" : "px-3")}>
              <Bell className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Notifications</span>}
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start", collapsed ? "px-2" : "px-3")}>
              <HelpCircle className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Help & Support</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                collapsed ? "px-2" : "px-3",
              )}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
