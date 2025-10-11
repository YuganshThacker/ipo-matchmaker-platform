"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Bookmark, BookmarkCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

interface IPOCardProps {
  ipo: IPO
}

export function IPOCard({ ipo }: IPOCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(ipo.isBookmarked)

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
    })
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={ipo.logo || "/placeholder.svg"} alt={ipo.name} />
                <AvatarFallback>{ipo.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{ipo.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ipo.sector}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getStatusColor(ipo.status)}`}>
                {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setIsBookmarked(!isBookmarked)} className="p-1 h-auto">
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price and Investment Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 dark:text-slate-400">Price Range</div>
              <div className="font-semibold text-slate-900 dark:text-white">{ipo.priceRange}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Min Investment</div>
              <div className="font-semibold text-slate-900 dark:text-white">{ipo.minInvestment}</div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>Open: {formatDate(ipo.openDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span>Close: {formatDate(ipo.closeDate)}</span>
            </div>
          </div>

          {/* Subscription (minimal) */}
          {ipo.subscriptionRatio && ipo.status === "live" && (
            <div>
              <Progress value={Math.min(ipo.subscriptionRatio * 20, 100)} className="h-2" />
            </div>
          )}

          {/* View details with partnerships inside */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">{ipo.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Price Range</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{ipo.priceRange}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Min Investment</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{ipo.minInvestment}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Lot Size</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{ipo.lotSize}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">GMP</div>
                    <div className="font-semibold text-emerald-600">{ipo.gmp}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Market Cap</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{ipo.marketCap}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Open: {formatDate(ipo.openDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <span>Close: {formatDate(ipo.closeDate)}</span>
                  </div>
                </div>
                {(ipo.status === "upcoming" || ipo.status === "live") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">Investment Partnership</Button>
                    <Button variant="outline">PAN Holder Partnership</Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* GMP and Market Cap */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 dark:text-slate-400">GMP</div>
              <div className="font-semibold text-emerald-600">{ipo.gmp}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Market Cap</div>
              <div className="font-semibold text-slate-900 dark:text-white">{ipo.marketCap}</div>
            </div>
          </div>

          {/* Listed IPO performance (minimal) */}
          {ipo.status === "listed" && ipo.listingGain && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-600">{ipo.listingGain}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Listed {ipo.listingPrice} • Now {ipo.currentPrice}
                </span>
              </div>
            </div>
          )}

          {/* Remove extra description and actions for minimal UI */
          }
        </CardContent>
      </Card>
    </motion.div>
  )
}
