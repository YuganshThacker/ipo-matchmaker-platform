"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, Loader2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PortfolioHolding {
  companyName: string
  symbol: string
  sector: string
  totalShares: number
  totalInvested: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
}

interface PortfolioSummaryProps {
  refreshKey?: number
}

export function PortfolioSummary({ refreshKey }: PortfolioSummaryProps) {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolioData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("auth-token")
      
      if (!token) {
        setError("Please login to view your portfolio")
        return
      }

      console.log("Fetching portfolio data for user:", user.id, "with token:", token.substring(0, 20) + "...")
      
      const response = await fetch("/api/portfolio/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      console.log("Portfolio API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Portfolio API data:", data)
        
        if (data.success) {
          // Handle case where user has no investments yet
          if (!data.holdings || data.holdings.length === 0) {
            console.log("No holdings found for user")
            setHoldings([])
            setError(null)
          } else {
            setHoldings(data.holdings)
            setError(null)
          }
        } else {
          throw new Error(data.error || "Invalid API response")
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Portfolio API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      setError(error instanceof Error ? error.message : "Failed to load portfolio data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [user, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPortfolioData()
  }

  const getStatusFromGainLoss = (gainLossPercent: number) => {
    if (gainLossPercent > 5) return { status: "Strong Growth", variant: "default" as const }
    if (gainLossPercent > 0) return { status: "Growing", variant: "secondary" as const }
    if (gainLossPercent === 0) return { status: "Stable", variant: "outline" as const }
    return { status: "Declining", variant: "destructive" as const }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Please log in to view your portfolio summary.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate totals
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0)
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = totalInvestment > 0 ? ((totalGainLoss / totalInvestment) * 100) : 0

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Portfolio Summary</CardTitle>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading portfolio...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No investments found</p>
            <p className="text-sm text-muted-foreground">
              Add your first investment to start building your portfolio
            </p>
          </div>
        ) : (
          <>
            {/* Portfolio overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Invested</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  ₹{totalInvestment.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Current Value</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  ₹{totalCurrentValue.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Gain/Loss</div>
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${
                  totalGainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {totalGainLoss >= 0 ? "+" : ""}₹{Math.abs(totalGainLoss).toLocaleString()}
                  <span className="text-sm ml-1">({totalGainLossPercent.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Individual investments */}
            <div className="space-y-4">
              {holdings.slice(0, 4).map((holding, index) => {
                const statusInfo = getStatusFromGainLoss(holding.gainLossPercent)
                
                return (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {holding.companyName}
                        </h3>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {holding.sector}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {holding.totalShares} shares
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="block">Invested:</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            ₹{holding.totalInvested.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block">Current:</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            ₹{holding.currentValue.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block">Gain/Loss:</span>
                          <span className={`font-medium ${
                            holding.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {holding.gainLoss >= 0 ? "+" : ""}₹{Math.abs(holding.gainLoss).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block">Return:</span>
                          <span className={`font-medium flex items-center gap-1 ${
                            holding.gainLossPercent >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {holding.gainLossPercent >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {holding.gainLossPercent >= 0 ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )
              })}

              {holdings.length > 4 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View {holdings.length - 4} More Holdings
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
