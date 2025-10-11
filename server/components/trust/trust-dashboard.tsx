"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, AlertTriangle, Eye, FileText, TrendingUp, Lock } from "lucide-react"
import { TrustScoreChart } from "./trust-score-chart"
import { VerificationStatus } from "./verification-status"
import { TransparencyReport } from "./transparency-report"

interface TrustMetric {
  id: string
  name: string
  score: number
  trend: "up" | "down" | "stable"
  description: string
  lastUpdated: string
}

interface VerificationItem {
  id: string
  type: string
  status: "verified" | "pending" | "failed"
  verifiedAt?: string
  expiresAt?: string
  description: string
}

export function TrustDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const trustMetrics: TrustMetric[] = [
    {
      id: "1",
      name: "Identity Verification",
      score: 95,
      trend: "stable",
      description: "KYC and identity documents verified",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      name: "Financial Credibility",
      score: 88,
      trend: "up",
      description: "Bank statements and income verification",
      lastUpdated: "1 week ago",
    },
    {
      id: "3",
      name: "Investment History",
      score: 92,
      trend: "up",
      description: "Track record of successful investments",
      lastUpdated: "3 days ago",
    },
    {
      id: "4",
      name: "Partnership Reliability",
      score: 85,
      trend: "stable",
      description: "Feedback from previous partnerships",
      lastUpdated: "5 days ago",
    },
  ]

  const verificationItems: VerificationItem[] = [
    {
      id: "1",
      type: "PAN Card",
      status: "verified",
      verifiedAt: "2024-01-15",
      expiresAt: "2025-01-15",
      description: "Government issued PAN card verification",
    },
    {
      id: "2",
      type: "Aadhaar Card",
      status: "verified",
      verifiedAt: "2024-01-15",
      expiresAt: "2025-01-15",
      description: "Aadhaar card verification with biometric",
    },
    {
      id: "3",
      type: "Bank Account",
      status: "verified",
      verifiedAt: "2024-01-20",
      description: "Primary bank account verification",
    },
    {
      id: "4",
      type: "Income Certificate",
      status: "pending",
      description: "Annual income verification pending",
    },
  ]

  const overallTrustScore = Math.round(
    trustMetrics.reduce((acc, metric) => acc + metric.score, 0) / trustMetrics.length,
  )

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Trust Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative">
              <div className="text-4xl font-bold text-blue-600 mb-2">{overallTrustScore}</div>
              <div className="text-sm text-muted-foreground mb-4">out of 100</div>
              <Progress value={overallTrustScore} className="h-2" />
            </div>
            <Badge variant="default" className="mt-4">
              Excellent Rating
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trust Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustMetrics.map((metric) => (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold">{metric.score}</span>
                      {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
                      {metric.trend === "down" && <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />}
                      {metric.trend === "stable" && <div className="h-3 w-3 rounded-full bg-gray-400" />}
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-1" />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrustScoreChart />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Recent Trust Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bank account verified</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Partnership feedback received</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Income verification pending</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your trust score is excellent! Continue maintaining transparency and completing verifications to keep your
              high rating.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <VerificationStatus items={verificationItems} />
        </TabsContent>

        <TabsContent value="transparency" className="space-y-6">
          <TransparencyReport />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Trust Reports</span>
                </CardTitle>
                <CardDescription>Download detailed trust and verification reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Trust Report</p>
                    <p className="text-sm text-muted-foreground">December 2024</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Verification Certificate</p>
                    <p className="text-sm text-muted-foreground">Valid until Jan 2025</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>Control what information is visible to other users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trust Score Visibility</span>
                  <Badge variant="default">Public</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Investment History</span>
                  <Badge variant="secondary">Partners Only</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification Status</span>
                  <Badge variant="default">Public</Badge>
                </div>
                <Button size="sm" className="w-full">
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
