"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react"
import { useState } from "react"

interface IPO {
  id: number
  name: string
  sector: string
  priceRange: string
  openDate: string
  closeDate: string
  listingDate: string
  status: "upcoming" | "live" | "closed" | "listed"
  subscriptionRatio: number | null
  gmp: string
  lotSize: number
  minInvestment: string
  marketCap: string
  // Removed AI prediction block per requirement
  description: string
  logo: string
  isBookmarked: boolean
  listingPrice?: string
  currentPrice?: string
  listingGain?: string
}

interface IPOListViewProps {
  ipos: IPO[]
}

export function IPOListView({ ipos }: IPOListViewProps) {
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>(
    ipos.filter((ipo) => ipo.isBookmarked).map((ipo) => ipo.id),
  )

  const toggleBookmark = (id: number) => {
    setBookmarkedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "live":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "closed":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
      case "listed":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {ipos.map((ipo, index) => (
        <motion.div
          key={ipo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-6">
              {/* Company info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src={ipo.logo || "/placeholder.svg"} alt={ipo.name} />
                  <AvatarFallback className="text-lg font-semibold">{ipo.name.substring(0, 2)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{ipo.name}</h3>
                    <Badge className={`text-xs ${getStatusColor(ipo.status)}`}>
                      {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>{ipo.sector}</span>
                    <span>•</span>
                    <span>{ipo.marketCap}</span>
                  </div>

                  {/* Minimal: remove long description */}
                </div>
              </div>

              {/* Key metrics (minimal, unified) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Price Range</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{ipo.priceRange}</div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Min Investment</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{ipo.minInvestment}</div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">GMP</div>
                  <div className="font-semibold text-emerald-600">{ipo.gmp}</div>
                </div>

                {ipo.subscriptionRatio && ipo.status === "live" && (
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Subscription</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{ipo.subscriptionRatio}x</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => toggleBookmark(ipo.id)} className="p-2">
                  {bookmarkedItems.includes(ipo.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                  )}
                </Button>
                {/* Minimal: remove extra actions */}
              </div>
            </div>

              {/* Additional info row (trimmed, unified with card) */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Open: {formatDate(ipo.openDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span>Close: {formatDate(ipo.closeDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span>Listing: {formatDate(ipo.listingDate)}</span>
                  </div>
                </div>
                {/* Partnership options only for upcoming/live */}
                {(ipo.status === "upcoming" || ipo.status === "live") && (
                  <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Investment Partnership</Button>
                    <Button variant="outline">PAN Holder Partnership</Button>
                  </div>
                )}
              </div>

              {/* Subscription progress for live IPOs */}
              {ipo.subscriptionRatio && ipo.status === "live" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Subscription Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {ipo.subscriptionRatio}x subscribed
                    </span>
                  </div>
                  <Progress value={Math.min(ipo.subscriptionRatio * 20, 100)} className="h-2" />
                </div>
              )}

              {/* Listed performance */}
              {ipo.status === "listed" && ipo.listingGain && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Listed at {ipo.listingPrice} • Current: {ipo.currentPrice}
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {ipo.listingGain}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
