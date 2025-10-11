import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Messages data storage
const MESSAGES_FILE_PATH = path.join(process.cwd(), 'messages.json')

interface Message {
  id: string
  connectionId: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  content: string
  timestamp: string
  readBy: string[] // Array of user IDs who have read this message
}

interface MessageThread {
  connectionId: string
  participants: {
    userId: string
    userName: string
  }[]
  messages: Message[]
  lastActivity: string
}

function getMessages(): MessageThread[] {
  try {
    if (fs.existsSync(MESSAGES_FILE_PATH)) {
      const data = fs.readFileSync(MESSAGES_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading messages file:', error)
  }
  return []
}

function saveMessages(threads: MessageThread[]) {
  try {
    fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(threads, null, 2))
  } catch (error) {
    console.error('Error saving messages:', error)
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

// Verify connection exists and user is part of it
async function verifyConnection(connectionId: string, userId: string) {
  try {
    const connectionsFilePath = path.join(process.cwd(), 'connections.json')
    if (fs.existsSync(connectionsFilePath)) {
      const connectionsData = fs.readFileSync(connectionsFilePath, 'utf8')
      const connections = JSON.parse(connectionsData)
      const connection = connections.find((c: any) => 
        c.id === connectionId && 
        c.status === "accepted" &&
        (c.fromUserId === userId || c.toUserId === userId)
      )
      return connection
    }
  } catch (error) {
    console.error('Error verifying connection:', error)
  }
  return null
}

// GET - Get messages for a connection
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

    const url = new URL(request.url)
    const connectionId = url.searchParams.get("connectionId")

    if (!connectionId) {
      // Get all message threads for user
      const threads = getMessages()
      const userThreads = threads.filter(thread => 
        thread.participants.some(p => p.userId === user.id)
      )
      return NextResponse.json({ threads: userThreads })
    }

    // Verify user is part of this connection
    const connection = await verifyConnection(connectionId, user.id)
    if (!connection) {
      return NextResponse.json({ error: "Connection not found or access denied" }, { status: 403 })
    }

    // Get specific thread
    const threads = getMessages()
    const thread = threads.find(t => t.connectionId === connectionId)
    
    if (!thread) {
      // Create empty thread if it doesn't exist
      const newThread: MessageThread = {
        connectionId,
        participants: [
          { userId: connection.fromUserId, userName: connection.fromUserName },
          { userId: connection.toUserId, userName: connection.toUserName }
        ],
        messages: [],
        lastActivity: new Date().toISOString()
      }
      return NextResponse.json({ thread: newThread })
    }

    // Mark messages as read by this user
    let hasUnread = false
    thread.messages.forEach(message => {
      if (message.toUserId === user.id && !message.readBy.includes(user.id)) {
        message.readBy.push(user.id)
        hasUnread = true
      }
    })

    if (hasUnread) {
      saveMessages(threads)
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a new message
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
    const { connectionId, content } = body

    if (!connectionId || !content || !content.trim()) {
      return NextResponse.json({ error: "Connection ID and message content are required" }, { status: 400 })
    }

    // Verify user is part of this connection
    const connection = await verifyConnection(connectionId, user.id)
    if (!connection) {
      return NextResponse.json({ error: "Connection not found or access denied" }, { status: 403 })
    }

    // Determine recipient
    const toUserId = connection.fromUserId === user.id ? connection.toUserId : connection.fromUserId
    const toUserName = connection.fromUserId === user.id ? connection.toUserName : connection.fromUserName

    // Create new message
    const newMessage: Message = {
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      connectionId,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      toUserName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      readBy: [user.id] // Sender has "read" their own message
    }

    // Get or create thread
    const threads = getMessages()
    let thread = threads.find(t => t.connectionId === connectionId)

    if (!thread) {
      thread = {
        connectionId,
        participants: [
          { userId: connection.fromUserId, userName: connection.fromUserName },
          { userId: connection.toUserId, userName: connection.toUserName }
        ],
        messages: [],
        lastActivity: new Date().toISOString()
      }
      threads.push(thread)
    }

    thread.messages.push(newMessage)
    thread.lastActivity = new Date().toISOString()

    saveMessages(threads)

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// PUT - Mark messages as read
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
    const { connectionId, messageIds } = body

    if (!connectionId) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
    }

    // Verify user is part of this connection
    const connection = await verifyConnection(connectionId, user.id)
    if (!connection) {
      return NextResponse.json({ error: "Connection not found or access denied" }, { status: 403 })
    }

    const threads = getMessages()
    const thread = threads.find(t => t.connectionId === connectionId)

    if (!thread) {
      return NextResponse.json({ error: "Message thread not found" }, { status: 404 })
    }

    // Mark specific messages as read or all messages if no IDs provided
    let markedCount = 0
    thread.messages.forEach(message => {
      if (message.toUserId === user.id && !message.readBy.includes(user.id)) {
        if (!messageIds || messageIds.includes(message.id)) {
          message.readBy.push(user.id)
          markedCount++
        }
      }
    })

    if (markedCount > 0) {
      saveMessages(threads)
    }

    return NextResponse.json({ markedAsRead: markedCount })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}
