import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Simple file-based user storage for demo purposes
const USERS_FILE_PATH = path.join(process.cwd(), 'temp_users.json')

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  
  return []
}

export async function GET(request: NextRequest) {
  try {
    const users = getUsers()
    const fileExists = fs.existsSync(USERS_FILE_PATH)
    
    // Return users without passwords for security
    const usersWithoutPasswords = users.map((user: any) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    
    return NextResponse.json({
      message: "Debug info",
      totalUsers: users.length,
      users: usersWithoutPasswords,
      fileExists: fileExists,
      filePath: USERS_FILE_PATH
    })
  } catch (error) {
    return NextResponse.json({ error: "Debug failed", details: error }, { status: 500 })
  }
}
