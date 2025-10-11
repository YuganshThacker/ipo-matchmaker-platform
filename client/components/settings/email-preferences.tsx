"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Bell, Shield, TrendingUp, Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface EmailPreferences {
  userId: string
  email: string
  notifications: {
    partnershipRequests: boolean
    partnershipUpdates: boolean
    ipoAlerts: boolean
    marketingEmails: boolean
    securityAlerts: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
  categories: string[]
  unsubscribeToken: string
  createdAt: string
  updatedAt: string
}

export function EmailPreferencesSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)

  // Fetch current preferences
  useEffect(() => {
    fetchPreferences()
  }, [user])

  const fetchPreferences = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/email-preferences", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      } else {
        throw new Error('Failed to fetch preferences')
      }
    } catch (error) {
      console.error("Error fetching email preferences:", error)
      toast({
        title: "Error",
        description: "Failed to load email preferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<EmailPreferences>) => {
    if (!user || !preferences) return

    try {
      setSaving(true)
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/email-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
        toast({
          title: "Success",
          description: "Email preferences updated successfully"
        })
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!user) return

    try {
      setTestEmailSent(true)
      const response = await fetch("/api/notifications?type=welcome&to=" + encodeURIComponent(user.email))
      
      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email"
        })
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => setTestEmailSent(false), 3000)
    }
  }

  const handleNotificationToggle = (key: keyof EmailPreferences['notifications']) => {
    if (!preferences) return
    
    const updatedNotifications = {
      ...preferences.notifications,
      [key]: !preferences.notifications[key]
    }
    
    updatePreferences({ notifications: updatedNotifications })
  }

  const handleFrequencyChange = (frequency: EmailPreferences['frequency']) => {
    updatePreferences({ frequency })
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to manage email preferences</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading email preferences...</p>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load email preferences</p>
          <Button onClick={fetchPreferences} variant="outline" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle>Email Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage how and when you receive email notifications from IPO Matchmaker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{preferences.email}</p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(preferences.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <Button 
              onClick={sendTestEmail} 
              variant="outline" 
              size="sm"
              disabled={testEmailSent}
            >
              {testEmailSent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Types</span>
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Partnership Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <Label className="font-medium">Partnership Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    New partnership requests and responses
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.partnershipRequests}
                onCheckedChange={() => handleNotificationToggle('partnershipRequests')}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <Label className="font-medium">Partnership Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Status changes and partnership completions
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.partnershipUpdates}
                onCheckedChange={() => handleNotificationToggle('partnershipUpdates')}
                disabled={saving}
              />
            </div>
          </div>

          <Separator />

          {/* IPO Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="font-medium">IPO Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  New IPO announcements and opening notifications
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.ipoAlerts}
              onCheckedChange={() => handleNotificationToggle('ipoAlerts')}
              disabled={saving}
            />
          </div>

          <Separator />

          {/* Security Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <Label className="font-medium">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important security notifications (recommended)
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.securityAlerts}
              onCheckedChange={() => handleNotificationToggle('securityAlerts')}
              disabled={saving}
            />
          </div>

          <Separator />

          {/* Marketing Emails */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <Label className="font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates, tips, and promotional content
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.marketingEmails}
              onCheckedChange={() => handleNotificationToggle('marketingEmails')}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Email Frequency</CardTitle>
          <CardDescription>
            How often would you like to receive non-urgent notifications?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={preferences.frequency} 
            onValueChange={handleFrequencyChange}
            disabled={saving}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">Immediate</Badge>
                  <span>Send emails immediately</span>
                </div>
              </SelectItem>
              <SelectItem value="daily">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-600">Daily</Badge>
                  <span>Daily digest (9:00 AM)</span>
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-purple-600">Weekly</Badge>
                  <span>Weekly summary (Mondays)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Unsubscribe Info */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <XCircle className="h-5 w-5" />
            <span>Unsubscribe</span>
          </CardTitle>
          <CardDescription>
            You can unsubscribe from all non-essential emails at any time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Unsubscribe links are included in all our emails. Security alerts cannot be disabled 
            but all other notifications can be turned off individually above.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              updatePreferences({
                notifications: {
                  ...preferences.notifications,
                  partnershipRequests: false,
                  partnershipUpdates: false,
                  ipoAlerts: false,
                  marketingEmails: false
                }
              })
            }}
            disabled={saving}
          >
            Disable All Non-Essential Emails
          </Button>
        </CardContent>
      </Card>

      {/* Save Status */}
      {saving && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving preferences...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
