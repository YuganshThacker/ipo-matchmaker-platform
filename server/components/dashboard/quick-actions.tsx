"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, TrendingUp, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Discover New IPOs",
      description: "Browse 12 upcoming IPOs",
      icon: Search,
      href: "/dashboard/ipos",
      color: "from-blue-500 to-cyan-500",
      badge: "12 New",
    },
    {
      title: "Find Partners",
      description: "Connect with verified investors",
      icon: Users,
      href: "/dashboard/partnerships/find",
      color: "from-emerald-500 to-teal-500",
      badge: "47 Online",
    },
    {
      title: "Create Partnership",
      description: "Start a new investment group",
      icon: Plus,
      href: "/dashboard/partnerships/create",
      color: "from-purple-500 to-pink-500",
      badge: "Quick Setup",
    },
    {
      title: "View Analytics",
      description: "Track your performance",
      icon: TrendingUp,
      href: "/dashboard/analytics",
      color: "from-orange-500 to-red-500",
      badge: "Updated",
    },
  ]

  const recentNotifications = [
    {
      title: "TechCorp IPO Opens Tomorrow",
      time: "2 hours ago",
      type: "ipo",
    },
    {
      title: "Partnership Request from Priya S.",
      time: "4 hours ago",
      type: "partnership",
    },
    {
      title: "GreenTech Allotment Confirmed",
      time: "1 day ago",
      type: "success",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-700 group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} p-2 mr-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-900 dark:text-white">{action.title}</div>
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{action.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Updates</CardTitle>
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentNotifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === "ipo"
                    ? "bg-blue-500"
                    : notification.type === "partnership"
                      ? "bg-purple-500"
                      : "bg-emerald-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{notification.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{notification.time}</div>
              </div>
            </motion.div>
          ))}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            View All Notifications
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
