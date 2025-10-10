"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity, 
  Clock,
  ArrowRight,
  PieChart,
  CheckCircle,
  DollarSign
} from "lucide-react"

export function DashboardOverview() {
  // Top row summary boxes
  const summaryStats = [
    {
      title: "Total Partnerships",
      value: "24",
      change: "+3",
      changeType: "positive",
      icon: Users,
      description: "Active partnerships",
      href: "/dashboard/partnerships",
      color: "blue"
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1%",
      changeType: "positive",
      icon: Target,
      description: "IPO allotment success",
      href: "/dashboard/analytics",
      color: "emerald"
    },
    {
      title: "Trust Score",
      value: "96",
      change: "+1",
      changeType: "positive",
      icon: Activity,
      description: "Community trust rating",
      href: "/dashboard/trust",
      color: "purple"
    },
    {
      title: "Pending Requests",
      value: "5",
      change: "-2",
      changeType: "negative",
      icon: Clock,
      description: "Awaiting approval",
      href: "/dashboard/partnerships",
      color: "orange"
    },
  ]

  // Portfolio summary data
  const portfolioData = {
    totalInvestment: "₹2,45,000",
    totalProfit: "₹34,500",
    panProfit: "₹12,300",
    profitPercentage: "+14.1%"
  }

  // Recent partnerships data
  const recentPartnerships = [
    {
      id: 1,
      name: "Rajesh Kumar",
      amount: "₹50,000",
      panShared: true,
      status: "Active",
      date: "2 days ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 2,
      name: "Priya Sharma",
      amount: "₹75,000",
      panShared: true,
      status: "Active",
      date: "5 days ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 3,
      name: "Amit Patel",
      amount: "₹30,000",
      panShared: false,
      status: "Pending",
      date: "1 week ago",
      avatar: "/placeholder-user.jpg"
    }
  ]

  // Note: Alerts and Premium sections have been moved out of overview

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-4">
      {/* Top row summary boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg p-2 ${getColorClasses(stat.color)}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={stat.changeType === "positive" ? "default" : "destructive"}
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Summary and Recent Partnerships Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/dashboard/portfolio">
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Portfolio Summary
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Investment</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{portfolioData.totalInvestment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Profit</span>
                    <span className="font-semibold text-emerald-600">{portfolioData.totalProfit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">PAN Sharing Profit</span>
                    <span className="font-semibold text-blue-600">{portfolioData.panProfit}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Overall Return</span>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {portfolioData.profitPercentage}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Partnerships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Link href="/dashboard/partnerships">
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent Partnerships
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentPartnerships.map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {partnership.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{partnership.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{partnership.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">{partnership.amount}</div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={partnership.status === "Active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {partnership.status}
                          </Badge>
                          {partnership.panShared && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* End of overview content */}
    </div>
  )
}
