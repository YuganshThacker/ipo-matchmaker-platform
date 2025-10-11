import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock IPO data - in production, fetch from database
    const ipos = [
      {
        id: 1,
        name: "TechCorp Solutions",
        sector: "Technology",
        priceRange: "₹450-500",
        marketCap: "₹2,400 Cr",
        gmp: "₹75",
        lotSize: 30,
        subscriptionRatio: null,
        status: "upcoming",
        openDate: "2025-01-15",
        closeDate: "2025-01-17",
        listingDate: "2025-01-22",
        description: "Leading software solutions provider with strong growth prospects",
        issueSize: "₹1,200 Cr"
      },
      {
        id: 2,
        name: "GreenEnergy Ltd",
        sector: "Renewable Energy", 
        priceRange: "₹280-320",
        marketCap: "₹1,800 Cr",
        gmp: "₹45",
        lotSize: 50,
        subscriptionRatio: 2.4,
        status: "live",
        openDate: "2025-01-10",
        closeDate: "2025-01-12",
        listingDate: "2025-01-17",
        description: "Solar and wind energy solutions with government backing",
        issueSize: "₹900 Cr"
      },
      {
        id: 3,
        name: "FinTech Innovations",
        sector: "Financial Services",
        priceRange: "₹600-650", 
        marketCap: "₹3,200 Cr",
        gmp: "₹120",
        lotSize: 25,
        subscriptionRatio: 8.7,
        status: "closed",
        openDate: "2025-01-08",
        closeDate: "2025-01-10",
        listingDate: "2025-01-15",
        description: "Digital banking and payment solutions platform",
        issueSize: "₹1,600 Cr"
      },
      {
        id: 4,
        name: "HealthTech Systems",
        sector: "Healthcare",
        priceRange: "₹380-420",
        marketCap: "₹2,100 Cr", 
        gmp: "₹60",
        lotSize: 40,
        subscriptionRatio: null,
        status: "upcoming",
        openDate: "2025-01-20",
        closeDate: "2025-01-22",
        listingDate: "2025-01-27",
        description: "AI-powered healthcare diagnostics and telemedicine",
        issueSize: "₹800 Cr"
      },
      {
        id: 5,
        name: "EduTech Platform",
        sector: "Education",
        priceRange: "₹220-250",
        marketCap: "₹1,500 Cr",
        gmp: "₹35", 
        lotSize: 60,
        subscriptionRatio: null,
        status: "upcoming",
        openDate: "2025-01-25",
        closeDate: "2025-01-27",
        listingDate: "2025-02-01",
        description: "Online learning platform with personalized AI tutoring",
        issueSize: "₹600 Cr"
      },
      {
        id: 6,
        name: "LogiTech Supply",
        sector: "Logistics",
        priceRange: "₹350-400",
        marketCap: "₹1,900 Cr",
        gmp: "₹80",
        lotSize: 35,
        subscriptionRatio: 5.2,
        status: "listed",
        openDate: "2025-01-05",
        closeDate: "2025-01-07", 
        listingDate: "2025-01-12",
        description: "Last-mile delivery and supply chain management",
        issueSize: "₹700 Cr",
        listingPrice: "₹435",
        currentPrice: "₹465",
        listingGain: "+16.25%"
      }
    ]
    
    return NextResponse.json({
      ipos,
      status: 'success',
      count: ipos.length
    })
    
  } catch (err) {
    console.error('Error fetching IPOs:', err)
    return NextResponse.json({
      error: 'Failed to fetch IPO data',
      status: 'error'
    }, { status: 500 })
  }
}
