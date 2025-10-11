"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Loader2, RefreshCw, PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Holding {
  companyName: string
  symbol: string
  sector: string
  totalShares: number
  totalAmount: number
  avgPrice: number
  currentPrice?: number
  value?: number
  change?: number
  allocation?: number
  investments: any[]
}

interface PortfolioHoldingsProps {
  refreshKey?: number
}

export function PortfolioHoldings({ refreshKey }: PortfolioHoldingsProps) {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHoldings = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/portfolio/investments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const holdingsData = data.holdings.map((holding: Holding) => {
            // Simulate current prices and changes (in real app, this would come from market data API)
            const priceVariation = (Math.random() - 0.5) * 0.2 // ±10% variation
            const currentPrice = holding.avgPrice * (1 + priceVariation)
            const value = holding.totalShares * currentPrice
            const change = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100
            
            return {
              ...holding,
              currentPrice,
              value,
              change
            }
          })

          // Calculate allocations
          const totalValue = holdingsData.reduce((sum: number, h: any) => sum + h.value, 0)
          const holdingsWithAllocations = holdingsData.map((holding: any) => ({
            ...holding,
            allocation: totalValue > 0 ? (holding.value / totalValue) * 100 : 0
          }))

          setHoldings(holdingsWithAllocations)
          setError(null)
        }
      } else {
        throw new Error("Failed to fetch holdings")
      }
    } catch (error) {
      console.error("Error fetching holdings:", error)
      setError("Failed to load holdings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHoldings()
  }, [user, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHoldings()
  }

  const totalValue = holdings.reduce((sum, holding) => sum + (holding.value || 0), 0)

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Please log in to view your portfolio holdings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Current Holdings</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading holdings...</span>
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
            <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No investments found</p>
            <p className="text-sm text-muted-foreground">
              Add your first investment to start tracking your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Total Portfolio Value: <span className="font-semibold text-foreground">₹{totalValue.toLocaleString()}</span>
            </div>
            
            {holdings.map((holding) => (
              <div
                key={holding.symbol}
                className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{holding.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {holding.sector}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{holding.totalShares} shares</span>
                      <Badge variant="secondary" className="text-xs">
                        {holding.symbol}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{(holding.value || 0).toLocaleString()}</div>
                    <div
                      className={`text-sm flex items-center ${
                        (holding.change || 0) > 0
                          ? "text-emerald-600"
                          : (holding.change || 0) < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {(holding.change || 0) > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (holding.change || 0) < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {(holding.change || 0) > 0 ? "+" : ""}
                      {(holding.change || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Avg Price: </span>
                    <span className="font-medium">₹{holding.avgPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-medium">₹{(holding.currentPrice || holding.avgPrice).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Portfolio Allocation</span>
                    <span className="font-medium">{(holding.allocation || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={holding.allocation || 0} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
