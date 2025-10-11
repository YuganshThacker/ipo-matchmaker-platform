import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Email preferences data storage
const PREFERENCES_FILE_PATH = path.join(process.cwd(), 'email_preferences.json')

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

function getPreferences(): EmailPreferences[] {
  try {
    if (fs.existsSync(PREFERENCES_FILE_PATH)) {
      const data = fs.readFileSync(PREFERENCES_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading preferences file:', error)
  }
  return []
}

function savePreferences(preferences: EmailPreferences[]) {
  try {
    fs.writeFileSync(PREFERENCES_FILE_PATH, JSON.stringify(preferences, null, 2))
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}

// Get user from token
async function getUserFromToken(token: string) {
  try {
    const tokenParts = token.split("_")
    const userId = tokenParts.slice(2, -1).join("_")
    
    const usersFilePath = path.join(process.cwd(), 'temp_users.json')
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)
    return users.find((u: any) => u.id === userId)
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// GET - Get user's email preferences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    const preferences = getPreferences()
    let userPrefs = preferences.find(pref => pref.userId === user.id)

    // Create default preferences if not exist
    if (!userPrefs) {
      userPrefs = {
        userId: user.id,
        email: user.email,
        notifications: {
          partnershipRequests: true,
          partnershipUpdates: true,
          ipoAlerts: true,
          marketingEmails: false,
          securityAlerts: true
        },
        frequency: 'immediate',
        categories: [],
        unsubscribeToken: `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      preferences.push(userPrefs)
      savePreferences(preferences)
    }

    return NextResponse.json({ preferences: userPrefs })
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

// PUT - Update user's email preferences
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    const body = await request.json()
    const { notifications, frequency, categories } = body

    const preferences = getPreferences()
    const userPrefIndex = preferences.findIndex(pref => pref.userId === user.id)

    if (userPrefIndex === -1) {
      // Create new preferences
      const newPreferences: EmailPreferences = {
        userId: user.id,
        email: user.email,
        notifications: notifications || {
          partnershipRequests: true,
          partnershipUpdates: true,
          ipoAlerts: true,
          marketingEmails: false,
          securityAlerts: true
        },
        frequency: frequency || 'immediate',
        categories: categories || [],
        unsubscribeToken: `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      preferences.push(newPreferences)
      savePreferences(preferences)

      return NextResponse.json({ preferences: newPreferences })
    } else {
      // Update existing preferences
      preferences[userPrefIndex] = {
        ...preferences[userPrefIndex],
        notifications: notifications || preferences[userPrefIndex].notifications,
        frequency: frequency || preferences[userPrefIndex].frequency,
        categories: categories || preferences[userPrefIndex].categories,
        updatedAt: new Date().toISOString()
      }

      savePreferences(preferences)
      return NextResponse.json({ preferences: preferences[userPrefIndex] })
    }
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}

// POST - Handle unsubscribe requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, unsubscribeToken } = body

    if (action === 'unsubscribe' && unsubscribeToken) {
      const preferences = getPreferences()
      const userPrefIndex = preferences.findIndex(pref => pref.unsubscribeToken === unsubscribeToken)

      if (userPrefIndex === -1) {
        return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 404 })
      }

      // Disable all non-essential notifications
      preferences[userPrefIndex].notifications = {
        partnershipRequests: false,
        partnershipUpdates: false,
        ipoAlerts: false,
        marketingEmails: false,
        securityAlerts: true // Keep security alerts enabled
      }
      preferences[userPrefIndex].updatedAt = new Date().toISOString()

      savePreferences(preferences)

      return NextResponse.json({ 
        message: "Successfully unsubscribed from email notifications",
        preferences: preferences[userPrefIndex]
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error('Error processing unsubscribe request:', error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Helper function to check if user has notification enabled
export function isNotificationEnabled(userId: string, notificationType: keyof EmailPreferences['notifications']): boolean {
  try {
    const preferences = getPreferences()
    const userPrefs = preferences.find(pref => pref.userId === userId)
    
    if (!userPrefs) {
      // Default to enabled for essential notifications
      return ['partnershipRequests', 'partnershipUpdates', 'securityAlerts'].includes(notificationType)
    }
    
    return userPrefs.notifications[notificationType]
  } catch (error) {
    console.error('Error checking notification preferences:', error)
    return true // Default to enabled on error
  }
}

// Helper function to get user's unsubscribe token for email footers
export function getUnsubscribeToken(userId: string): string | null {
  try {
    const preferences = getPreferences()
    const userPrefs = preferences.find(pref => pref.userId === userId)
    return userPrefs?.unsubscribeToken || null
  } catch (error) {
    console.error('Error getting unsubscribe token:', error)
    return null
  }
}
