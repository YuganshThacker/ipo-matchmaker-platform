import { type NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// Partnership data storage
const PARTNERSHIPS_FILE_PATH = path.join(process.cwd(), 'partnerships.json')

interface Partnership {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  status: "forming" | "active" | "completed"
  sector: string
  riskLevel: "low" | "medium" | "high"
  expectedReturns: string
  createdBy: string
  createdAt: string
  ipoName: string
  partnershipType: "investment" | "pan"
  offerAmount?: number
  isPublic: boolean
  participants: Array<{
    userId: string
    userName: string
    joinedAt: string
    contribution: number
    status: "pending" | "confirmed"
  }>
}

function getPartnerships(): Partnership[] {
  try {
    if (fs.existsSync(PARTNERSHIPS_FILE_PATH)) {
      const data = fs.readFileSync(PARTNERSHIPS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading partnerships file:', error)
  }
  return []
}

function savePartnerships(partnerships: Partnership[]) {
  try {
    fs.writeFileSync(PARTNERSHIPS_FILE_PATH, JSON.stringify(partnerships, null, 2))
  } catch (error) {
    console.error('Error saving partnerships:', error)
  }
}

// Get user from token (simplified version)
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

// GET - List all partnerships
export async function GET(request: NextRequest) {
  try {
    const partnerships = getPartnerships()
    return NextResponse.json({ partnerships })
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return NextResponse.json({ error: "Failed to fetch partnerships" }, { status: 500 })
  }
}

// POST - Create new partnership
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
    const { name, description, targetAmount, ipoName, partnershipType, offerAmount, sector, expectedReturns } = body

    if (!name || !ipoName || !partnershipType || !targetAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const partnerships = getPartnerships()
    const newPartnership: Partnership = {
      id: `partnership_${Date.now()}`,
      name,
      description: description || `${partnershipType === "investment" ? "Investment" : "PAN"} partnership for ${ipoName}`,
      targetAmount: Number(targetAmount),
      currentAmount: partnershipType === "investment" ? Number(offerAmount || 0) : 0,
      status: "forming",
      sector: sector || "Technology",
      riskLevel: "medium",
      expectedReturns: expectedReturns || "15-25%",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      ipoName,
      partnershipType,
      offerAmount: partnershipType === "investment" ? Number(offerAmount || 0) : undefined,
      isPublic: true,
      participants: partnershipType === "investment" ? [{
        userId: user.id,
        userName: user.name,
        joinedAt: new Date().toISOString(),
        contribution: Number(offerAmount || 0),
        status: "confirmed"
      }] : []
    }

    partnerships.push(newPartnership)
    savePartnerships(partnerships)

    // Send email notification for partnership creation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partnership_created',
          to: user.email,
          data: {
            creatorName: user.name,
            partnershipName: newPartnership.name,
            ipoName: newPartnership.ipoName,
            targetAmount: newPartnership.targetAmount,
            type: newPartnership.partnershipType
          }
        })
      })
    } catch (emailError) {
      console.error('Failed to send partnership creation email notification:', emailError)
    }

    return NextResponse.json({ partnership: newPartnership })
  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json({ error: "Failed to create partnership" }, { status: 500 })
  }
}

// PUT - Update partnership
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
    const { id, name, description, targetAmount, ipoName, partnershipType, offerAmount } = body

    const partnerships = getPartnerships()
    const partnershipIndex = partnerships.findIndex(p => p.id === id)

    if (partnershipIndex === -1) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 })
    }

    const partnership = partnerships[partnershipIndex]
    if (partnership.createdBy !== user.id) {
      return NextResponse.json({ error: "Unauthorized to edit this partnership" }, { status: 403 })
    }

    // Update partnership
    partnerships[partnershipIndex] = {
      ...partnership,
      name: name || partnership.name,
      description: description || partnership.description,
      targetAmount: targetAmount ? Number(targetAmount) : partnership.targetAmount,
      ipoName: ipoName || partnership.ipoName,
      partnershipType: partnershipType || partnership.partnershipType,
      offerAmount: offerAmount ? Number(offerAmount) : partnership.offerAmount,
      currentAmount: partnershipType === "investment" ? Number(offerAmount || partnership.offerAmount || 0) : partnership.currentAmount
    }

    savePartnerships(partnerships)

    return NextResponse.json({ partnership: partnerships[partnershipIndex] })
  } catch (error) {
    console.error('Error updating partnership:', error)
    return NextResponse.json({ error: "Failed to update partnership" }, { status: 500 })
  }
}

// DELETE - Delete partnership
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Partnership ID required" }, { status: 400 })
    }

    const partnerships = getPartnerships()
    const partnership = partnerships.find(p => p.id === id)

    if (!partnership) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 })
    }

    if (partnership.createdBy !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this partnership" }, { status: 403 })
    }

    const updatedPartnerships = partnerships.filter(p => p.id !== id)
    savePartnerships(updatedPartnerships)

    return NextResponse.json({ message: "Partnership deleted successfully" })
  } catch (error) {
    console.error('Error deleting partnership:', error)
    return NextResponse.json({ error: "Failed to delete partnership" }, { status: 500 })
  }
}
