"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, Shield, Target, AlertTriangle, Loader2, RefreshCw, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SectorAllocation {
  sector: string
  value: number
  percentage: number
  color: string
}

interface PortfolioInsight {
  icon: any
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "warning"
}

interface PortfolioAnalyticsProps {
  refreshKey?: number
}

export function PortfolioAnalytics({ refreshKey }: PortfolioAnalyticsProps) {
  const { user } = useAuth()
  const [sectorData, setSectorData] = useState<SectorAllocation[]>([])
  const [insights, setInsights] = useState<PortfolioInsight[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/portfolio/analytics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSectorData(data.sectorAllocation || [])
          setSummary(data.summary)
          
          // Generate insights based on portfolio data
          const generatedInsights = generateInsights(data)
          setInsights(generatedInsights)
          setError(null)
        }
      } else {
        throw new Error("Failed to fetch analytics data")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to load analytics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const generateInsights = (data: any): PortfolioInsight[] => {
    const insights: PortfolioInsight[] = []
    const { summary, sectorAllocation } = data

    // Performance insight
    if (summary.totalGainLossPercentage > 5) {
      insights.push({
        icon: TrendingUp,
        title: "Strong Performance",
        description: `Portfolio gaining ${summary.totalGainLossPercentage.toFixed(1)}% overall`,
        type: "positive"
      })
    } else if (summary.totalGainLossPercentage < -5) {
      insights.push({
        icon: AlertTriangle,
        title: "Performance Alert",
        description: `Portfolio down ${Math.abs(summary.totalGainLossPercentage).toFixed(1)}%`,
        type: "negative"
      })
    }

    // Diversification insight
    if (sectorAllocation.length >= 3) {
      insights.push({
        icon: Shield,
        title: "Well Diversified",
        description: `Portfolio spread across ${sectorAllocation.length} sectors`,
        type: "positive"
      })
    } else if (sectorAllocation.length < 3) {
      insights.push({
        icon: Target,
        title: "Diversification Opportunity",
        description: "Consider diversifying across more sectors",
        type: "warning"
      })
    }

    // Concentration risk
    const topSector = sectorAllocation[0]
    if (topSector && topSector.percentage > 50) {
      insights.push({
        icon: AlertTriangle,
        title: "Concentration Risk",
        description: `${topSector.sector} makes up ${topSector.percentage.toFixed(1)}% of portfolio`,
        type: "warning"
      })
    }

    // Holdings count insight
    if (summary.totalHoldings < 5) {
      insights.push({
        icon: Target,
        title: "Growth Opportunity",
        description: `Only ${summary.totalHoldings} holdings - consider adding more`,
        type: "neutral"
      })
    }

    return insights
  }

  useEffect(() => {
    fetchAnalytics()
  }, [user, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Please log in to view your portfolio analytics.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio Analytics
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : sectorData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No data available</p>
            <p className="text-sm text-muted-foreground">
              Add investments to see portfolio analytics
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sector Allocation */}
            <div>
              <h3 className="font-semibold mb-4">Sector Allocation</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData.map(sector => ({
                        name: sector.sector,
                        value: sector.percentage,
                        color: sector.color
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Allocation"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {sectorData.map((sector) => (
                  <div key={sector.sector} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                    <span className="text-sm">{sector.sector}</span>
                    <span className="text-sm font-medium ml-auto">{sector.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Summary Stats */}
            {summary && (
              <div>
                <h3 className="font-semibold mb-4">Portfolio Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Holdings</div>
                    <div className="text-lg font-semibold">{summary.totalHoldings}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Top Sector</div>
                    <div className="text-lg font-semibold">{summary.topSector || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            <div>
              <h3 className="font-semibold mb-4">Portfolio Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const Icon = insight.icon
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        insight.type === "positive"
                          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                          : insight.type === "negative"
                          ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                          : insight.type === "warning"
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 mt-0.5 ${
                          insight.type === "positive"
                            ? "text-emerald-600"
                            : insight.type === "negative"
                            ? "text-red-600"
                            : insight.type === "warning"
                            ? "text-amber-600"
                            : "text-slate-600"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-sm">{insight.title}</div>
                        <div className="text-sm text-muted-foreground">{insight.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
