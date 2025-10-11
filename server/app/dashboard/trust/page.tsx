import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TrustDashboard } from "@/components/trust/trust-dashboard"

export default function TrustPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Trust & Transparency</h1>
        <p className="text-muted-foreground">
          Monitor trust scores, verify credentials, and ensure transparent investment practices
        </p>
      </div>
      <TrustDashboard />
    </DashboardLayout>
  )
}
