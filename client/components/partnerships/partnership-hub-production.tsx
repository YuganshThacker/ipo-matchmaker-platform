"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Shield, MessageSquare, Search, IndianRupee, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

interface Partner {
  id: string
  name: string
  avatar?: string
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
  targetAmount: number
  currentAmount: number
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
  participants?: Array<{
    userId: string
    userName: string
    joinedAt: string
    contribution: number
    status: "pending" | "confirmed"
  }>
}

interface PartnershipRequest {
  id: string
  from: string
  fromUserId: string
  to: string
  toUserId: string
  partnershipId: string
  type: "investment" | "pan" | "join"
  ipoName: string
  totalNeeded?: number
  requestedAmount?: number
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  steps?: Array<{ label: string; completed: boolean }>
}

export function PartnershipHub() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState("all")
  const [requestType, setRequestType] = useState("investment")
  const [offerAmount, setOfferAmount] = useState<number>(0)
  const [totalNeeded, setTotalNeeded] = useState<number>(0)
  const [selectedIPO, setSelectedIPO] = useState<string>("")
  const [editingPartnership, setEditingPartnership] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [requests, setRequests] = useState<PartnershipRequest[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // IPO amounts mapping
  const ipoAmounts: Record<string, number> = {
    "TechCorp Solutions": 15000,
    "GreenEnergy Ltd": 16000,
    "FinTech Innovations": 16250,
  }

  // Fetch partnerships
  const fetchPartnerships = async () => {
    try {
      const response = await fetch("/api/partnerships")
      if (response.ok) {
        const data = await response.json()
        setPartnerships(data.partnerships || [])
      }
    } catch (error) {
      console.error("Error fetching partnerships:", error)
    }
  }

  // Fetch requests
  const fetchRequests = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/partnerships/requests", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  // Fetch partners
  const fetchPartners = async () => {
    try {
      const query = new URLSearchParams()
      if (searchQuery) query.append("search", searchQuery)
      if (selectedSector !== "all") query.append("sector", selectedSector)
      
      const response = await fetch(`/api/users?${query}`)
      if (response.ok) {
        const data = await response.json()
        setPartners(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching partners:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchPartnerships()
    fetchRequests()
    fetchPartners()
  }, [user])

  // Refetch partners when search/filter changes
  useEffect(() => {
    fetchPartners()
  }, [searchQuery, selectedSector])

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

  const handleCreatePartnership = async () => {
    if (!user) {
      alert("Please log in to create partnerships")
      return
    }

    if (!selectedIPO || !requestType) {
      alert("Please select an IPO and partnership type")
      return
    }

    if (requestType === "investment" && !offerAmount) {
      alert("Please enter your offer amount")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const body = {
        name: `${selectedIPO} Partnership`,
        description: `${requestType === "investment" ? "Investment" : "PAN"} partnership for ${selectedIPO}`,
        targetAmount: totalNeeded,
        ipoName: selectedIPO,
        partnershipType: requestType,
        offerAmount: requestType === "investment" ? offerAmount : 0,
        sector: "Technology",
        expectedReturns: "15-25%"
      }

      const url = editingPartnership ? "/api/partnerships" : "/api/partnerships"
      const method = editingPartnership ? "PUT" : "POST"
      
      if (editingPartnership) {
        (body as any).id = editingPartnership
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setShowSuccessMessage(true)
        setSuccessMessage(editingPartnership ? "Partnership updated successfully!" : "Partnership created successfully!")
        setTimeout(() => setShowSuccessMessage(false), 3000)
        
        // Reset form
        setSelectedIPO("")
        setRequestType("investment")
        setOfferAmount(0)
        setTotalNeeded(0)
        setEditingPartnership(null)
        
        // Refresh data
        fetchPartnerships()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create partnership")
      }
    } catch (error) {
      console.error("Error creating partnership:", error)
      alert("Failed to create partnership")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinPartnership = async (partnershipId: string) => {
    if (!user) {
      alert("Please log in to join partnerships")
      return
    }

    const partnership = partnerships.find(p => p.id === partnershipId)
    if (!partnership) {
      alert("Partnership not found!")
      return
    }
    
    if (partnership.createdBy === user.id) {
      alert("You cannot join your own partnership!")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const remainingAmount = partnership.targetAmount - partnership.currentAmount
      const requestedAmount = Math.min(remainingAmount, Math.floor(remainingAmount / 2))

      const response = await fetch("/api/partnerships/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partnershipId,
          type: "join",
          message: `Hi! I would like to join your "${partnership.name}" partnership. Let's collaborate on this IPO investment!`,
          requestedAmount
        })
      })

      if (response.ok) {
        setShowSuccessMessage(true)
        setSuccessMessage("Join request sent successfully!")
        setTimeout(() => setShowSuccessMessage(false), 3000)
        fetchRequests()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send join request")
      }
    } catch (error) {
      console.error("Error joining partnership:", error)
      alert("Failed to send join request")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/partnerships/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: requestId, status: "accepted" })
      })

      if (response.ok) {
        fetchRequests()
        fetchPartnerships()
        setShowSuccessMessage(true)
        setSuccessMessage("Request accepted successfully!")
        setTimeout(() => setShowSuccessMessage(false), 3000)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to accept request")
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      alert("Failed to accept request")
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/partnerships/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: requestId, status: "declined" })
      })

      if (response.ok) {
        fetchRequests()
        setShowSuccessMessage(true)
        setSuccessMessage("Request declined")
        setTimeout(() => setShowSuccessMessage(false), 3000)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to decline request")
      }
    } catch (error) {
      console.error("Error declining request:", error)
      alert("Failed to decline request")
    } finally {
      setLoading(false)
    }
  }

  const handleEditPartnership = (partnershipId: string) => {
    const partnership = partnerships.find(p => p.id === partnershipId)
    if (partnership && partnership.createdBy === user?.id) {
      setEditingPartnership(partnershipId)
      setSelectedIPO(partnership.ipoName)
      setRequestType(partnership.partnershipType)
      setOfferAmount(partnership.offerAmount || 0)
      setTotalNeeded(partnership.targetAmount)
      setActiveTab("create")
    }
  }

  const handleDeletePartnership = async (partnershipId: string) => {
    const partnership = partnerships.find(p => p.id === partnershipId)
    if (!partnership || partnership.createdBy !== user?.id) return
    
    if (!confirm(`Are you sure you want to delete "${partnership.name}"?`)) return

    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/partnerships?id=${partnershipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchPartnerships()
        setShowSuccessMessage(true)
        setSuccessMessage("Partnership deleted successfully!")
        setTimeout(() => setShowSuccessMessage(false), 3000)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete partnership")
      }
    } catch (error) {
      console.error("Error deleting partnership:", error)
      alert("Failed to delete partnership")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => `₹${amount.toLocaleString()}`

  const myPartnerships = partnerships.filter(p => p.createdBy === user?.id)
  const receivedRequests = requests.filter(req => req.toUserId === user?.id)
  const acceptedRequests = requests.filter(req => req.status === "accepted")

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access partnership features</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm"
        >
          ✅ {successMessage}
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="my-requests">My Partnerships</TabsTrigger>
          <TabsTrigger value="requests-received">Received</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* Create Partnership */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingPartnership ? "Edit Partnership" : "Create New Partnership"}</CardTitle>
              <CardDescription>
                {editingPartnership ? "Update your partnership details" : "Start a new IPO investment partnership"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ipo">Select IPO</Label>
                  <Select value={selectedIPO ? (Object.entries({
                    "TechCorp Solutions": "techcorp",
                    "GreenEnergy Ltd": "greenenergy", 
                    "FinTech Innovations": "fintech"
                  }).find(([name]) => name === selectedIPO)?.[1] || "") : ""} onValueChange={handleSelectIPO}>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Your Offer (₹)</Label>
                    <Input 
                      type="number" 
                      value={offerAmount || ""} 
                      onChange={(e) => setOfferAmount(Number(e.target.value))} 
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <div className="text-sm text-slate-600">
                      Expected From Partner: <span className="font-semibold">₹{Math.max((totalNeeded || 0) - (offerAmount || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {editingPartnership && (
                  <Button 
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
                <Button onClick={handleCreatePartnership} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingPartnership ? "Update Partnership" : "Create Partnership"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse All Partnerships */}
        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {partnerships.length} partnerships
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchPartnerships} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Refresh
            </Button>
          </div>
          
          {partnerships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No partnerships available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to create a partnership!
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("create")}>
                  Create Partnership
                </Button>
              </CardContent>
            </Card>
          ) : (
            partnerships.map((partnership) => (
              <Card key={partnership.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{partnership.name}</CardTitle>
                      <CardDescription>{partnership.description}</CardDescription>
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
                      Target: {formatAmount(partnership.targetAmount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Current: {formatAmount(partnership.currentAmount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Returns: {partnership.expectedReturns}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(partnership.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {partnership.participants && partnership.participants.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Participants: {partnership.participants.map(p => p.userName).join(", ")}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    {partnership.createdBy === user?.id ? (
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
                          onClick={() => handleDeletePartnership(partnership.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleJoinPartnership(partnership.id)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Join Partnership
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Partnerships */}
        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your partnerships ({myPartnerships.length})
            </p>
          </div>

          {myPartnerships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No partnerships created yet.</p>
                <Button className="mt-4" onClick={() => setActiveTab("create")}>
                  Create Your First Partnership
                </Button>
              </CardContent>
            </Card>
          ) : (
            myPartnerships.map((partnership) => (
              <Card key={partnership.id}>
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
                      Target: {formatAmount(partnership.targetAmount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Current: {formatAmount(partnership.currentAmount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Returns: {partnership.expectedReturns}
                    </div>
                  </div>
                  
                  {partnership.participants && partnership.participants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Participants:</h4>
                      <div className="space-y-1">
                        {partnership.participants.map((participant, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex justify-between">
                            <span>{participant.userName}</span>
                            <span>{formatAmount(participant.contribution)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
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
                      onClick={() => handleDeletePartnership(partnership.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Requests Received */}
        <TabsContent value="requests-received" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Partnership requests ({receivedRequests.length})
            </p>
          </div>
          
          {receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No partnership requests received.</p>
              </CardContent>
            </Card>
          ) : (
            receivedRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.from}</CardTitle>
                      <CardDescription>
                        {req.type === "join" ? "Join Request" : req.type === "investment" ? "Investment Partnership" : "PAN Partnership"} • {req.ipoName}
                      </CardDescription>
                    </div>
                    <Badge variant={req.status === "pending" ? "default" : req.status === "accepted" ? "secondary" : "destructive"}>
                      {req.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{req.message}</p>
                  
                  {req.requestedAmount && (
                    <div className="text-sm">
                      <span className="font-medium">Requested Amount: </span>
                      {formatAmount(req.requestedAmount)}
                    </div>
                  )}

                  {req.status === "accepted" && req.steps && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs text-slate-500">Progress</div>
                      <div className="space-y-1">
                        {req.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 ${step.completed ? "text-emerald-600" : "text-slate-300"}`} />
                            <span className={step.completed ? "text-slate-700" : "text-slate-500"}>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {req.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDeclineRequest(req.id)}
                        disabled={loading}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Accepted Requests */}
        <TabsContent value="accepted" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Accepted partnerships ({acceptedRequests.length})
            </p>
          </div>

          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No accepted partnerships yet.</p>
              </CardContent>
            </Card>
          ) : (
            acceptedRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.fromUserId === user?.id ? req.to : req.from}</CardTitle>
                      <CardDescription>
                        Partnership for {req.ipoName}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {req.steps && (
                    <div className="space-y-1">
                      {req.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${step.completed ? "text-emerald-600" : "text-slate-300"}`} />
                          <span className={step.completed ? "text-slate-700" : "text-slate-500"}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Discover Partners */}
        <TabsContent value="discover" className="space-y-6">
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {partners.length} partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.filter(partner => partner.id !== user?.id).map((partner, index) => (
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
                      <Button size="sm" className="flex-1" disabled>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Connect (Coming Soon)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
