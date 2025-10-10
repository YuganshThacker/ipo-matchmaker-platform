"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Shield, MessageSquare, Search, Plus, IndianRupee, IdCard, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface Partner {
  id: string
  name: string
  avatar: string
  investmentRange: string
  sectors: string[]
  experience: string
  successRate: number
  trustScore: number
  location: string
  description: string
  activePartnerships: number
}

interface Partnership {
  id: string
  name: string
  description: string
  targetAmount: string
  currentAmount: string
  partners: Partner[]
  status: "forming" | "active" | "completed"
  sector: string
  riskLevel: "low" | "medium" | "high"
  expectedReturns: string
  createdBy: string
  createdAt: string
  ipoName: string
  partnershipType: "investment" | "pan"
  offerAmount?: number
  isPublic: boolean
}

interface PartnershipRequest {
  id: string
  from: string
  type: "investment" | "pan"
  ipoName: string
  totalNeeded?: number
  requestedFromYou?: number
  panOwner?: "me" | "partner"
  message?: string
  status: "pending" | "accepted" | "declined"
  steps?: Array<{ label: string; completed: boolean }>
}

export function PartnershipHub() {
  const [activeTab, setActiveTab] = useState("create")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState("all")
  const [requestType, setRequestType] = useState("investment")
  const [offerAmount, setOfferAmount] = useState<number>(0)
  const [totalNeeded, setTotalNeeded] = useState<number>(0)
  const [selectedIPO, setSelectedIPO] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentUser')
      return saved || "You"
    }
    return "You"
  })
  const [editingPartnership, setEditingPartnership] = useState<string | null>(null)
  // Initialize state with localStorage data or default values
  const [partnerRequests, setPartnerRequests] = useState<PartnershipRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partnerRequests')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: "r1",
        from: "Rajesh Kumar",
        type: "investment",
        ipoName: "TechCorp Solutions",
        totalNeeded: 15000,
        requestedFromYou: 8000,
        panOwner: "partner",
        message: "Looking to co-invest. I can apply with my PAN.",
        status: "pending",
        steps: [
          { label: "Accepted by you", completed: false },
          { label: "Provide PAN to partner", completed: false },
          { label: "Partner applies for IPO", completed: false },
          { label: "Payment settled", completed: false },
        ],
      },
      {
        id: "r2",
        from: "Priya Sharma",
        type: "pan",
        ipoName: "GreenEnergy Ltd",
        panOwner: "me",
        message: "PAN-only request. I will fund and apply.",
        status: "pending",
        steps: [
          { label: "Accept PAN request", completed: false },
          { label: "Share PAN securely", completed: false },
          { label: "Application submitted", completed: false },
        ],
      },
    ]
  })
  
  // Initialize demo partnerships that should always be available
  const getDemoPartnerships = (): Partnership[] => [
    {
      id: "demo_1",
      name: "GreenEnergy Investment Pool",
      description: "Seeking co-investors for GreenEnergy Ltd IPO - Join me!",
      targetAmount: "₹16,000",
      currentAmount: "₹9,000",
      partners: [],
      status: "forming",
      sector: "Energy",
      riskLevel: "medium",
      expectedReturns: "18-22%",
      createdBy: "Priya Sharma",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      ipoName: "GreenEnergy Ltd",
      partnershipType: "investment",
      offerAmount: 9000,
      isPublic: true,
    },
    {
      id: "demo_2", 
      name: "FinTech PAN Partnership",
      description: "Need PAN holder for FinTech Innovations IPO - I'll fund it!",
      targetAmount: "₹16,250",
      currentAmount: "₹0",
      partners: [],
      status: "forming",
      sector: "Technology",
      riskLevel: "low",
      expectedReturns: "20-25%",
      createdBy: "Arjun Patel",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      ipoName: "FinTech Innovations",
      partnershipType: "pan",
      isPublic: true,
    },
    {
      id: "demo_3",
      name: "TechCorp Group Investment",
      description: "Looking for 2-3 partners for TechCorp IPO investment",
      targetAmount: "₹15,000",
      currentAmount: "₹5,000",
      partners: [],
      status: "forming",
      sector: "Technology",
      riskLevel: "medium",
      expectedReturns: "15-20%",
      createdBy: "Rajesh Kumar",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      ipoName: "TechCorp Solutions",
      partnershipType: "investment",
      offerAmount: 5000,
      isPublic: true,
    }
  ]

  const [allPartnerships, setAllPartnerships] = useState<Partnership[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('allPartnerships')
      if (saved) {
        const savedPartnerships = JSON.parse(saved)
        // Ensure demo partnerships are always present
        const demoPartnerships = getDemoPartnerships()
        const existingIds = savedPartnerships.map((p: Partnership) => p.id)
        const missingDemos = demoPartnerships.filter(demo => !existingIds.includes(demo.id))
        return [...savedPartnerships, ...missingDemos]
      }
    }
    return getDemoPartnerships()
  })
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [connectedPartners, setConnectedPartners] = useState<Set<string>>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('connectedPartners')
        return new Set(saved ? JSON.parse(saved) : [])
      }
      return new Set()
    }
  )

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('partnerRequests', JSON.stringify(partnerRequests))
    }
  }, [partnerRequests])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('allPartnerships', JSON.stringify(allPartnerships))
    }
  }, [allPartnerships])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('connectedPartners', JSON.stringify(Array.from(connectedPartners)))
    }
  }, [connectedPartners])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', currentUser)
    }
  }, [currentUser])

  // Ensure demo partnerships are always available
  useEffect(() => {
    const demoPartnerships = getDemoPartnerships()
    const existingIds = allPartnerships.map(p => p.id)
    const missingDemos = demoPartnerships.filter(demo => !existingIds.includes(demo.id))
    
    if (missingDemos.length > 0) {
      setAllPartnerships(prev => [...prev, ...missingDemos])
    }
  }, [allPartnerships])

  const mockPartners: Partner[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      avatar: "/professional-indian-man.png",
      investmentRange: "₹5L - ₹50L",
      sectors: ["Technology", "Healthcare"],
      experience: "8 years",
      successRate: 85,
      trustScore: 92,
      location: "Mumbai",
      description: "Experienced tech investor with focus on emerging startups and IPO opportunities.",
      activePartnerships: 3,
    },
    {
      id: "2",
      name: "Priya Sharma",
      avatar: "/professional-indian-woman.png",
      investmentRange: "₹10L - ₹1Cr",
      sectors: ["Finance", "Real Estate"],
      experience: "12 years",
      successRate: 78,
      trustScore: 88,
      location: "Delhi",
      description: "Strategic investor specializing in financial services and real estate IPOs.",
      activePartnerships: 5,
    },
    {
      id: "3",
      name: "Arjun Patel",
      avatar: "/professional-indian-businessman.png",
      investmentRange: "₹2L - ₹25L",
      sectors: ["Technology", "Finance"],
      experience: "5 years",
      successRate: 92,
      trustScore: 95,
      location: "Bangalore",
      description: "Young entrepreneur and angel investor focused on fintech and SaaS companies.",
      activePartnerships: 8,
    },
    {
      id: "4",
      name: "Kavitha Reddy",
      avatar: "/professional-indian-financial-advisor.jpg",
      investmentRange: "₹15L - ₹75L",
      sectors: ["Healthcare", "Real Estate"],
      experience: "15 years",
      successRate: 89,
      trustScore: 91,
      location: "Chennai",
      description: "Senior financial advisor with extensive experience in healthcare and real estate investments.",
      activePartnerships: 12,
    },
    {
      id: "5",
      name: "Vikram Singh",
      avatar: "/professional-indian-man.png",
      investmentRange: "₹8L - ₹40L",
      sectors: ["Technology", "Healthcare", "Finance"],
      experience: "10 years",
      successRate: 83,
      trustScore: 87,
      location: "Pune",
      description: "Diversified portfolio investor with strong track record in multiple sectors.",
      activePartnerships: 6,
    },
  ]

  const mockPartnerships: Partnership[] = [
    {
      id: "1",
      name: "Tech IPO Collective",
      description: "Focused on upcoming technology IPOs with high growth potential",
      targetAmount: "₹2 Crores",
      currentAmount: "₹1.2 Crores",
      partners: [mockPartners[0], mockPartners[1]],
      status: "forming",
      sector: "Technology",
      riskLevel: "medium",
      expectedReturns: "15-25%",
      createdBy: "Rajesh Kumar",
      createdAt: new Date().toISOString(),
      ipoName: "TechCorp Solutions",
      partnershipType: "investment",
      offerAmount: 120000,
      isPublic: true,
    },
  ]

  // Hardcoded IPO -> total needed mapping (frontend only; to be fetched later from backend)
  const ipoAmounts: Record<string, number> = {
    "TechCorp Solutions": 15000,
    "GreenEnergy Ltd": 16000,
    "FinTech Innovations": 16250,
  }

  const handleSelectIPO = (value: string) => {
    setSelectedIPO(value)
    const nameMap: Record<string, string> = {
      techcorp: "TechCorp Solutions",
      greenenergy: "GreenEnergy Ltd",
      fintech: "FinTech Innovations",
    }
    const friendly = nameMap[value] || value
    setTotalNeeded(ipoAmounts[friendly] || 0)
  }

  const handleCreatePartnership = () => {
    if (!selectedIPO || !requestType) {
      alert("Please select an IPO and partnership type")
      return
    }

    if (requestType === "investment" && !offerAmount) {
      alert("Please enter your offer amount")
      return
    }

    if (editingPartnership) {
      // Update existing partnership
      setAllPartnerships(prev => 
        prev.map(p => 
          p.id === editingPartnership 
            ? {
                ...p,
                name: `${selectedIPO} Partnership`,
                description: `${requestType === "investment" ? "Investment" : "PAN"} partnership for ${selectedIPO}`,
                targetAmount: `₹${totalNeeded.toLocaleString()}`,
                currentAmount: requestType === "investment" ? `₹${offerAmount.toLocaleString()}` : "₹0",
                ipoName: selectedIPO,
                partnershipType: requestType as "investment" | "pan",
                offerAmount: requestType === "investment" ? offerAmount : undefined,
              }
            : p
        )
      )
      setEditingPartnership(null)
    } else {
      // Create new partnership request
      const newRequest: Partnership = {
        id: Date.now().toString(),
        name: `${selectedIPO} Partnership`,
        description: `${requestType === "investment" ? "Investment" : "PAN"} partnership for ${selectedIPO}`,
        targetAmount: `₹${totalNeeded.toLocaleString()}`,
        currentAmount: requestType === "investment" ? `₹${offerAmount.toLocaleString()}` : "₹0",
        partners: [],
        status: "forming",
        sector: "Technology",
        riskLevel: "medium",
        expectedReturns: "15-25%",
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        ipoName: selectedIPO,
        partnershipType: requestType as "investment" | "pan",
        offerAmount: requestType === "investment" ? offerAmount : undefined,
        isPublic: true,
      }

      setAllPartnerships(prev => [...prev, newRequest])
    }
    
    setShowSuccessMessage(true)
    
    // Reset form
    setSelectedIPO("")
    setRequestType("investment")
    setOfferAmount(0)
    setTotalNeeded(0)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleAcceptRequest = (requestId: string) => {
    setPartnerRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "accepted" as const }
          : req
      )
    )
  }

  const handleDeclineRequest = (requestId: string) => {
    setPartnerRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "declined" as const }
          : req
      )
    )
  }

  const handleConnectPartner = (partnerId: string, partnerName: string) => {
    setConnectedPartners(prev => new Set([...prev, partnerId]))
    
    // Create a mock partnership request from this partner
    const newRequest: PartnershipRequest = {
      id: `req_${Date.now()}`,
      from: partnerName,
      type: "investment",
      ipoName: "TechCorp Solutions",
      totalNeeded: 15000,
      requestedFromYou: 7500,
      panOwner: "partner",
      message: `Hi! I saw your profile and would like to partner for IPO investments. Let's connect!`,
      status: "pending",
      steps: [
        { label: "Accepted by you", completed: false },
        { label: "Provide PAN to partner", completed: false },
        { label: "Partner applies for IPO", completed: false },
        { label: "Payment settled", completed: false },
      ],
    }

    setPartnerRequests(prev => [newRequest, ...prev])
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSector = selectedSector === "all" || 
                         partner.sectors.some(sector => sector.toLowerCase() === selectedSector.toLowerCase())
    
    return matchesSearch && matchesSector
  })

  const handleEditPartnership = (partnershipId: string) => {
    const partnership = allPartnerships.find(p => p.id === partnershipId)
    if (partnership && partnership.createdBy === currentUser) {
      setEditingPartnership(partnershipId)
      setSelectedIPO(partnership.ipoName)
      setRequestType(partnership.partnershipType)
      setOfferAmount(partnership.offerAmount || 0)
      setTotalNeeded(ipoAmounts[partnership.ipoName] || 0)
      setActiveTab("create")
    }
  }

  const handleCancelPartnership = (partnershipId: string) => {
    const partnership = allPartnerships.find(p => p.id === partnershipId)
    if (partnership && partnership.createdBy === currentUser) {
      if (confirm(`Are you sure you want to cancel "${partnership.name}"?`)) {
        setAllPartnerships(prev => prev.filter(p => p.id !== partnershipId))
      }
    }
  }

  const handleJoinPartnership = (partnershipId: string) => {
    const partnership = allPartnerships.find(p => p.id === partnershipId)
    if (!partnership) {
      alert("Partnership not found!")
      return
    }
    
    if (partnership.createdBy === currentUser) {
      alert("You cannot join your own partnership!")
      return
    }

    // Create a partnership request that will be sent to the partnership creator
    const targetAmount = parseInt(partnership.targetAmount.replace(/[₹,]/g, ""))
    const currentAmount = parseInt(partnership.currentAmount.replace(/[₹,]/g, ""))
    const remainingAmount = targetAmount - currentAmount
    
    const joinRequest: PartnershipRequest = {
      id: `join_${partnershipId}_${Date.now()}`,
      from: currentUser,
      type: partnership.partnershipType,
      ipoName: partnership.ipoName,
      totalNeeded: targetAmount,
      requestedFromYou: partnership.partnershipType === "investment" ? 
        Math.min(remainingAmount, Math.floor(remainingAmount / 2)) : 0,
      panOwner: partnership.partnershipType === "pan" ? "me" : "partner",
      message: `Hi! I would like to join your "${partnership.name}" partnership. Let's collaborate on this IPO investment!`,
      status: "pending",
      steps: partnership.partnershipType === "investment" ? [
        { label: "Accepted by creator", completed: false },
        { label: "Provide PAN details", completed: false },
        { label: "Apply for IPO", completed: false },
        { label: "Payment settled", completed: false },
      ] : [
        { label: "Accept PAN request", completed: false },
        { label: "Share PAN securely", completed: false },
        { label: "Application submitted", completed: false },
      ],
    }
    
    // Add to global partnership requests - this simulates sending the request to the creator
    setPartnerRequests(prev => {
      // Remove any existing join request for the same partnership from the same user
      const filtered = prev.filter(req => 
        !(req.id.startsWith(`join_${partnershipId}`) && req.from === currentUser)
      )
      return [joinRequest, ...filtered]
    })
    
    setShowSuccessMessage(true)
    alert(`Join request sent to ${partnership.createdBy}! Switch to "${partnership.createdBy}" to see and accept the request.`)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const switchUser = (userName: string) => {
    setCurrentUser(userName)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', userName)
    }
  }

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('partnerRequests')
      localStorage.removeItem('allPartnerships')
      localStorage.removeItem('connectedPartners')
      localStorage.removeItem('currentUser')
    }
    // Reset to default state with demo data
    setPartnerRequests([
      {
        id: "r1",
        from: "Rajesh Kumar",
        type: "investment",
        ipoName: "TechCorp Solutions",
        totalNeeded: 15000,
        requestedFromYou: 8000,
        panOwner: "partner",
        message: "Looking to co-invest. I can apply with my PAN.",
        status: "pending",
        steps: [
          { label: "Accepted by you", completed: false },
          { label: "Provide PAN to partner", completed: false },
          { label: "Partner applies for IPO", completed: false },
          { label: "Payment settled", completed: false },
        ],
      },
      {
        id: "r2",
        from: "Priya Sharma",
        type: "pan",
        ipoName: "GreenEnergy Ltd",
        panOwner: "me",
        message: "PAN-only request. I will fund and apply.",
        status: "pending",
        steps: [
          { label: "Accept PAN request", completed: false },
          { label: "Share PAN securely", completed: false },
          { label: "Application submitted", completed: false },
        ],
      },
    ])
    setAllPartnerships(getDemoPartnerships())
    setConnectedPartners(new Set())
    setCurrentUser("You")
    alert("Demo data reset! You should now see 3 demo partnerships in the 'Browse All' tab.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current User:</span>
            <Select value={currentUser} onValueChange={switchUser}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="You">You</SelectItem>
                <SelectItem value="Rajesh Kumar">Rajesh Kumar</SelectItem>
                <SelectItem value="Priya Sharma">Priya Sharma</SelectItem>
                <SelectItem value="Arjun Patel">Arjun Patel</SelectItem>
                <SelectItem value="Kavitha Reddy">Kavitha Reddy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={clearAllData}
          className="text-xs"
        >
          Reset Demo Data
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="requests-received">Received</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* Create Partnership - compact row, no scroll */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="ipo">Select IPO</Label>
                  <Select onValueChange={handleSelectIPO}>
                    <SelectTrigger id="ipo">
                      <SelectValue placeholder="Choose IPO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techcorp">TechCorp Solutions</SelectItem>
                      <SelectItem value="greenenergy">GreenEnergy Ltd</SelectItem>
                      <SelectItem value="fintech">FinTech Innovations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Partnership Type</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">Investment Partnership</SelectItem>
                      <SelectItem value="pan">PAN Account Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Needed (₹)</Label>
                  <Input value={totalNeeded ? totalNeeded.toString() : ""} readOnly placeholder="Select IPO to auto-fill" />
                </div>
              </div>

              {requestType === "investment" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>Your Offer (₹)</Label>
                    <Input type="number" value={offerAmount || ""} onChange={(e) => setOfferAmount(Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <div className="text-sm text-slate-600">
                      Expected From Partner: <span className="font-semibold">₹{Math.max((totalNeeded || 0) - (offerAmount || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4 gap-2">
                {editingPartnership && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingPartnership(null)
                      setSelectedIPO("")
                      setRequestType("investment")
                      setOfferAmount(0)
                      setTotalNeeded(0)
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button size="sm" onClick={handleCreatePartnership}>
                  {editingPartnership ? "Update Partnership" : "Create Request"}
                </Button>
              </div>
              
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm"
                >
                  ✅ Partnership {editingPartnership ? "updated" : "created"} successfully!
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse All Partnerships */}
        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {allPartnerships.length} partnerships from all users
              </p>
              <p className="text-xs text-blue-600">
                Current user: {currentUser} • Demo partnerships available: {getDemoPartnerships().length}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setAllPartnerships(getDemoPartnerships())}
            >
              Reload Demo Partnerships
            </Button>
          </div>
          
          {allPartnerships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No partnerships available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to create a partnership!
                </p>
              </CardContent>
            </Card>
          ) : (
            allPartnerships.map((partnership) => (
              <Card key={partnership.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{partnership.name}</CardTitle>
                      <CardDescription>
                        Created by {partnership.createdBy} • {partnership.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{partnership.status}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {partnership.partnershipType === "investment" ? "Investment" : "PAN"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Target: {partnership.targetAmount}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Current: {partnership.currentAmount}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Returns: {partnership.expectedReturns}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(partnership.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {partnership.createdBy === currentUser ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditPartnership(partnership.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleCancelPartnership(partnership.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleJoinPartnership(partnership.id)}
                      >
                        Join Partnership
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-4">
          {allPartnerships.filter(p => p.createdBy === currentUser).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No partnership requests created yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first partnership request in the "Create Partnership" tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            allPartnerships.filter(p => p.createdBy === currentUser).map((partnership) => (
              <Card key={partnership.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{partnership.name}</CardTitle>
                      <CardDescription>{partnership.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{partnership.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Target Amount: {partnership.targetAmount}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Current: {partnership.currentAmount}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Expected Returns: {partnership.expectedReturns}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditPartnership(partnership.id)}
                    >
                      Edit Request
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleCancelPartnership(partnership.id)}
                    >
                      Cancel Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Discover partners */}
        <TabsContent value="discover" className="space-y-6">
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm"
            >
              ✅ Connection request sent successfully! Check "Requests Received" tab.
            </motion.div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners by name, location, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPartners.length} of {mockPartners.length} partners
            </p>
            <p className="text-sm text-muted-foreground">
              {connectedPartners.size} connections made
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                        <AvatarFallback>
                          {partner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <CardDescription>
                          {partner.location} • {partner.experience}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{partner.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Investment Range:</span>
                        <span className="font-medium">{partner.investmentRange}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-600">{partner.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trust Score:</span>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-600">{partner.trustScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {partner.sectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnectPartner(partner.id, partner.name)}
                        disabled={connectedPartners.has(partner.id)}
                        variant={connectedPartners.has(partner.id) ? "secondary" : "default"}
                      >
                        {connectedPartners.has(partner.id) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Requests received - show steps only after accepted */}
        <TabsContent value="requests-received" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Requests for partnerships you created or requests sent to you
            </p>
          </div>
          
          {partnerRequests.filter(req => {
            // Show requests where:
            // 1. It's a general request (like the default ones)
            // 2. It's a join request for a partnership created by current user
            const isJoinRequest = req.id.startsWith('join_')
            if (isJoinRequest) {
              const partnershipId = req.id.split('_')[1]
              const partnership = allPartnerships.find(p => p.id === partnershipId)
              return partnership?.createdBy === currentUser
            }
            return true // Show general requests to everyone for demo purposes
          }).map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{req.from}</CardTitle>
                    <CardDescription>
                      {req.type === "investment" ? "Investment Partnership" : "PAN Holder Partnership"} • {req.ipoName}
                    </CardDescription>
                  </div>
                  <Badge>{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {req.type === "investment" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4" />Total Needed: ₹{req.totalNeeded?.toLocaleString()}</div>
                    <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4" />Requested From You: ₹{req.requestedFromYou?.toLocaleString()}</div>
                    <div className="flex items-center gap-2"><IdCard className="h-4 w-4" />PAN Owner: {req.panOwner === "me" ? "You" : req.from}</div>
                  </div>
                )}
                {req.type === "pan" && (
                  <div className="text-sm flex items-center gap-2"><IdCard className="h-4 w-4" />PAN Owner: {req.panOwner === "me" ? "You" : req.from}</div>
                )}
                {req.status === "accepted" && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs text-slate-500">Progress</div>
                    <div className="grid gap-1">
                      {req.steps?.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${s.completed ? "text-emerald-600" : "text-slate-300"}`} />
                          <span className={s.completed ? "text-slate-700" : "text-slate-500"}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleAcceptRequest(req.id)}
                    disabled={req.status !== "pending"}
                  >
                    {req.status === "accepted" ? "Accepted ✓" : req.status === "declined" ? "Declined" : "Accept"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDeclineRequest(req.id)}
                    disabled={req.status !== "pending"}
                  >
                    {req.status === "declined" ? "Declined ✓" : "Decline"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="requests-sent" className="space-y-4">
          {[1,2].map((id) => (
            <Card key={id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/professional-indian-woman.png" />
                      <AvatarFallback>PS</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Priya Sharma</CardTitle>
                      <CardDescription>PAN Account Partnership</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        {/* Accepted requests */}
        <TabsContent value="accepted" className="space-y-4">
          {partnerRequests
            .filter((r) => r.status === "accepted")
            .map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.from}</CardTitle>
                      <CardDescription>
                        {req.type === "investment" ? "Investment Partnership" : "PAN Holder Partnership"} • {req.ipoName}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Accepted</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {req.type === "investment" ? (
                    <div className="grid gap-1">
                      {req.steps?.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${s.completed ? "text-emerald-600" : "text-slate-300"}`} />
                          <span className={s.completed ? "text-slate-700" : "text-slate-500"}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">IPO Application Status: Awaiting submission</div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        
      </Tabs>
    </div>
  )
}
