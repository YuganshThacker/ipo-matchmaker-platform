import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// IPO alerts data storage
const ALERTS_FILE_PATH = path.join(process.cwd(), 'ipo_alerts.json')

interface IPOAlert {
  id: string
  ipoName: string
  openingDate: string
  closingDate: string
  priceRange?: string
  sector: string
  companyName: string
  status: 'upcoming' | 'open' | 'closed'
  createdAt: string
  notificationsSent: boolean
}

interface UserSubscription {
  userId: string
  email: string
  sectors?: string[]
  minAmount?: number
  maxAmount?: number
  alertTypes: ('opening' | 'closing' | 'allotment')[]
}

const SUBSCRIPTIONS_FILE_PATH = path.join(process.cwd(), 'alert_subscriptions.json')

function getAlerts(): IPOAlert[] {
  try {
    if (fs.existsSync(ALERTS_FILE_PATH)) {
      const data = fs.readFileSync(ALERTS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading alerts file:', error)
  }
  return []
}

function saveAlerts(alerts: IPOAlert[]) {
  try {
    fs.writeFileSync(ALERTS_FILE_PATH, JSON.stringify(alerts, null, 2))
  } catch (error) {
    console.error('Error saving alerts:', error)
  }
}

function getSubscriptions(): UserSubscription[] {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE_PATH)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading subscriptions file:', error)
  }
  return []
}

function saveSubscriptions(subscriptions: UserSubscription[]) {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE_PATH, JSON.stringify(subscriptions, null, 2))
  } catch (error) {
    console.error('Error saving subscriptions:', error)
  }
}

// GET - Get all IPO alerts
export async function GET(request: NextRequest) {
  try {
    const alerts = getAlerts()
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching IPO alerts:', error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// POST - Create new IPO alert or subscribe to alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_alert') {
      // Create new IPO alert (admin functionality)
      const { ipoName, openingDate, closingDate, priceRange, sector, companyName } = data

      if (!ipoName || !openingDate || !closingDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const alerts = getAlerts()
      const newAlert: IPOAlert = {
        id: `alert_${Date.now()}`,
        ipoName,
        openingDate,
        closingDate,
        priceRange,
        sector: sector || 'Technology',
        companyName: companyName || ipoName,
        status: new Date(openingDate) > new Date() ? 'upcoming' : 'open',
        createdAt: new Date().toISOString(),
        notificationsSent: false
      }

      alerts.push(newAlert)
      saveAlerts(alerts)

      // Send notifications to subscribed users
      await sendIPOAlerts(newAlert)

      return NextResponse.json({ alert: newAlert })

    } else if (action === 'subscribe') {
      // User subscription to IPO alerts
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Get user from token
      const tokenParts = token.split("_")
      const userId = tokenParts.slice(2, -1).join("_")

      // Get user data
      const usersFilePath = path.join(process.cwd(), 'temp_users.json')
      const usersData = fs.readFileSync(usersFilePath, 'utf8')
      const users = JSON.parse(usersData)
      const user = users.find((u: any) => u.id === userId)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const { sectors, minAmount, maxAmount, alertTypes } = data
      const subscriptions = getSubscriptions()
      
      // Remove existing subscription for this user
      const filteredSubscriptions = subscriptions.filter(sub => sub.userId !== userId)
      
      // Add new subscription
      const newSubscription: UserSubscription = {
        userId,
        email: user.email,
        sectors: sectors || [],
        minAmount,
        maxAmount,
        alertTypes: alertTypes || ['opening']
      }

      filteredSubscriptions.push(newSubscription)
      saveSubscriptions(filteredSubscriptions)

      return NextResponse.json({ subscription: newSubscription })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error('Error processing IPO alert request:', error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Function to send IPO alerts to subscribed users
async function sendIPOAlerts(alert: IPOAlert) {
  try {
    const subscriptions = getSubscriptions()
    
    for (const subscription of subscriptions) {
      // Check if user is interested in this sector
      if (subscription.sectors && subscription.sectors.length > 0 && 
          !subscription.sectors.includes(alert.sector)) {
        continue
      }

      // Check if user wants opening alerts
      if (!subscription.alertTypes.includes('opening')) {
        continue
      }

      // Send email notification
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ipo_alert',
            to: subscription.email,
            data: {
              userName: subscription.email.split('@')[0], // Fallback name
              ipoName: alert.ipoName,
              openingDate: alert.openingDate,
              closingDate: alert.closingDate,
              priceRange: alert.priceRange,
              sector: alert.sector
            }
          })
        })
      } catch (emailError) {
        console.error(`Failed to send IPO alert to ${subscription.email}:`, emailError)
      }
    }

    // Mark alert as notifications sent
    const alerts = getAlerts()
    const alertIndex = alerts.findIndex(a => a.id === alert.id)
    if (alertIndex !== -1) {
      alerts[alertIndex].notificationsSent = true
      saveAlerts(alerts)
    }
  } catch (error) {
    console.error('Error sending IPO alerts:', error)
  }
}

// Scheduled function to check for IPO status updates
export async function checkIPOStatusUpdates() {
  try {
    const alerts = getAlerts()
    const now = new Date()
    
    for (const alert of alerts) {
      const openingDate = new Date(alert.openingDate)
      const closingDate = new Date(alert.closingDate)
      
      // Check if IPO just opened
      if (alert.status === 'upcoming' && now >= openingDate && now < closingDate) {
        alert.status = 'open'
        await sendIPOAlerts(alert)
      }
      
      // Check if IPO just closed
      if (alert.status === 'open' && now >= closingDate) {
        alert.status = 'closed'
      }
    }
    
    saveAlerts(alerts)
  } catch (error) {
    console.error('Error checking IPO status updates:', error)
  }
}
