"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"

export function PortfolioSummary() {
  const investments = [
    {
      name: "TechCorp Ltd",
      status: "Active",
      investment: "₹50,000",
      currentValue: "₹62,500",
      change: "+25%",
      changeType: "positive",
      allotment: "Confirmed",
      shares: 125,
    },
    {
      name: "GreenEnergy Solutions",
      status: "Pending",
      investment: "₹75,000",
      currentValue: "₹75,000",
      change: "0%",
      changeType: "neutral",
      allotment: "Pending",
      shares: 0,
    },
    {
      name: "FinTech Innovations",
      status: "Active",
      investment: "₹40,000",
      currentValue: "₹48,000",
      change: "+20%",
      changeType: "positive",
      allotment: "Confirmed",
      shares: 96,
    },
    {
      name: "HealthTech Systems",
      status: "Closed",
      investment: "₹30,000",
      currentValue: "₹27,000",
      change: "-10%",
      changeType: "negative",
      allotment: "Confirmed",
      shares: 60,
    },
  ]

  const totalInvestment = investments.reduce(
    (sum, inv) => sum + Number.parseInt(inv.investment.replace(/[₹,]/g, "")),
    0,
  )
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + Number.parseInt(inv.currentValue.replace(/[₹,]/g, "")),
    0,
  )
  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = ((totalGainLoss / totalInvestment) * 100).toFixed(1)

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Portfolio Summary</CardTitle>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {/* Portfolio overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Invested</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">₹{totalInvestment.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">Current Value</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{totalCurrentValue.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Gain/Loss</div>
            <div className={`text-xl font-bold ${totalGainLoss >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {totalGainLoss >= 0 ? "+" : ""}₹{Math.abs(totalGainLoss).toLocaleString()}
              <span className="text-sm ml-1">({totalGainLossPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Individual investments */}
        <div className="space-y-4">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">{investment.name}</h3>
                  <Badge
                    variant={
                      investment.status === "Active"
                        ? "default"
                        : investment.status === "Pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {investment.status}
                  </Badge>
                  <Badge variant={investment.allotment === "Confirmed" ? "default" : "secondary"} className="text-xs">
                    {investment.allotment}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Invested</div>
                    <div className="font-medium text-slate-900 dark:text-white">{investment.investment}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Current Value</div>
                    <div className="font-medium text-slate-900 dark:text-white">{investment.currentValue}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Change</div>
                    <div
                      className={`font-medium ${
                        investment.changeType === "positive"
                          ? "text-emerald-600"
                          : investment.changeType === "negative"
                            ? "text-red-600"
                            : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {investment.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Shares</div>
                    <div className="font-medium text-slate-900 dark:text-white">{investment.shares || "N/A"}</div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
