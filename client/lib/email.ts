import nodemailer from 'nodemailer'

// Email service configuration
interface EmailConfig {
  provider: 'smtp'
  smtp: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
}

// Environment-based configuration
const getEmailConfig = (): EmailConfig => {
  if (process.env.SMTP_HOST) {
    return {
      provider: 'smtp',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      }
    }
  }
  
  // Fallback to Gmail SMTP for development
  return {
    provider: 'smtp',
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_APP_PASSWORD || ''
      }
    }
  }
}

// Email service class
export class EmailService {
  private config: EmailConfig
  private transporter?: nodemailer.Transporter

  constructor() {
    this.config = getEmailConfig()
    this.initializeService()
  }

  private initializeService() {
    if (this.config.provider === 'smtp' && this.config.smtp) {
      this.transporter = nodemailer.createTransport(this.config.smtp)
    }
  }

  async sendEmail({
    to,
    subject,
    html,
    text
  }: {
    to: string | string[]
    subject: string
    html?: string
    text?: string
  }) {
    try {
      // Debug logging
      console.log('📧 Attempting to send email...')
      // Never log the SMTP username, password or recipient addresses
      console.log('Config:', {
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        hasUser: !!this.config.smtp.auth.user,
        hasPassword: !!this.config.smtp.auth.pass
      })

      const emailData = {
        from: process.env.FROM_EMAIL || `IPO Matchmaker <${this.config.smtp.auth.user}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html: html,
        text: text
      }

      console.log('Email data:', {
        recipients: Array.isArray(to) ? to.length : 1,
        subject: emailData.subject
      })

      if (this.config.provider === 'smtp' && this.transporter) {
        // Verify connection first
        console.log('🔍 Verifying SMTP connection...')
        await this.transporter.verify()
        console.log('✅ SMTP connection verified successfully')
        
        console.log('📤 Sending email...')
        const result = await this.transporter.sendMail(emailData)
        console.log('✅ Email sent successfully:', result.messageId)
        
        return { success: true, messageId: result.messageId }
      } else {
        throw new Error('No email service configured')
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          code: (error as any).code,
          command: (error as any).command,
          response: (error as any).response,
          responseCode: (error as any).responseCode
        })
      }
      
      return { success: false, messageId: undefined, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (this.config.provider === 'smtp' && this.transporter) {
        await this.transporter.verify()
        return true
      }
      return false
    } catch (error) {
      console.error('Email service verification failed:', error)
      return false
    }
  }
}

// Singleton instance
export const emailService = new EmailService()

// Email notification types
export type NotificationType = 
  | 'partnership_request_sent'
  | 'partnership_request_received'
  | 'partnership_request_accepted'
  | 'partnership_request_declined'
  | 'partnership_created'
  | 'partnership_joined'
  | 'partnership_completed'
  | 'ipo_alert'
  | 'ipo_allotment_result'
  | 'trust_score_updated'
  | 'welcome'
  | 'password_reset'
  | 'security_alert'

// Email notification queue for batch processing
export class EmailQueue {
  private static queue: Array<{
    id: string
    type: NotificationType
    to: string
    data: any
    scheduledAt: Date
    attempts: number
  }> = []

  static add(type: NotificationType, to: string, data: any, delay = 0) {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.queue.push({
      id,
      type,
      to,
      data,
      scheduledAt: new Date(Date.now() + delay),
      attempts: 0
    })
    return id
  }

  static async process() {
    const now = new Date()
    const readyEmails = this.queue.filter(email => email.scheduledAt <= now && email.attempts < 3)

    for (const email of readyEmails) {
      try {
        await sendNotificationEmail(email.type, email.to, email.data)
        // Remove successful email from queue
        this.queue = this.queue.filter(e => e.id !== email.id)
      } catch (error) {
        // Increment attempts and retry later
        email.attempts++
        email.scheduledAt = new Date(now.getTime() + Math.pow(2, email.attempts) * 60000) // Exponential backoff
        console.error(`Failed to send email ${email.id}, attempt ${email.attempts}:`, error)
      }
    }
  }
}

// Main notification function
export async function sendNotificationEmail(
  type: NotificationType,
  to: string,
  data: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const emailConfig = getEmailConfigForType(type, data)
    
    const result = await emailService.sendEmail({
      to,
      subject: emailConfig.subject,
      html: emailConfig.html,
      text: emailConfig.text
    })

    return result
  } catch (error) {
    console.error(`Failed to send ${type} notification:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Email configuration for different notification types
function getEmailConfigForType(type: NotificationType, data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
  
  switch (type) {
    case 'partnership_request_sent':
      return {
        subject: `Partnership Request Sent - ${data.ipoName}`,
        html: generatePartnershipRequestSentEmail(data, baseUrl),
        text: `Your partnership request for ${data.ipoName} has been sent to ${data.toUserName}.`
      }

    case 'partnership_request_received':
      return {
        subject: `New Partnership Request - ${data.ipoName}`,
        html: generatePartnershipRequestReceivedEmail(data, baseUrl),
        text: `You have received a partnership request for ${data.ipoName} from ${data.fromUserName}.`
      }

    case 'partnership_request_accepted':
      return {
        subject: `Partnership Request Accepted - ${data.ipoName}`,
        html: generatePartnershipRequestAcceptedEmail(data, baseUrl),
        text: `Your partnership request for ${data.ipoName} has been accepted by ${data.acceptedBy}.`
      }

    case 'partnership_request_declined':
      return {
        subject: `Partnership Request Declined - ${data.ipoName}`,
        html: generatePartnershipRequestDeclinedEmail(data, baseUrl),
        text: `Your partnership request for ${data.ipoName} has been declined.`
      }

    case 'partnership_created':
      return {
        subject: `Partnership Created Successfully - ${data.ipoName}`,
        html: generatePartnershipCreatedEmail(data, baseUrl),
        text: `Your partnership for ${data.ipoName} has been created successfully.`
      }

    case 'ipo_alert':
      return {
        subject: `IPO Alert - ${data.ipoName} Opening Soon`,
        html: generateIPOAlertEmail(data, baseUrl),
        text: `${data.ipoName} IPO is opening on ${data.openingDate}. Don't miss out!`
      }

    case 'welcome':
      return {
        subject: 'Welcome to IPO Matchmaker!',
        html: generateWelcomeEmail(data, baseUrl),
        text: `Welcome to IPO Matchmaker, ${data.userName}! Start building successful investment partnerships today.`
      }

    default:
      throw new Error(`Unknown notification type: ${type}`)
  }
}

// Email template generators
function generatePartnershipRequestSentEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partnership Request Sent</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Partnership Request Sent Successfully!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.fromUserName},</p>
                
                <p>Your partnership request has been successfully sent!</p>
                
                <div class="highlight">
                    <strong>Request Details:</strong><br>
                    <strong>IPO:</strong> ${data.ipoName}<br>
                    <strong>To:</strong> ${data.toUserName}<br>
                    <strong>Type:</strong> ${data.type === 'investment' ? 'Investment Partnership' : 'PAN Partnership'}<br>
                    ${data.requestedAmount ? `<strong>Amount:</strong> ₹${data.requestedAmount.toLocaleString()}` : ''}
                </div>
                
                <p>We'll notify you as soon as ${data.toUserName} responds to your request. You can track the status of your request in your dashboard.</p>
                
                <a href="${baseUrl}/dashboard/partnerships" class="button">View My Partnerships</a>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Building trust in investment partnerships.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generatePartnershipRequestReceivedEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Partnership Request</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button-secondary { background: #6b7280; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #22c55e; margin: 20px 0; }
            .urgent { background: #fef3c7; border-left-color: #f59e0b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤝 New Partnership Request!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.toUserName},</p>
                
                <p>Great news! You have received a new partnership request for an exciting IPO opportunity.</p>
                
                <div class="highlight">
                    <strong>Request Details:</strong><br>
                    <strong>From:</strong> ${data.fromUserName}<br>
                    <strong>IPO:</strong> ${data.ipoName}<br>
                    <strong>Type:</strong> ${data.type === 'investment' ? 'Investment Partnership' : 'PAN Partnership'}<br>
                    ${data.requestedAmount ? `<strong>Amount:</strong> ₹${data.requestedAmount.toLocaleString()}` : ''}<br>
                    ${data.message ? `<strong>Message:</strong> "${data.message}"` : ''}
                </div>
                
                <p><strong>What happens next?</strong></p>
                <p>Review the request details and decide whether to accept or decline. Remember, successful partnerships build your trust score and reputation on the platform!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/dashboard/partnerships?tab=requests" class="button">View Request</a>
                    <a href="${baseUrl}/dashboard/partnerships" class="button button-secondary">My Dashboard</a>
                </div>
                
                <p>Don't keep them waiting too long - IPO opportunities are time-sensitive!</p>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Connecting investors for IPO success.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generatePartnershipRequestAcceptedEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partnership Request Accepted</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success { background: #dcfce7; padding: 15px; border-radius: 6px; border-left: 4px solid #22c55e; margin: 20px 0; }
            .next-steps { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Partnership Accepted!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.fromUserName},</p>
                
                <p>Fantastic news! Your partnership request has been accepted!</p>
                
                <div class="success">
                    <strong>✅ Partnership Confirmed:</strong><br>
                    <strong>Partner:</strong> ${data.acceptedBy}<br>
                    <strong>IPO:</strong> ${data.ipoName}<br>
                    <strong>Type:</strong> ${data.type === 'investment' ? 'Investment Partnership' : 'PAN Partnership'}<br>
                    ${data.amount ? `<strong>Amount:</strong> ₹${data.amount.toLocaleString()}` : ''}
                </div>
                
                <div class="next-steps">
                    <h3>📋 Next Steps:</h3>
                    <ol>
                        <li><strong>Connect & Coordinate:</strong> Use our secure chat to discuss details</li>
                        <li><strong>Complete KYC:</strong> Ensure all documentation is ready</li>
                        <li><strong>Fund Transfer:</strong> Follow the agreed payment schedule</li>
                        <li><strong>IPO Application:</strong> Submit application during the IPO window</li>
                    </ol>
                </div>
                
                <p><strong>Remember:</strong> Successful partnerships increase your trust score and improve future collaboration opportunities!</p>
                
                <a href="${baseUrl}/dashboard/partnerships" class="button">Manage Partnership</a>
                
                <p>Wishing you IPO success!</p>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Your success is our success.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generatePartnershipRequestDeclinedEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partnership Request Update</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .info { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .suggestions { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Partnership Request Update</h1>
            </div>
            <div class="content">
                <p>Hi ${data.fromUserName},</p>
                
                <p>We wanted to update you on your partnership request for ${data.ipoName}.</p>
                
                <div class="info">
                    <strong>Request Status:</strong> Not accepted this time<br>
                    <strong>IPO:</strong> ${data.ipoName}<br>
                    ${data.reason ? `<strong>Reason:</strong> ${data.reason}` : ''}
                </div>
                
                <p>Don't worry! This happens and it's part of the partnership journey. There are many other opportunities waiting for you.</p>
                
                <div class="suggestions">
                    <h3>💡 What you can do next:</h3>
                    <ul>
                        <li><strong>Explore other partners:</strong> Browse our partner network for this IPO</li>
                        <li><strong>Create your own partnership:</strong> Start a partnership and let others join you</li>
                        <li><strong>Build your profile:</strong> A stronger profile attracts better partners</li>
                        <li><strong>Try upcoming IPOs:</strong> New opportunities come up regularly</li>
                    </ul>
                </div>
                
                <a href="${baseUrl}/dashboard/partnerships" class="button">Find New Partners</a>
                
                <p>Keep building your investment network - your perfect partnership match is out there!</p>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Never give up on your investment dreams.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generatePartnershipCreatedEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partnership Created Successfully</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Partnership Created!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.creatorName},</p>
                
                <p>Your partnership has been successfully created and is now live on the platform!</p>
                
                <div class="highlight">
                    <strong>Partnership Details:</strong><br>
                    <strong>Name:</strong> ${data.partnershipName}<br>
                    <strong>IPO:</strong> ${data.ipoName}<br>
                    <strong>Target Amount:</strong> ₹${data.targetAmount.toLocaleString()}<br>
                    <strong>Type:</strong> ${data.type === 'investment' ? 'Investment Partnership' : 'PAN Partnership'}<br>
                    <strong>Status:</strong> Open for partners
                </div>
                
                <p>Your partnership is now visible to potential partners. We'll notify you when someone sends a partnership request.</p>
                
                <a href="${baseUrl}/dashboard/partnerships" class="button">Manage Partnership</a>
                
                <p>Best of luck with your IPO investment!</p>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Creating successful investment partnerships.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateIPOAlertEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IPO Alert</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .alert { background: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚡ IPO Alert!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.userName},</p>
                
                <div class="alert">
                    <strong>🔥 Hot IPO Opening Soon!</strong><br>
                    <strong>Company:</strong> ${data.ipoName}<br>
                    <strong>Opening Date:</strong> ${data.openingDate}<br>
                    <strong>Closing Date:</strong> ${data.closingDate}<br>
                    ${data.priceRange ? `<strong>Price Range:</strong> ${data.priceRange}` : ''}
                </div>
                
                <p>Don't miss this opportunity! Start looking for partners or create your own partnership now.</p>
                
                <a href="${baseUrl}/dashboard/partnerships" class="button">Find Partners Now</a>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Never miss an IPO opportunity.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateWelcomeEmail(data: any, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to IPO Matchmaker</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .features { display: grid; gap: 15px; margin: 20px 0; }
            .feature { padding: 15px; background: #f8fafc; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to IPO Matchmaker!</h1>
            </div>
            <div class="content">
                <p>Hi ${data.userName},</p>
                
                <p>Welcome to IPO Matchmaker - the platform that connects investors for successful IPO partnerships!</p>
                
                <div class="features">
                    <div class="feature">
                        <strong>🤝 Build Partnerships:</strong> Connect with PAN holders and fellow investors
                    </div>
                    <div class="feature">
                        <strong>📈 Track IPOs:</strong> Stay updated on upcoming IPO opportunities
                    </div>
                    <div class="feature">
                        <strong>🛡️ Trust System:</strong> Build your reputation through successful partnerships
                    </div>
                    <div class="feature">
                        <strong>🤖 AI Insights:</strong> Get predictions on IPO performance and allotment chances
                    </div>
                </div>
                
                <p>Ready to start your IPO investment journey?</p>
                
                <a href="${baseUrl}/dashboard" class="button">Explore Dashboard</a>
                
                <p>If you have any questions, our team is here to help. Happy investing!</p>
                
                <p>Best regards,<br>The IPO Matchmaker Team</p>
            </div>
            <div class="footer">
                <p>© 2025 IPO Matchmaker. Your IPO success starts here.</p>
            </div>
        </div>
    </body>
    </html>
  `
}
