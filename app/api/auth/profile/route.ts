import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token || !token.startsWith("temp_token_")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const updates = await request.json()

    // In a real app, update the user in database
    // For now, just return the updated data
    return NextResponse.json({
      id: "1",
      email: "demo@ipoplatform.com",
      name: "Demo User",
      panNumber: "ABCDE1234F",
      trustScore: 85,
      isVerified: true,
      avatar: "/professional-indian-man.png",
      ...updates,
    })
  } catch (error) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
  }
}
