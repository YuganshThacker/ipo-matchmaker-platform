"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Bell,
  Settings,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface NotificationStatus {
  id: string
  type: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
  error?: string
  messageId?: string
}

interface NotificationStats {
  total: number
  sent: number
  failed: number
  pending: number
  lastHour: number
  lastDay: number
}

export function NotificationStatusDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationStatus[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    lastHour: 0,
    lastDay: 0
  })
  const [loading, setLoading] = useState(true)
  const [emailServiceStatus, setEmailServiceStatus] = useState<'connected' | 'error' | 'unknown'>('unknown')

  useEffect(() => {
    fetchNotificationStatus()
    checkEmailServiceStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotificationStatus = async () => {
    try {
      // In a real implementation, this would fetch from an API
      // For demo purposes, we'll simulate notification data
      const mockNotifications: NotificationStatus[] = [
        {
          id: '1',
          type: 'partnership_request_received',
          recipient: 'user@example.com',
          subject: 'New Partnership Request - TechCorp Solutions',
          status: 'sent',
          sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
          messageId: 'msg_123456'
        },
        {
          id: '2',
          type: 'partnership_request_accepted',
          recipient: 'investor@example.com',
          subject: 'Partnership Request Accepted - GreenEnergy Ltd',
          status: 'sent',
          sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
          messageId: 'msg_123457'
        },
        {
          id: '3',
          type: 'ipo_alert',
          recipient: 'trader@example.com',
          subject: 'IPO Alert - FinTech Innovations Opening Soon',
          status: 'failed',
          sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          error: 'Invalid email address'
        },
        {
          id: '4',
          type: 'welcome',
          recipient: 'newuser@example.com',
          subject: 'Welcome to IPO Matchmaker!',
          status: 'pending',
          sentAt: new Date().toISOString()
        }
      ]

      setNotifications(mockNotifications)
      
      // Calculate stats
      const total = mockNotifications.length
      const sent = mockNotifications.filter(n => n.status === 'sent').length
      const failed = mockNotifications.filter(n => n.status === 'failed').length
      const pending = mockNotifications.filter(n => n.status === 'pending').length
      
      const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)
      const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24)
      
      const lastHour = mockNotifications.filter(n => new Date(n.sentAt) > oneHourAgo).length
      const lastDay = mockNotifications.filter(n => new Date(n.sentAt) > oneDayAgo).length

      setStats({ total, sent, failed, pending, lastHour, lastDay })
    } catch (error) {
      console.error('Error fetching notification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailServiceStatus = async () => {
    try {
      // In a real implementation, this would check the email service health
      // For demo, we'll simulate a successful connection
      setEmailServiceStatus('connected')
    } catch (error) {
      setEmailServiceStatus('error')
    }
  }

  const retryFailedNotification = async (notificationId: string) => {
    try {
      // In a real implementation, this would retry sending the notification
      toast({
        title: "Retrying Notification",
        description: "Attempting to resend the failed notification..."
      })
      
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'sent' as const, error: undefined, messageId: 'msg_retry_' + Date.now() }
              : n
          )
        )
        
        toast({
          title: "Success",
          description: "Notification sent successfully"
        })
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry notification",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('partnership')) {
      return <Users className="h-4 w-4 text-blue-600" />
    } else if (type.includes('ipo')) {
      return <TrendingUp className="h-4 w-4 text-orange-600" />
    } else if (type === 'welcome') {
      return <Mail className="h-4 w-4 text-purple-600" />
    }
    return <Bell className="h-4 w-4 text-gray-600" />
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view notification status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Service Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Notification Status</h2>
          <p className="text-muted-foreground">Monitor email delivery and system health</p>
        </div>
        <Button onClick={fetchNotificationStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Email Service Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {emailServiceStatus === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : emailServiceStatus === 'error' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">
                {emailServiceStatus === 'connected' ? 'Connected' : 
                 emailServiceStatus === 'error' ? 'Connection Error' : 'Checking...'}
              </span>
            </div>
            {emailServiceStatus === 'error' && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Service Issue
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Total Sent</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Successful</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Last Hour</span>
            </div>
            <p className="text-2xl font-bold">{stats.lastHour}</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Email notifications sent in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No notifications found
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {notification.subject}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(notification.status)}
                            {notification.status === 'failed' && (
                              <Button
                                onClick={() => retryFailedNotification(notification.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                              >
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>To: {notification.recipient}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(notification.sentAt)}</span>
                          {notification.messageId && (
                            <>
                              <span>•</span>
                              <span>ID: {notification.messageId}</span>
                            </>
                          )}
                        </div>
                        {notification.error && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {notification.error}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusIcon(notification.status)}
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
