"use client"

import { useState, useEffect } from "react"
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
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface DashboardData {
  summaryStats: Array<{
    title: string
    value: string
    change: string
    changeType: string
    description: string
  }>
  portfolioData: {
    totalInvestment: string
    totalProfit: string
    panProfit: string
    profitPercentage: string
  }
  recentPartnerships: Array<{
    id: string
    name: string
    amount: string
    panShared: boolean
    status: string
    date: string
    ipoName?: string
  }>
}

export function DashboardOverview() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setError(null)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  // Static icon and color mappings
  const statConfig = [
    {
      icon: Users,
      href: "/dashboard/partnerships",
      color: "blue"
    },
    {
      icon: Target,
      href: "/dashboard/analytics", 
      color: "emerald"
    },
    {
      icon: Activity,
      href: "/dashboard/trust",
      color: "purple"
    },
    {
      icon: Clock,
      href: "/dashboard/partnerships",
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400", 
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back, {user.name}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top row summary boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.summaryStats.map((stat, index) => {
          const config = statConfig[index]
          const IconComponent = config.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={config.href}>
                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg p-2 ${getColorClasses(config.color)}`}>
                      <IconComponent className="w-4 h-4" />
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
          )
        })}
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
                    <span className="font-semibold text-slate-900 dark:text-white">{dashboardData.portfolioData.totalInvestment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Profit</span>
                    <span className="font-semibold text-emerald-600">{dashboardData.portfolioData.totalProfit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">PAN Sharing Profit</span>
                    <span className="font-semibold text-blue-600">{dashboardData.portfolioData.panProfit}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Overall Return</span>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {dashboardData.portfolioData.profitPercentage}
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
                  {dashboardData.recentPartnerships.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">No partnerships yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start creating partnerships to see them here
                      </p>
                    </div>
                  ) : (
                    dashboardData.recentPartnerships.map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {partnership.name.split(' ').map((n: string) => n[0]).join('')}
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
                    ))
                  )}
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
