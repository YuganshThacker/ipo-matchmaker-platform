import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Type definitions
interface Investment {
  id: string
  userId: string
  companyName: string
  symbol: string
  sector: string
  investmentType: 'ipo' | 'secondary' | 'mutual_fund' | 'direct_equity'
  shares: number
  pricePerShare: number
  totalAmount: number
  investmentDate: string
  createdAt: string
  updatedAt: string
}

interface InvestmentRequest {
  companyName: string
  symbol: string
  sector: string
  investmentType: 'ipo' | 'secondary' | 'mutual_fund' | 'direct_equity'
  shares: number
  pricePerShare: number
  investmentDate: string
}

// File paths
const INVESTMENTS_FILE = path.join(process.cwd(), 'investments.json')
const USERS_FILE = path.join(process.cwd(), 'temp_users.json')

// Helper function to read investments
async function readInvestments(): Promise<Investment[]> {
  try {
    const data = await fs.readFile(INVESTMENTS_FILE, 'utf8')
    return JSON.parse(data).investments || []
  } catch (error) {
    return []
  }
}

// Helper function to write investments
async function writeInvestments(investments: Investment[]): Promise<void> {
  const data = { investments, lastUpdated: new Date().toISOString() }
  await fs.writeFile(INVESTMENTS_FILE, JSON.stringify(data, null, 2))
}

// Helper function to get user from token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  // Handle both token formats: temp_token_USERID_TIMESTAMP and temp_token_user_USERID_TIMESTAMP
  let userId = null
  const numericTokenMatch = token.match(/^temp_token_(\d+)_\d+$/)
  const userTokenMatch = token.match(/^temp_token_(user_\w+)_\d+$/)
  
  if (numericTokenMatch) {
    userId = numericTokenMatch[1]
  } else if (userTokenMatch) {
    userId = userTokenMatch[1]
  } else {
    return null
  }
  
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf8')
    const users = JSON.parse(usersData)
    return users.find((user: any) => user.id === userId)
  } catch (error) {
    return null
  }
}

// GET - Fetch user's investments
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investments = await readInvestments()
    const userInvestments = investments.filter(inv => inv.userId === user.id)

    // Calculate portfolio summary
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const totalShares = userInvestments.reduce((sum, inv) => sum + inv.shares, 0)

    // Group by company for holdings view
    const holdings = userInvestments.reduce((acc: any, inv) => {
      if (!acc[inv.symbol]) {
        acc[inv.symbol] = {
          companyName: inv.companyName,
          symbol: inv.symbol,
          sector: inv.sector,
          totalShares: 0,
          totalAmount: 0,
          avgPrice: 0,
          investments: []
        }
      }
      
      acc[inv.symbol].totalShares += inv.shares
      acc[inv.symbol].totalAmount += inv.totalAmount
      acc[inv.symbol].avgPrice = acc[inv.symbol].totalAmount / acc[inv.symbol].totalShares
      acc[inv.symbol].investments.push(inv)
      
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      investments: userInvestments,
      holdings: Object.values(holdings),
      summary: {
        totalInvested,
        totalShares,
        totalHoldings: Object.keys(holdings).length
      }
    })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    )
  }
}

// POST - Add new investment
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: InvestmentRequest = await request.json()

    // Validate required fields
    if (!body.companyName || !body.symbol || !body.sector || !body.shares || !body.pricePerShare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (body.shares <= 0 || body.pricePerShare <= 0) {
      return NextResponse.json(
        { error: 'Shares and price must be positive numbers' },
        { status: 400 }
      )
    }

    const investments = await readInvestments()
    
    // Create new investment
    const newInvestment: Investment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      companyName: body.companyName.trim(),
      symbol: body.symbol.trim().toUpperCase(),
      sector: body.sector.trim(),
      investmentType: body.investmentType || 'direct_equity',
      shares: Number(body.shares),
      pricePerShare: Number(body.pricePerShare),
      totalAmount: Number(body.shares) * Number(body.pricePerShare),
      investmentDate: body.investmentDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    investments.push(newInvestment)
    await writeInvestments(investments)

    return NextResponse.json({
      success: true,
      investment: newInvestment,
      message: 'Investment added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding investment:', error)
    return NextResponse.json(
      { error: 'Failed to add investment' },
      { status: 500 }
    )
  }
}

// PUT - Update investment
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const investments = await readInvestments()
    const investmentIndex = investments.findIndex(
      inv => inv.id === id && inv.userId === user.id
    )

    if (investmentIndex === -1) {
      return NextResponse.json(
        { error: 'Investment not found or access denied' },
        { status: 404 }
      )
    }

    // Update investment
    const updatedInvestment = {
      ...investments[investmentIndex],
      ...updateData,
      totalAmount: updateData.shares && updateData.pricePerShare 
        ? Number(updateData.shares) * Number(updateData.pricePerShare)
        : investments[investmentIndex].totalAmount,
      updatedAt: new Date().toISOString()
    }

    investments[investmentIndex] = updatedInvestment
    await writeInvestments(investments)

    return NextResponse.json({
      success: true,
      investment: updatedInvestment,
      message: 'Investment updated successfully'
    })

  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    )
  }
}

// DELETE - Remove investment
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const investments = await readInvestments()
    const investmentIndex = investments.findIndex(
      inv => inv.id === id && inv.userId === user.id
    )

    if (investmentIndex === -1) {
      return NextResponse.json(
        { error: 'Investment not found or access denied' },
        { status: 404 }
      )
    }

    investments.splice(investmentIndex, 1)
    await writeInvestments(investments)

    return NextResponse.json({
      success: true,
      message: 'Investment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
