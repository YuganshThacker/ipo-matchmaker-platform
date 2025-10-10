import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SettingsDashboard } from "@/components/settings/settings-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences, security settings, and platform configuration
        </p>
      </div>
      <SettingsDashboard />
    </DashboardLayout>
  )
}
