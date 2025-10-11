"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown } from "lucide-react"

const holdings = [
  {
    name: "TechCorp Ltd",
    sector: "Technology",
    shares: 125,
    avgPrice: 400,
    currentPrice: 500,
    value: 62500,
    change: 25,
    allocation: 24.2,
  },
  {
    name: "GreenEnergy Solutions",
    sector: "Energy",
    shares: 150,
    avgPrice: 500,
    currentPrice: 500,
    value: 75000,
    change: 0,
    allocation: 29.1,
  },
  {
    name: "FinTech Innovations",
    sector: "Finance",
    shares: 96,
    avgPrice: 417,
    currentPrice: 500,
    value: 48000,
    change: 20,
    allocation: 18.6,
  },
  {
    name: "HealthTech Systems",
    sector: "Healthcare",
    shares: 60,
    avgPrice: 500,
    currentPrice: 450,
    value: 27000,
    change: -10,
    allocation: 10.5,
  },
]

export function PortfolioHoldings() {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Current Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {holdings.map((holding) => (
            <div
              key={holding.name}
              className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{holding.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {holding.sector}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{holding.shares} shares</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{holding.value.toLocaleString()}</div>
                  <div
                    className={`text-sm flex items-center ${
                      holding.change > 0
                        ? "text-emerald-600"
                        : holding.change < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {holding.change > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : holding.change < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {holding.change > 0 ? "+" : ""}
                    {holding.change}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Avg Price: </span>
                  <span className="font-medium">₹{holding.avgPrice}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Current: </span>
                  <span className="font-medium">₹{holding.currentPrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio Allocation</span>
                  <span className="font-medium">{holding.allocation}%</span>
                </div>
                <Progress value={holding.allocation} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
