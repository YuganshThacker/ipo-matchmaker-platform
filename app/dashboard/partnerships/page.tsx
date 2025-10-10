import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PartnershipHub } from "@/components/partnerships/partnership-hub"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PartnershipsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Partnership Hub</h1>
        <p className="text-muted-foreground">
          Connect with other investors to form strategic partnerships for IPO investments
        </p>
      </div>
      <PartnershipHub />
    </DashboardLayout>
  )
}
