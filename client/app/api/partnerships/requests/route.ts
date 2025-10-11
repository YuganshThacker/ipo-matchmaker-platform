import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Partnership requests data storage
const REQUESTS_FILE_PATH = path.join(process.cwd(), 'partnership_requests.json')

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
  panOwner?: "requester" | "receiver"
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  steps?: Array<{ label: string; completed: boolean }>
}

function getRequests(): PartnershipRequest[] {
  try {
    if (fs.existsSync(REQUESTS_FILE_PATH)) {
      const data = fs.readFileSync(REQUESTS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading requests file:', error)
  }
  return []
}

function saveRequests(requests: PartnershipRequest[]) {
  try {
    fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(requests, null, 2))
  } catch (error) {
    console.error('Error saving requests:', error)
  }
}

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

// GET - List requests for user
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

    const requests = getRequests()
    const userRequests = requests.filter(req => req.toUserId === user.id || req.fromUserId === user.id)

    return NextResponse.json({ requests: userRequests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

// POST - Create new request
export async function POST(request: NextRequest) {
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
    const { partnershipId, type, message, requestedAmount } = body

    // Get partnership details
    const partnershipsFilePath = path.join(process.cwd(), 'partnerships.json')
    if (!fs.existsSync(partnershipsFilePath)) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 })
    }

    const partnershipsData = fs.readFileSync(partnershipsFilePath, 'utf8')
    const partnerships = JSON.parse(partnershipsData)
    const partnership = partnerships.find((p: any) => p.id === partnershipId)

    if (!partnership) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 })
    }

    // Get creator's user data
    const usersFilePath = path.join(process.cwd(), 'temp_users.json')
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)
    const creatorUser = users.find((u: any) => u.id === partnership.createdBy)

    if (!creatorUser) {
      return NextResponse.json({ error: "Partnership creator not found" }, { status: 404 })
    }

    const requests = getRequests()
    const newRequest: PartnershipRequest = {
      id: `request_${Date.now()}`,
      from: user.name,
      fromUserId: user.id,
      to: creatorUser.name,
      toUserId: creatorUser.id,
      partnershipId,
      type: type || "join",
      ipoName: partnership.ipoName,
      totalNeeded: partnership.targetAmount,
      requestedAmount: requestedAmount || Math.floor((partnership.targetAmount - partnership.currentAmount) / 2),
      message: message || `Hi! I would like to join your "${partnership.name}" partnership.`,
      status: "pending",
      createdAt: new Date().toISOString(),
      steps: partnership.partnershipType === "investment" ? [
        { label: "Accepted by creator", completed: false },
        { label: "Provide PAN details", completed: false },
        { label: "Apply for IPO", completed: false },
        { label: "Payment settled", completed: false },
      ] : [
        { label: "Accept PAN request", completed: false },
        { label: "Share PAN securely", completed: false },
        { label: "Application submitted", completed: false },
      ]
    }

    requests.push(newRequest)
    saveRequests(requests)

    return NextResponse.json({ request: newRequest })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

// PUT - Update request status
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
    const { id, status, stepIndex } = body

    const requests = getRequests()
    const requestIndex = requests.findIndex(req => req.id === id)

    if (requestIndex === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const partnershipRequest = requests[requestIndex]

    // Only the receiver can accept/decline, or update steps
    if (partnershipRequest.toUserId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to update this request" }, { status: 403 })
    }

    if (status) {
      requests[requestIndex].status = status
      
      // If accepted, update the partnership with new participant
      if (status === "accepted") {
        const partnershipsFilePath = path.join(process.cwd(), 'partnerships.json')
        if (fs.existsSync(partnershipsFilePath)) {
          const partnershipsData = fs.readFileSync(partnershipsFilePath, 'utf8')
          const partnerships = JSON.parse(partnershipsData)
          const partnershipIndex = partnerships.findIndex((p: any) => p.id === partnershipRequest.partnershipId)
          
          if (partnershipIndex !== -1) {
            const partnership = partnerships[partnershipIndex]
            partnership.participants = partnership.participants || []
            
            // Add new participant
            partnership.participants.push({
              userId: partnershipRequest.fromUserId,
              userName: partnershipRequest.from,
              joinedAt: new Date().toISOString(),
              contribution: partnershipRequest.requestedAmount || 0,
              status: "confirmed"
            })
            
            // Update current amount
            partnership.currentAmount += partnershipRequest.requestedAmount || 0
            
            // Save updated partnerships
            fs.writeFileSync(partnershipsFilePath, JSON.stringify(partnerships, null, 2))
          }
        }
      }
    }

    if (typeof stepIndex === 'number' && partnershipRequest.steps) {
      requests[requestIndex].steps![stepIndex].completed = true
    }

    saveRequests(requests)

    return NextResponse.json({ request: requests[requestIndex] })
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
