"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { IPOPredictionPage } from "@/components/ipos/ipo-prediction-page"

export default function PredictPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DashboardHeader />
        <main className="p-6 mt-2">
          <div className="max-w-7xl mx-auto">
            <IPOPredictionPage />
          </div>
        </main>
      </div>
    </div>
  )
}
