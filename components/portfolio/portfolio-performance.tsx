"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PortfolioPerformanceProps {
  refreshKey?: number
}

export function PortfolioPerformance({ refreshKey }: PortfolioPerformanceProps) {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("6M")
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformanceData = async () => {
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
          setSummary(data.summary)
          setPerformance(data.performance)
          setPerformanceData(data.performance.monthlyData || [])
          setTopPerformers(data.topPerformers || [])
          setError(null)
        }
      } else {
        throw new Error("Failed to fetch performance data")
      }
    } catch (error) {
      console.error("Error fetching performance:", error)
      setError("Failed to load performance data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [user, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPerformanceData()
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Please log in to view your portfolio performance.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentValue = summary?.totalValue || 0
  const initialValue = summary?.totalInvested || 0
  const totalReturn = summary?.totalGainLossPercentage || 0
  const benchmarkReturn = 15.2 // Mock benchmark for comparison
  const bestPerformer = topPerformers[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Portfolio Performance</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button variant={timeRange === "1M" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("1M")}>
              1M
            </Button>
            <Button variant={timeRange === "3M" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("3M")}>
              3M
            </Button>
            <Button variant={timeRange === "6M" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("6M")}>
              6M
            </Button>
            <Button variant={timeRange === "1Y" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("1Y")}>
              1Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading performance data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Return</div>
                <div className={`text-2xl font-bold flex items-center justify-center ${
                  totalReturn >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {totalReturn >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">vs Benchmark</div>
                <div className={`text-2xl font-bold ${
                  (totalReturn - benchmarkReturn) >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {(totalReturn - benchmarkReturn) >= 0 ? "+" : ""}{(totalReturn - benchmarkReturn).toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Best Performer</div>
                <div className="text-lg font-semibold">
                  {bestPerformer ? bestPerformer.companyName : "No data"}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {bestPerformer ? `+${bestPerformer.gainLossPercent.toFixed(1)}%` : "N/A"}
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                <div className="text-lg font-semibold">₹{currentValue.toLocaleString()}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {summary?.totalHoldings || 0} Holdings
                </Badge>
              </div>
            </div>

            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-emerald-600">
                              Portfolio: ₹{payload[0]?.value?.toLocaleString()}
                            </p>
                            <p className="text-blue-600">
                              Benchmark: ₹{payload[1]?.value?.toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#6b7280", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Daily Change:</span>
                    <Badge variant="outline" className={`${
                      (performance?.dailyChange || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {(performance?.dailyChange || 0) >= 0 ? "+" : ""}{(performance?.dailyChange || 0).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly Change:</span>
                    <Badge variant="outline" className={`${
                      (performance?.weeklyChange || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {(performance?.weeklyChange || 0) >= 0 ? "+" : ""}{(performance?.weeklyChange || 0).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Change:</span>
                    <Badge variant="outline" className={`${
                      (performance?.monthlyChange || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {(performance?.monthlyChange || 0) >= 0 ? "+" : ""}{(performance?.monthlyChange || 0).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Portfolio Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Invested:</span>
                    <span className="font-medium">₹{initialValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Value:</span>
                    <span className="font-medium">₹{currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Gain/Loss:</span>
                    <span className={`font-medium ${
                      (summary?.totalGainLoss || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {(summary?.totalGainLoss || 0) >= 0 ? "+" : ""}₹{Math.abs(summary?.totalGainLoss || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
