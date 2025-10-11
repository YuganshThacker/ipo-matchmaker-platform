import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Get user from token
async function getUserFromToken(token: string) {
  try {
    const tokenParts = token.split("_")
    const userId = tokenParts.slice(2, -1).join("_")
    
    // Read users file to get user data
    const usersFilePath = path.join(process.cwd(), 'temp_users.json')
    if (fs.existsSync(usersFilePath)) {
      const usersData = fs.readFileSync(usersFilePath, 'utf8')
      const users = JSON.parse(usersData)
      const user = users.find((u: any) => u.id === userId)
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    }
  } catch (error) {
    console.error('Error validating token:', error)
  }
  return null
}

// Get partnerships data
function getPartnerships() {
  try {
    const partnershipsFilePath = path.join(process.cwd(), 'partnerships.json')
    if (fs.existsSync(partnershipsFilePath)) {
      const data = fs.readFileSync(partnershipsFilePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading partnerships:', error)
  }
  return []
}

// Get partnership requests data
function getPartnershipRequests() {
  try {
    const requestsFilePath = path.join(process.cwd(), 'partnership_requests.json')
    if (fs.existsSync(requestsFilePath)) {
      const data = fs.readFileSync(requestsFilePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading requests:', error)
  }
  return []
}

// Get connections data
function getConnections() {
  try {
    const connectionsFilePath = path.join(process.cwd(), 'connections.json')
    if (fs.existsSync(connectionsFilePath)) {
      const data = fs.readFileSync(connectionsFilePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading connections:', error)
  }
  return []
}

// Calculate user statistics
function calculateUserStats(userId: string) {
  const partnerships = getPartnerships()
  const requests = getPartnershipRequests()
  const connections = getConnections()

  // User's partnerships
  const userPartnerships = partnerships.filter((p: any) => 
    p.createdBy === userId || 
    (p.participants && p.participants.some((part: any) => part.userId === userId))
  )

  // User's requests (both sent and received)
  const userRequests = requests.filter((req: any) => 
    req.fromUserId === userId || req.toUserId === userId
  )

  // Pending requests received by user
  const pendingRequests = requests.filter((req: any) => 
    req.toUserId === userId && req.status === 'pending'
  )

  // User's connections
  const userConnections = connections.filter((conn: any) => 
    (conn.fromUserId === userId || conn.toUserId === userId) && conn.status === 'accepted'
  )

  // Calculate success rate (accepted requests / total requests sent)
  const sentRequests = requests.filter((req: any) => req.fromUserId === userId)
  const acceptedRequests = sentRequests.filter((req: any) => req.status === 'accepted')
  const successRate = sentRequests.length > 0 ? (acceptedRequests.length / sentRequests.length) * 100 : 0

  // Calculate total investment and profits
  let totalInvestment = 0
  let totalCurrentValue = 0
  let panProfits = 0

  userPartnerships.forEach((partnership: any) => {
    if (partnership.createdBy === userId && partnership.offerAmount) {
      totalInvestment += partnership.offerAmount
      // Simulate some profit (5-15% for demo)
      const profitRate = 0.05 + Math.random() * 0.10
      totalCurrentValue += partnership.offerAmount * (1 + profitRate)
    }
    
    // If user is a participant
    if (partnership.participants) {
      const userParticipation = partnership.participants.find((p: any) => p.userId === userId)
      if (userParticipation) {
        totalInvestment += userParticipation.contribution
        const profitRate = 0.05 + Math.random() * 0.10
        totalCurrentValue += userParticipation.contribution * (1 + profitRate)
      }
    }

    // PAN sharing profits (simulate for partnerships where PAN is shared)
    if (partnership.partnershipType === 'pan') {
      panProfits += 1000 + Math.random() * 5000 // Random PAN sharing profit
    }
  })

  const totalProfit = totalCurrentValue - totalInvestment
  const profitPercentage = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100) : 0

  // Get recent partnerships (last 5)
  const recentPartnerships = userPartnerships
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((partnership: any) => {
      const otherUser = partnership.createdBy === userId 
        ? (partnership.participants && partnership.participants[0])
        : { userId: partnership.createdBy, userName: 'Partnership Creator' }
      
      return {
        id: partnership.id,
        name: otherUser?.userName || 'Unknown User',
        amount: partnership.targetAmount,
        panShared: partnership.partnershipType === 'pan',
        status: partnership.status,
        date: partnership.createdAt,
        ipoName: partnership.ipoName
      }
    })

  return {
    totalPartnerships: userPartnerships.length,
    successRate: Math.round(successRate * 10) / 10,
    trustScore: 85 + Math.floor(Math.random() * 15), // Simulate trust score
    pendingRequests: pendingRequests.length,
    totalInvestment,
    totalProfit,
    panProfits,
    profitPercentage: Math.round(profitPercentage * 10) / 10,
    recentPartnerships,
    totalConnections: userConnections.length
  }
}

// GET - Dashboard overview data
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

    const stats = calculateUserStats(user.id)

    // Format the response
    const dashboardData = {
      summaryStats: [
        {
          title: "Total Partnerships",
          value: stats.totalPartnerships.toString(),
          change: "+2", // Can be calculated based on historical data
          changeType: "positive",
          description: "Active partnerships"
        },
        {
          title: "Success Rate",
          value: `${stats.successRate}%`,
          change: "+1.2%",
          changeType: "positive", 
          description: "IPO allotment success"
        },
        {
          title: "Trust Score",
          value: stats.trustScore.toString(),
          change: "+1",
          changeType: "positive",
          description: "Community trust rating"
        },
        {
          title: "Pending Requests",
          value: stats.pendingRequests.toString(),
          change: stats.pendingRequests > 0 ? "-1" : "0",
          changeType: stats.pendingRequests > 0 ? "negative" : "neutral",
          description: "Awaiting approval"
        }
      ],
      portfolioData: {
        totalInvestment: `₹${stats.totalInvestment.toLocaleString()}`,
        totalProfit: `₹${Math.round(stats.totalProfit).toLocaleString()}`,
        panProfit: `₹${Math.round(stats.panProfits).toLocaleString()}`,
        profitPercentage: `+${stats.profitPercentage}%`
      },
      recentPartnerships: stats.recentPartnerships.map((partnership: any) => ({
        id: partnership.id,
        name: partnership.name,
        amount: `₹${partnership.amount.toLocaleString()}`,
        panShared: partnership.panShared,
        status: partnership.status === 'forming' ? 'Pending' : 'Active',
        date: formatDateRelative(partnership.date),
        ipoName: partnership.ipoName
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

// Helper function to format date relatively
function formatDateRelative(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      return "Just now"
    }
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInHours < 48) {
    return "1 day ago"
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)} days ago`
  } else {
    return `${Math.floor(diffInHours / 168)} weeks ago`
  }
}
