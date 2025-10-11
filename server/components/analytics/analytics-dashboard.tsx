"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PortfolioPerformanceChart } from "./portfolio-performance-chart"
import { IPOSubscriptionChart } from "./ipo-subscription-chart"
import { SectorAllocationChart } from "./sector-allocation-chart"
import { PartnershipAnalyticsChart } from "./partnership-analytics-chart"
import { PredictionAccuracyChart } from "./prediction-accuracy-chart"
import { RiskAssessmentChart } from "./risk-assessment-chart"
import { TrendingUp, TrendingDown, Target, Users, Brain, Shield, Calendar, Download } from "lucide-react"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6m")

  const keyMetrics = [
    {
      title: "Portfolio ROI",
      value: "24.8%",
      change: "+3.2%",
      changeType: "positive",
      icon: TrendingUp,
      description: "6-month return",
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+1.8%",
      changeType: "positive",
      icon: Target,
      description: "IPO allotment success",
    },
    {
      title: "Active Partnerships",
      value: "12",
      change: "+3",
      changeType: "positive",
      icon: Users,
      description: "Current partnerships",
    },
    {
      title: "AI Accuracy",
      value: "87.5%",
      change: "+2.1%",
      changeType: "positive",
      icon: Brain,
      description: "Prediction accuracy",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your investment performance and partnership insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.title}</CardTitle>
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <metric.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={metric.changeType === "positive" ? "default" : "destructive"}
                    className={`text-xs ${
                      metric.changeType === "positive"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {metric.changeType === "positive" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortfolioPerformanceChart timeRange={timeRange} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "TechCorp IPO", return: "+25.4%", amount: "₹62,500", date: "Jan 15" },
                    { name: "GreenEnergy IPO", return: "+18.2%", amount: "₹47,300", date: "Jan 12" },
                    { name: "FinTech IPO", return: "+32.1%", amount: "₹52,840", date: "Jan 10" },
                    { name: "HealthTech IPO", return: "+15.7%", amount: "₹34,628", date: "Jan 8" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{item.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-emerald-600">{item.return}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{item.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <IPOSubscriptionChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorAllocationChart />
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { sector: "Technology", amount: "₹1,25,000", percentage: "35%", color: "bg-blue-500" },
                    { sector: "Healthcare", amount: "₹85,000", percentage: "24%", color: "bg-emerald-500" },
                    { sector: "Financial Services", amount: "₹70,000", percentage: "20%", color: "bg-purple-500" },
                    { sector: "Renewable Energy", amount: "₹45,000", percentage: "13%", color: "bg-orange-500" },
                    { sector: "Others", amount: "₹30,000", percentage: "8%", color: "bg-slate-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">{item.sector}</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{item.percentage}</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{item.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-6">
          <PartnershipAnalyticsChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictionAccuracyChart timeRange={timeRange} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">Market Trend Analysis</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Technology sector IPOs showing 23% higher success rate this quarter. Consider increasing
                      allocation for upcoming tech IPOs.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                      Partnership Optimization
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Your partnerships with high-trust-score investors yield 18% better allotment rates.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-medium text-purple-900 dark:text-purple-100 mb-2">Risk Assessment</div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Current portfolio risk level: Moderate. Diversification across 5 sectors provides good balance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskAssessmentChart />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Portfolio Volatility
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">12.4%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "62%" }} />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Moderate Risk</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Diversification Score
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">8.2/10</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "82%" }} />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Well Diversified</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Liquidity Risk</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Low</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "25%" }} />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Good Liquidity</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Market Correlation</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">0.67</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "67%" }} />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Moderate Correlation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
