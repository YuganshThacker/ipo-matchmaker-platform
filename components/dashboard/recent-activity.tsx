"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Users, CheckCircle, Clock, AlertCircle, ArrowRight, MoreHorizontal } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "partnership",
      title: "New Partnership Formed",
      description: "Partnered with Rajesh Kumar for TechCorp IPO",
      time: "2 hours ago",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      user: {
        name: "Rajesh Kumar",
        avatar: "/placeholder.svg?key=rajesh",
      },
    },
    {
      id: 2,
      type: "allotment",
      title: "IPO Allotment Confirmed",
      description: "Received 125 shares of GreenTech Solutions",
      time: "5 hours ago",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      amount: "₹62,500",
    },
    {
      id: 3,
      type: "application",
      title: "IPO Application Submitted",
      description: "Applied for FinTech Innovations IPO",
      time: "1 day ago",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      amount: "₹40,000",
    },
    {
      id: 4,
      type: "pending",
      title: "Partnership Request Pending",
      description: "Waiting for approval from Priya Sharma",
      time: "2 days ago",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      user: {
        name: "Priya Sharma",
        avatar: "/placeholder.svg?key=priya",
      },
    },
    {
      id: 5,
      type: "alert",
      title: "Trust Score Updated",
      description: "Your trust score increased to 96%",
      time: "3 days ago",
      icon: AlertCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      badge: "+2 points",
    },
  ]

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</CardTitle>
        <Button variant="outline" size="sm">
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${activity.bgColor} p-2 flex-shrink-0`}>
                <activity.icon className={`w-6 h-6 ${activity.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</h3>
                  <div className="flex items-center gap-2">
                    {activity.amount && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.amount}
                      </Badge>
                    )}
                    {activity.badge && (
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        {activity.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{activity.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activity.user && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name
                              ?.split(" ")
                              .map((n) => n?.[0] || "")
                              .join("") || "??"}
                          </AvatarFallback>

                        </Avatar>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
