"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Plus, IndianRupee, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddInvestmentDialogProps {
  onInvestmentAdded?: () => void
}

export function AddInvestmentDialog({ onInvestmentAdded }: AddInvestmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    symbol: "",
    sector: "",
    investmentType: "direct_equity" as const,
    shares: "",
    pricePerShare: "",
    investmentDate: new Date().toISOString().split('T')[0],
    notes: ""
  })
  
  const { toast } = useToast()

  const sectors = [
    "Technology",
    "Healthcare", 
    "Finance",
    "Energy",
    "Consumer Goods",
    "Manufacturing",
    "Real Estate",
    "Telecommunications",
    "Retail",
    "Transportation",
    "Other"
  ]

  const investmentTypes = [
    { value: "ipo", label: "IPO" },
    { value: "secondary", label: "Secondary Market" },
    { value: "direct_equity", label: "Direct Equity" },
    { value: "mutual_fund", label: "Mutual Fund" }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateTotalAmount = () => {
    const shares = parseFloat(formData.shares) || 0
    const price = parseFloat(formData.pricePerShare) || 0
    return shares * price
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.symbol || !formData.sector || 
        !formData.shares || !formData.pricePerShare) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (parseFloat(formData.shares) <= 0 || parseFloat(formData.pricePerShare) <= 0) {
      toast({
        title: "Invalid Values",
        description: "Shares and price must be positive numbers",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/portfolio/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          symbol: formData.symbol,
          sector: formData.sector,
          investmentType: formData.investmentType,
          shares: parseFloat(formData.shares),
          pricePerShare: parseFloat(formData.pricePerShare),
          investmentDate: formData.investmentDate
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Investment Added",
          description: `Successfully added ${formData.shares} shares of ${formData.companyName}`,
        })
        
        // Reset form
        setFormData({
          companyName: "",
          symbol: "",
          sector: "",
          investmentType: "direct_equity",
          shares: "",
          pricePerShare: "",
          investmentDate: new Date().toISOString().split('T')[0],
          notes: ""
        })
        
        setOpen(false)
        onInvestmentAdded?.()
      } else {
        throw new Error(data.error || "Failed to add investment")
      }
    } catch (error) {
      console.error("Error adding investment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add investment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Add New Investment
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="e.g., TechCorp Ltd"
                required
              />
            </div>
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                placeholder="e.g., TECH"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sector">Sector *</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleInputChange("sector", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investmentType">Investment Type</Label>
              <Select
                value={formData.investmentType}
                onValueChange={(value) => handleInputChange("investmentType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Investment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="shares">Number of Shares *</Label>
              <Input
                id="shares"
                type="number"
                value={formData.shares}
                onChange={(e) => handleInputChange("shares", e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerShare">Price per Share *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pricePerShare"
                  type="number"
                  value={formData.pricePerShare}
                  onChange={(e) => handleInputChange("pricePerShare", e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="investmentDate">Investment Date</Label>
              <Input
                id="investmentDate"
                type="date"
                value={formData.investmentDate}
                onChange={(e) => handleInputChange("investmentDate", e.target.value)}
              />
            </div>
          </div>

          {/* Total Amount Display */}
          {(formData.shares || formData.pricePerShare) && (
            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Investment Amount:</span>
                  <span className="text-lg font-semibold text-primary">
                    ₹{calculateTotalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optional Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add any notes about this investment..."
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
