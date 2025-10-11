"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, Shield, Target, AlertTriangle } from "lucide-react"

const sectorData = [
  { name: "Technology", value: 24.2, color: "#3b82f6" },
  { name: "Energy", value: 29.1, color: "#10b981" },
  { name: "Finance", value: 18.6, color: "#f59e0b" },
  { name: "Healthcare", value: 10.5, color: "#ef4444" },
  { name: "Cash", value: 17.6, color: "#6b7280" },
]

const insights = [
  {
    icon: TrendingUp,
    title: "Strong Performance",
    description: "Portfolio outperforming benchmark by 6.3%",
    type: "positive",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Well diversified across 4 sectors",
    type: "neutral",
  },
  {
    icon: Target,
    title: "Rebalancing Opportunity",
    description: "Consider reducing energy allocation",
    type: "warning",
  },
  {
    icon: AlertTriangle,
    title: "High Cash Position",
    description: "17.6% cash - consider new investments",
    type: "warning",
  },
]

export function PortfolioAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Portfolio Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sector Allocation */}
          <div>
            <h3 className="font-semibold mb-4">Sector Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
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
                  <Tooltip formatter={(value) => [`${value}%`, "Allocation"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sectorData.map((sector) => (
                <div key={sector.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                  <span className="text-sm">{sector.name}</span>
                  <span className="text-sm font-medium ml-auto">{sector.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="font-semibold mb-4">Portfolio Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <insight.icon
                    className={`h-5 w-5 mt-0.5 ${
                      insight.type === "positive"
                        ? "text-emerald-600"
                        : insight.type === "warning"
                          ? "text-amber-600"
                          : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">{insight.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
