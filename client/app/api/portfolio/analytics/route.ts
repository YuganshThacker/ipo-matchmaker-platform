import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// File paths
const INVESTMENTS_FILE = path.join(process.cwd(), 'investments.json')
const USERS_FILE = path.join(process.cwd(), 'temp_users.json')

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

// Helper function to read investments
async function readInvestments() {
  try {
    const data = await fs.readFile(INVESTMENTS_FILE, 'utf8')
    return JSON.parse(data).investments || []
  } catch (error) {
    return []
  }
}

// Helper function to simulate market data
function getMarketPrice(symbol: string, originalPrice: number, sector: string) {
  // Simulate market price changes based on sector trends
  const sectorMultipliers = {
    'Technology': 1.15, // +15% trend
    'Energy': 1.08,     // +8% trend  
    'Finance': 1.05,    // +5% trend
    'Healthcare': 1.12, // +12% trend
    'Manufacturing': 1.02, // +2% trend
    'Other': 1.01       // +1% trend
  }
  
  const baseMultiplier = sectorMultipliers[sector as keyof typeof sectorMultipliers] || 1.01
  const randomVariation = 0.9 + (Math.random() * 0.2) // ±10% random variation
  const timeVariation = 1 + (Math.sin(Date.now() / 1000000) * 0.05) // ±5% time-based variation
  
  return originalPrice * baseMultiplier * randomVariation * timeVariation
}

// GET - Fetch comprehensive portfolio analytics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investments = await readInvestments()
    const userInvestments = investments.filter((inv: any) => inv.userId === user.id)

    if (userInvestments.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          totalValue: 0,
          totalInvested: 0,
          totalGainLoss: 0,
          totalGainLossPercentage: 0,
          totalHoldings: 0,
          topSector: null,
          avgReturn: 0
        },
        performance: {
          monthlyData: [],
          dailyChange: 0,
          weeklyChange: 0,
          monthlyChange: 0,
          yearlyChange: 0
        },
        sectorAllocation: [],
        topPerformers: [],
        recentActivity: []
      })
    }

    // Calculate holdings with current market prices
    const holdingsMap = new Map()
    
    userInvestments.forEach((inv: any) => {
      const currentPrice = getMarketPrice(inv.symbol, inv.pricePerShare, inv.sector)
      const currentValue = inv.shares * currentPrice
      const gainLoss = currentValue - inv.totalAmount
      const gainLossPercent = (gainLoss / inv.totalAmount) * 100

      if (holdingsMap.has(inv.symbol)) {
        const existing = holdingsMap.get(inv.symbol)
        existing.totalShares += inv.shares
        existing.totalInvested += inv.totalAmount
        existing.currentValue += currentValue
        existing.gainLoss += gainLoss
        existing.investments.push(inv)
        existing.avgBuyPrice = existing.totalInvested / existing.totalShares
        existing.gainLossPercent = (existing.gainLoss / existing.totalInvested) * 100
      } else {
        holdingsMap.set(inv.symbol, {
          companyName: inv.companyName,
          symbol: inv.symbol,
          sector: inv.sector,
          totalShares: inv.shares,
          totalInvested: inv.totalAmount,
          currentPrice: currentPrice,
          avgBuyPrice: inv.pricePerShare,
          currentValue: currentValue,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent,
          investments: [inv]
        })
      }
    })

    const holdings = Array.from(holdingsMap.values())
    
    // Calculate portfolio summary
    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0)
    const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalGainLoss = totalCurrentValue - totalInvested
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
    
    // Sector allocation
    const sectorMap = new Map()
    holdings.forEach(h => {
      if (sectorMap.has(h.sector)) {
        sectorMap.set(h.sector, sectorMap.get(h.sector) + h.currentValue)
      } else {
        sectorMap.set(h.sector, h.currentValue)
      }
    })
    
    const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
      sector,
      value: value,
      percentage: (value / totalCurrentValue) * 100,
      color: getSectorColor(sector)
    })).sort((a, b) => b.value - a.value)

    const topSector = sectorAllocation[0]?.sector || null

    // Top performers
    const topPerformers = holdings
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 3)
      .map(h => ({
        symbol: h.symbol,
        companyName: h.companyName,
        gainLossPercent: h.gainLossPercent,
        gainLoss: h.gainLoss,
        currentValue: h.currentValue
      }))

    // Generate performance data (simulated monthly data for the last 12 months)
    const monthlyData = []
    const currentDate = new Date()
    let runningValue = totalInvested * 0.8 // Start 12 months ago at 80% of current invested amount
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthProgress = (11 - i) / 11
      const targetValue = totalInvested + (totalGainLoss * monthProgress)
      
      // Add some realistic market volatility
      const volatility = (Math.random() - 0.5) * 0.1 * totalInvested
      runningValue = targetValue + volatility
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.max(0, runningValue),
        invested: totalInvested * (0.3 + (0.7 * monthProgress)) // Gradual investment over time
      })
    }

    // Calculate period changes (simulated)
    const dailyChange = (Math.random() - 0.5) * 0.04 * totalGainLossPercentage // ±4% of current performance
    const weeklyChange = dailyChange * 3.5 + (Math.random() - 0.5) * 0.02 * totalGainLossPercentage
    const monthlyChange = totalGainLossPercentage * 0.7 + (Math.random() - 0.5) * 0.1 * totalGainLossPercentage
    const yearlyChange = totalGainLossPercentage

    // Recent activity (last 5 investments)
    const recentActivity = userInvestments
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((inv: any) => ({
        id: inv.id,
        type: 'buy',
        companyName: inv.companyName,
        symbol: inv.symbol,
        shares: inv.shares,
        pricePerShare: inv.pricePerShare,
        totalAmount: inv.totalAmount,
        date: inv.createdAt
      }))

    return NextResponse.json({
      success: true,
      summary: {
        totalValue: totalCurrentValue,
        totalInvested: totalInvested,
        totalGainLoss: totalGainLoss,
        totalGainLossPercentage: totalGainLossPercentage,
        totalHoldings: holdings.length,
        topSector: topSector,
        avgReturn: holdings.length > 0 ? holdings.reduce((sum, h) => sum + h.gainLossPercent, 0) / holdings.length : 0
      },
      performance: {
        monthlyData: monthlyData,
        dailyChange: dailyChange,
        weeklyChange: weeklyChange,
        monthlyChange: monthlyChange,
        yearlyChange: yearlyChange
      },
      sectorAllocation: sectorAllocation,
      topPerformers: topPerformers,
      holdings: holdings,
      recentActivity: recentActivity
    })

  } catch (error) {
    console.error('Error fetching portfolio analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio analytics' },
      { status: 500 }
    )
  }
}

// Helper function to get sector colors
function getSectorColor(sector: string): string {
  const colors: { [key: string]: string } = {
    'Technology': '#3b82f6',
    'Finance': '#10b981',
    'Energy': '#f59e0b',
    'Healthcare': '#ef4444',
    'Manufacturing': '#8b5cf6',
    'Real Estate': '#06b6d4',
    'Consumer Goods': '#f97316',
    'Telecommunications': '#84cc16',
    'Retail': '#ec4899',
    'Transportation': '#6366f1',
    'Other': '#6b7280'
  }
  return colors[sector] || colors['Other']
}
