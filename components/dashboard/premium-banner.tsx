"use client"

import { Button } from "@/components/ui/button"
import { Crown, Star } from "lucide-react"

interface PremiumBannerProps {
  isPremium?: boolean
}

export function PremiumBanner({ isPremium = false }: PremiumBannerProps) {
  if (isPremium) {
    return (
      <div className="px-6">
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/20 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Premium Active</span>
            <span className="text-emerald-700/70 dark:text-emerald-300/70">Enjoy advanced tools and priority access</span>
          </div>
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex">Manage</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      <div className="flex items-center justify-between rounded-xl border border-purple-200 dark:border-purple-900/40 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3">
        <div className="flex items-center gap-2 text-sm">
          <Crown className="w-4 h-4 text-purple-600" />
          <span className="text-slate-900 dark:text-white font-medium">Upgrade to Premium</span>
          <span className="text-slate-700/70 dark:text-slate-300/70 hidden sm:inline">Unlock Advanced Analytics, Exclusive IPOs, and Priority Support</span>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Star className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      </div>
    </div>
  )
}


