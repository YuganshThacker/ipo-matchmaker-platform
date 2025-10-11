import { type NextRequest, NextResponse } from "next/server"
import { sendNotificationEmail, type NotificationType } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type, to, data" },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'partnership_request_sent',
      'partnership_request_received',
      'partnership_request_accepted',
      'partnership_request_declined',
      'partnership_created',
      'partnership_joined',
      'partnership_completed',
      'ipo_alert',
      'ipo_allotment_result',
      'trust_score_updated',
      'welcome',
      'password_reset',
      'security_alert'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if email notifications are disabled in development
    if (process.env.EMAIL_DISABLED === 'true') {
      console.log(`[EMAIL DISABLED] Would send ${type} notification to ${to}:`, data)
      return NextResponse.json({ 
        success: true, 
        message: 'Email notifications disabled in development mode',
        debug: { type, to, data }
      })
    }

    const result = await sendNotificationEmail(type, to, data)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId || 'sent'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Test endpoint for development
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as NotificationType
    const to = url.searchParams.get('to')

    if (!type || !to) {
      return NextResponse.json({
        error: "Missing parameters. Usage: /api/notifications?type=welcome&to=email@example.com"
      })
    }

    // Sample test data
    const testData = {
      userName: 'Test User',
      fromUserName: 'John Doe',
      toUserName: 'Jane Smith',
      ipoName: 'Test IPO Ltd',
      requestedAmount: 50000,
      type: 'investment'
    }

    const result = await sendNotificationEmail(type, to, testData)
    
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      testData
    })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    )
  }
}
