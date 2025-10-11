import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Default users that should always be available
const DEFAULT_USERS = [
  {
    id: "1",
    email: "demo@ipoplatform.com",
    password: "demo123",
    name: "Demo User",
    panNumber: "ABCDE1234F",
    trustScore: 85,
    isVerified: true,
    avatar: "/professional-indian-man.png",
  },
  {
    id: "2",
    email: "investor@example.com",
    password: "investor123",
    name: "Rajesh Kumar",
    panNumber: "FGHIJ5678K",
    trustScore: 92,
    isVerified: true,
    avatar: "/professional-indian-woman.png",
  },
  {
    id: "3",
    email: "newuser@example.com",
    password: "newuser123",
    name: "Priya Sharma",
    panNumber: "LMNOP9012Q",
    trustScore: 67,
    isVerified: false,
    avatar: null,
  },
]

// Simple file-based user storage for demo purposes
const USERS_FILE_PATH = path.join(process.cwd(), 'temp_users.json')

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, 'utf8')
      const users = JSON.parse(data)
      
      // Ensure default users are always present
      const defaultUserIds = DEFAULT_USERS.map(u => u.id)
      const existingIds = users.map((u: any) => u.id)
      const missingDefaults = DEFAULT_USERS.filter(defaultUser => 
        !existingIds.includes(defaultUser.id)
      )
      
      if (missingDefaults.length > 0) {
        const updatedUsers = [...users, ...missingDefaults]
        saveUsers(updatedUsers)
        return updatedUsers
      }
      
      return users
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  
  // Create file with default users if it doesn't exist
  saveUsers(DEFAULT_USERS)
  return DEFAULT_USERS
}

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Get existing users
    const users = getUsers()

    // Check if user already exists
    const existingUser = users.find((u: any) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user with password included for login
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // Store password for demo purposes (never do this in production!)
      name,
      panNumber: null,
      trustScore: 50, // Default trust score for new users
      isVerified: false,
      avatar: null,
    }

    // Add new user to the list and save
    users.push(newUser)
    saveUsers(users)

    // Send welcome email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: newUser.email,
          data: {
            userName: newUser.name
          }
        })
      })
    } catch (emailError) {
      console.error('Failed to send welcome email notification:', emailError)
    }

    // Create token
    const token = `temp_token_${newUser.id}_${Date.now()}`

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
