"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary"
import { PortfolioAnalytics } from "@/components/portfolio/portfolio-analytics"
import { PortfolioHoldings } from "@/components/portfolio/portfolio-holdings"
import { PortfolioPerformance } from "@/components/portfolio/portfolio-performance"
import { AddInvestmentDialog } from "@/components/portfolio/add-investment-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default function PortfolioPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleInvestmentAdded = () => {
    // Trigger a refresh of portfolio data
    setRefreshKey(prev => prev + 1)
  }
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <AddInvestmentDialog onInvestmentAdded={handleInvestmentAdded} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Management</h1>
        <p className="text-muted-foreground">
          Track your IPO investments, analyze performance, and manage your portfolio
        </p>
      </div>

      <div className="space-y-8">
        <PortfolioSummary refreshKey={refreshKey} />
        <PortfolioPerformance refreshKey={refreshKey} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioHoldings refreshKey={refreshKey} />
          <PortfolioAnalytics refreshKey={refreshKey} />
        </div>
      </div>
    </DashboardLayout>
  )
}
