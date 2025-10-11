"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

export function IPOFilters() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [boardType, setBoardType] = useState<"all" | "mainboard" | "sme">("all")

  const sectors = [
    "Technology",
    "Healthcare",
    "Financial Services",
    "Renewable Energy",
    "Education",
    "Logistics",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Telecommunications",
  ]

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) => (prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]))
  }

  const clearAllFilters = () => {
    setSelectedSectors([])
    setBoardType("all")
  }

  const activeFiltersCount = selectedSectors.length + (boardType !== "all" ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Clear All
        </Button>
      </div>

      {/* Simplified filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sector filter (scrollable) */}
        <div className="space-y-3 md:col-span-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sector</Label>
          <ScrollArea className="h-28 rounded-md border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={selectedSectors.includes(sector) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSector(sector)}
                className="text-xs h-7"
              >
                {sector}
                {selectedSectors.includes(sector) && <X className="w-3 h-3 ml-1" />}
              </Button>
            ))}
          </div>
          </ScrollArea>
        </div>

        {/* Board type (Mainboard / SME) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Board</Label>
          <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden w-full">
            <Button
              size="sm"
              variant={boardType === "all" ? "default" : "ghost"}
              className={`${boardType === "all" ? "bg-slate-900 text-white" : "text-slate-600"} rounded-none flex-1`}
              onClick={() => setBoardType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={boardType === "mainboard" ? "default" : "ghost"}
              className={`${boardType === "mainboard" ? "bg-slate-900 text-white" : "text-slate-600"} rounded-none flex-1`}
              onClick={() => setBoardType("mainboard")}
            >
              Mainboard
            </Button>
            <Button
              size="sm"
              variant={boardType === "sme" ? "default" : "ghost"}
              className={`${boardType === "sme" ? "bg-slate-900 text-white" : "text-slate-600"} rounded-none flex-1`}
              onClick={() => setBoardType("sme")}
            >
              SME
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
