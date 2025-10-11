// Email notification helper functions for seamless integration

import { type NotificationType } from './email'

/**
 * Sends an email notification without requiring manual API calls
 * This is a convenience wrapper around the notifications API
 */
export async function sendNotification(
  type: NotificationType,
  to: string,
  data: any
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data })
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

/**
 * Partnership notification helpers
 */
export const PartnershipNotifications = {
  /**
   * Notify when a partnership request is sent
   */
  async requestSent(senderEmail: string, data: {
    fromUserName: string
    toUserName: string
    ipoName: string
    requestedAmount?: number
    type: 'investment' | 'pan'
  }) {
    return sendNotification('partnership_request_sent', senderEmail, data)
  },

  /**
   * Notify when a partnership request is received
   */
  async requestReceived(recipientEmail: string, data: {
    fromUserName: string
    toUserName: string
    ipoName: string
    requestedAmount?: number
    type: 'investment' | 'pan'
    message?: string
  }) {
    return sendNotification('partnership_request_received', recipientEmail, data)
  },

  /**
   * Notify when a partnership request is accepted
   */
  async requestAccepted(requesterEmail: string, data: {
    fromUserName: string
    acceptedBy: string
    ipoName: string
    type: 'investment' | 'pan'
    amount?: number
  }) {
    return sendNotification('partnership_request_accepted', requesterEmail, data)
  },

  /**
   * Notify when a partnership request is declined
   */
  async requestDeclined(requesterEmail: string, data: {
    fromUserName: string
    ipoName: string
    type: 'investment' | 'pan'
    reason?: string
  }) {
    return sendNotification('partnership_request_declined', requesterEmail, data)
  },

  /**
   * Notify when a partnership is successfully created
   */
  async created(creatorEmail: string, data: {
    creatorName: string
    partnershipName: string
    ipoName: string
    targetAmount: number
    type: 'investment' | 'pan'
  }) {
    return sendNotification('partnership_created', creatorEmail, data)
  }
}

/**
 * IPO notification helpers
 */
export const IPONotifications = {
  /**
   * Send IPO alert to user
   */
  async alert(userEmail: string, data: {
    userName: string
    ipoName: string
    openingDate: string
    closingDate: string
    priceRange?: string
    sector?: string
  }) {
    return sendNotification('ipo_alert', userEmail, data)
  },

  /**
   * Notify about allotment results
   */
  async allotmentResult(userEmail: string, data: {
    userName: string
    ipoName: string
    allotted: boolean
    sharesAllotted?: number
    amount?: number
  }) {
    return sendNotification('ipo_allotment_result', userEmail, data)
  }
}

/**
 * User account notification helpers
 */
export const UserNotifications = {
  /**
   * Send welcome email to new user
   */
  async welcome(userEmail: string, data: {
    userName: string
  }) {
    return sendNotification('welcome', userEmail, data)
  },

  /**
   * Send trust score update notification
   */
  async trustScoreUpdate(userEmail: string, data: {
    userName: string
    oldScore: number
    newScore: number
    reason: string
  }) {
    return sendNotification('trust_score_updated', userEmail, data)
  },

  /**
   * Send security alert
   */
  async securityAlert(userEmail: string, data: {
    userName: string
    alertType: string
    description: string
    timestamp: string
  }) {
    return sendNotification('security_alert', userEmail, data)
  }
}

/**
 * Bulk notification helpers
 */
export const BulkNotifications = {
  /**
   * Send notifications to multiple users
   */
  async sendToMultiple(
    type: NotificationType,
    recipients: Array<{ email: string; data: any }>,
    batchSize = 10
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    // Process in batches to avoid overwhelming the email service
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      const promises = batch.map(async ({ email, data }) => {
        const result = await sendNotification(type, email, data)
        return result ? 'success' : 'failed'
      })
      
      const results = await Promise.all(promises)
      success += results.filter(r => r === 'success').length
      failed += results.filter(r => r === 'failed').length
      
      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return { success, failed }
  }
}

/**
 * Check if user has notifications enabled for a specific type
 */
export async function checkNotificationPreferences(
  userId: string,
  notificationType: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/email-preferences`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
    })
    
    if (!response.ok) return true // Default to enabled if can't check
    
    const data = await response.json()
    const preferences = data.preferences
    
    // Map notification types to preference keys
    const typeMapping: Record<string, keyof typeof preferences.notifications> = {
      'partnership_request_sent': 'partnershipRequests',
      'partnership_request_received': 'partnershipRequests',
      'partnership_request_accepted': 'partnershipUpdates',
      'partnership_request_declined': 'partnershipUpdates',
      'partnership_created': 'partnershipUpdates',
      'ipo_alert': 'ipoAlerts',
      'ipo_allotment_result': 'ipoAlerts',
      'security_alert': 'securityAlerts',
      'welcome': 'marketingEmails'
    }
    
    const prefKey = typeMapping[notificationType]
    return prefKey ? preferences.notifications[prefKey] : true
  } catch (error) {
    console.error('Failed to check notification preferences:', error)
    return true // Default to enabled on error
  }
}

/**
 * Enhanced notification sender that checks preferences before sending
 */
export async function sendNotificationWithPreferences(
  type: NotificationType,
  userId: string,
  userEmail: string,
  data: any
): Promise<boolean> {
  try {
    // Check if user has this notification type enabled
    const isEnabled = await checkNotificationPreferences(userId, type)
    
    if (!isEnabled) {
      console.log(`Notification ${type} skipped for user ${userId} - disabled in preferences`)
      return true // Consider it "successful" since user chose not to receive it
    }
    
    return await sendNotification(type, userEmail, data)
  } catch (error) {
    console.error('Failed to send notification with preferences check:', error)
    return false
  }
}

// Export convenience object with all helpers
export const EmailNotifications = {
  Partnership: PartnershipNotifications,
  IPO: IPONotifications,
  User: UserNotifications,
  Bulk: BulkNotifications,
  send: sendNotification,
  sendWithPreferences: sendNotificationWithPreferences,
  checkPreferences: checkNotificationPreferences
}
