"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Users, TrendingUp, Shield, Award, Star } from "lucide-react"

export function TransparencyReport() {
  const transparencyMetrics = [
    {
      name: "Profile Completeness",
      score: 95,
      description: "All required profile information provided",
    },
    {
      name: "Investment Disclosure",
      score: 88,
      description: "Investment history and preferences shared",
    },
    {
      name: "Partnership Feedback",
      score: 92,
      description: "Feedback from previous partnerships",
    },
    {
      name: "Communication Responsiveness",
      score: 85,
      description: "Average response time to messages",
    },
  ]

  const achievements = [
    {
      name: "Trusted Partner",
      description: "Completed 5+ successful partnerships",
      earned: true,
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Transparency Champion",
      description: "Maintained 90+ transparency score for 6 months",
      earned: true,
      icon: <Eye className="h-5 w-5" />,
    },
    {
      name: "Top Performer",
      description: "Achieved top 10% returns in partnerships",
      earned: false,
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Security Expert",
      description: "Completed advanced security verification",
      earned: true,
      icon: <Shield className="h-5 w-5" />,
    },
  ]

  const partnershipHistory = [
    {
      name: "Tech IPO Collective",
      duration: "6 months",
      returns: "+18.5%",
      rating: 4.8,
      status: "completed",
    },
    {
      name: "Healthcare Growth Fund",
      duration: "4 months",
      returns: "+12.3%",
      rating: 4.6,
      status: "completed",
    },
    {
      name: "Fintech Opportunities",
      duration: "2 months",
      returns: "Ongoing",
      rating: 4.9,
      status: "active",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Transparency Metrics</span>
            </CardTitle>
            <CardDescription>How transparent and open you are with other investors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transparencyMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm font-bold">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Trust Achievements</span>
            </CardTitle>
            <CardDescription>Badges earned through consistent trustworthy behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${achievement.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                >
                  <div
                    className={`p-2 rounded-full ${achievement.earned ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${achievement.earned ? "text-green-800" : "text-gray-600"}`}>
                      {achievement.name}
                    </p>
                    <p className={`text-xs ${achievement.earned ? "text-green-600" : "text-gray-500"}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Partnership History</span>
          </CardTitle>
          <CardDescription>Your track record with previous investment partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnershipHistory.map((partnership, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{partnership.name}</p>
                    <Badge variant={partnership.status === "active" ? "default" : "secondary"}>
                      {partnership.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Duration: {partnership.duration}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{partnership.returns}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-sm">{partnership.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
