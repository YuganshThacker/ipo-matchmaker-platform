"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

const performanceData = [
  { month: "Jan", portfolio: 195000, benchmark: 190000 },
  { month: "Feb", portfolio: 202500, benchmark: 195000 },
  { month: "Mar", portfolio: 218000, benchmark: 205000 },
  { month: "Apr", portfolio: 235000, benchmark: 220000 },
  { month: "May", portfolio: 242000, benchmark: 225000 },
  { month: "Jun", portfolio: 258000, benchmark: 240000 },
]

export function PortfolioPerformance() {
  const [timeRange, setTimeRange] = useState("6M")

  const currentValue = 258000
  const initialValue = 195000
  const totalReturn = (((currentValue - initialValue) / initialValue) * 100).toFixed(1)
  const benchmarkReturn = (((240000 - 190000) / 190000) * 100).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Portfolio Performance</CardTitle>
          <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Return</div>
            <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 mr-1" />+{totalReturn}%
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">vs Benchmark</div>
            <div className="text-2xl font-bold text-blue-600">
              +{(Number.parseFloat(totalReturn) - Number.parseFloat(benchmarkReturn)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Best Performer</div>
            <div className="text-lg font-semibold">TechCorp Ltd</div>
            <Badge variant="secondary" className="text-xs mt-1">
              +25%
            </Badge>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
            <div className="text-lg font-semibold">Moderate</div>
            <Badge variant="outline" className="text-xs mt-1">
              Balanced
            </Badge>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `₹${Number(value).toLocaleString()}`,
                  name === "portfolio" ? "Your Portfolio" : "Benchmark",
                ]}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
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
      </CardContent>
    </Card>
  )
}
