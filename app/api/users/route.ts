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
    investmentRange: "₹10L - ₹50L",
    sectors: ["Technology", "Healthcare"],
    experience: "8 years",
    successRate: 85,
    location: "Mumbai",
    description: "Experienced tech investor with focus on emerging startups and IPO opportunities.",
    activePartnerships: 3,
  },
  {
    id: "2",
    email: "investor@example.com",
    password: "investor123",
    name: "Rajesh Kumar",
    panNumber: "FGHIJ5678K",
    trustScore: 92,
    isVerified: true,
    avatar: "/professional-indian-businessman.png",
    investmentRange: "₹5L - ₹50L",
    sectors: ["Technology", "Healthcare"],
    experience: "8 years",
    successRate: 85,
    location: "Mumbai",
    description: "Experienced tech investor with focus on emerging startups and IPO opportunities.",
    activePartnerships: 3,
  },
  {
    id: "3",
    email: "newuser@example.com",
    password: "newuser123",
    name: "Priya Sharma",
    panNumber: "LMNOP9012Q",
    trustScore: 88,
    isVerified: false,
    avatar: "/professional-indian-woman.png",
    investmentRange: "₹10L - ₹1Cr",
    sectors: ["Finance", "Real Estate"],
    experience: "12 years",
    successRate: 78,
    location: "Delhi",
    description: "Strategic investor specializing in financial services and real estate IPOs.",
    activePartnerships: 5,
  },
]

const USERS_FILE_PATH = path.join(process.cwd(), 'temp_users.json')

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, 'utf8')
      const users = JSON.parse(data)
      
      // Ensure default users have investment profiles
      return users.map((user: any) => {
        if (!user.investmentRange) {
          const defaultUser = DEFAULT_USERS.find(d => d.id === user.id)
          return {
            ...user,
            investmentRange: defaultUser?.investmentRange || "₹5L - ₹25L",
            sectors: defaultUser?.sectors || ["Technology"],
            experience: defaultUser?.experience || "5 years",
            successRate: defaultUser?.successRate || 75,
            location: defaultUser?.location || "India",
            description: defaultUser?.description || "Investor looking for IPO opportunities",
            activePartnerships: defaultUser?.activePartnerships || 0,
          }
        }
        return user
      })
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  return DEFAULT_USERS
}

// GET - List all users for discovery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const sector = searchParams.get('sector')?.toLowerCase() || ''
    
    const users = getUsers()
    
    // Filter out passwords and apply search/filter
    const publicUsers = users
      .map(({ password, ...user }: any) => user)
      .filter((user: any) => {
        const matchesSearch = !search || 
          user.name.toLowerCase().includes(search) ||
          user.location.toLowerCase().includes(search) ||
          user.description.toLowerCase().includes(search)
        
        const matchesSector = !sector || sector === 'all' ||
          user.sectors.some((s: string) => s.toLowerCase().includes(sector))
        
        return matchesSearch && matchesSector
      })

    return NextResponse.json({ users: publicUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
