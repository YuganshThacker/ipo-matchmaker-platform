import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Connection requests data storage
const CONNECTIONS_FILE_PATH = path.join(process.cwd(), 'connections.json')

interface Connection {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
}

function getConnections(): Connection[] {
  try {
    if (fs.existsSync(CONNECTIONS_FILE_PATH)) {
      const data = fs.readFileSync(CONNECTIONS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading connections file:', error)
  }
  return []
}

function saveConnections(connections: Connection[]) {
  try {
    fs.writeFileSync(CONNECTIONS_FILE_PATH, JSON.stringify(connections, null, 2))
  } catch (error) {
    console.error('Error saving connections:', error)
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

// GET - List connections for user
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

    const connections = getConnections()
    const userConnections = connections.filter(conn => 
      conn.toUserId === user.id || conn.fromUserId === user.id
    )

    return NextResponse.json({ connections: userConnections })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
  }
}

// POST - Create new connection request
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
    const { toUserId, message } = body

    if (!toUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    // Get target user details
    const usersFilePath = path.join(process.cwd(), 'temp_users.json')
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)
    const targetUser = users.find((u: any) => u.id === toUserId)

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 })
    }

    // Check if connection already exists
    const connections = getConnections()
    const existingConnection = connections.find(conn => 
      (conn.fromUserId === user.id && conn.toUserId === toUserId) ||
      (conn.fromUserId === toUserId && conn.toUserId === user.id)
    )

    if (existingConnection) {
      return NextResponse.json({ error: "Connection already exists or pending" }, { status: 400 })
    }

    const newConnection: Connection = {
      id: `connection_${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      toUserName: targetUser.name,
      message: message || `Hi ${targetUser.name}! I'd like to connect with you for potential IPO partnership opportunities.`,
      status: "pending",
      createdAt: new Date().toISOString()
    }

    connections.push(newConnection)
    saveConnections(connections)

    return NextResponse.json({ connection: newConnection })
  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 })
  }
}

// PUT - Update connection status
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
    const { id, status } = body

    const connections = getConnections()
    const connectionIndex = connections.findIndex(conn => conn.id === id)

    if (connectionIndex === -1) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    const connection = connections[connectionIndex]

    // Only the receiver can accept/decline
    if (connection.toUserId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to update this connection" }, { status: 403 })
    }

    connections[connectionIndex].status = status
    saveConnections(connections)

    return NextResponse.json({ connection: connections[connectionIndex] })
  } catch (error) {
    console.error('Error updating connection:', error)
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 })
  }
}
