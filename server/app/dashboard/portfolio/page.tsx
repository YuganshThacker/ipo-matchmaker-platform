import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary"
import { PortfolioAnalytics } from "@/components/portfolio/portfolio-analytics"
import { PortfolioHoldings } from "@/components/portfolio/portfolio-holdings"
import { PortfolioPerformance } from "@/components/portfolio/portfolio-performance"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Plus } from "lucide-react"
import Link from "next/link"

export default function PortfolioPage() {
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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Management</h1>
        <p className="text-muted-foreground">
          Track your IPO investments, analyze performance, and manage your portfolio
        </p>
      </div>

      <div className="space-y-8">
        <PortfolioSummary />
        <PortfolioPerformance />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioHoldings />
          <PortfolioAnalytics />
        </div>
      </div>
    </DashboardLayout>
  )
}
