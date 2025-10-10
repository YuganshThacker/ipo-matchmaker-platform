"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Upload, FileText } from "lucide-react"

interface VerificationItem {
  id: string
  type: string
  status: "verified" | "pending" | "failed"
  verifiedAt?: string
  expiresAt?: string
  description: string
}

interface VerificationStatusProps {
  items: VerificationItem[]
}

export function VerificationStatus({ items }: VerificationStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Verification</span>
          </CardTitle>
          <CardDescription>Complete your document verification to increase your trust score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.verifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Verified on {new Date(item.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                    {item.expiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Expires on {new Date(item.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(item.status)}
                  {item.status === "pending" && (
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                  {item.status === "failed" && (
                    <Button size="sm" variant="outline">
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Verifications</CardTitle>
          <CardDescription>Optional verifications to further boost your trust score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Professional References</p>
                <p className="text-sm text-muted-foreground">Add professional references</p>
              </div>
              <Button size="sm" variant="outline">
                Add References
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Social Media Verification</p>
                <p className="text-sm text-muted-foreground">Link your LinkedIn profile</p>
              </div>
              <Button size="sm" variant="outline">
                Connect LinkedIn
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Investment Portfolio</p>
                <p className="text-sm text-muted-foreground">Share your investment history</p>
              </div>
              <Button size="sm" variant="outline">
                Upload Portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
