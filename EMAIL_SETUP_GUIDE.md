# Email Notification System Setup Guide

This guide will help you set up the production-level email notification system for the IPO Matchmaker platform.

## 🚀 Features Implemented

### ✅ Core Email Notifications
- **Partnership Requests**: Sent/Received notifications
- **Partnership Status Updates**: Accepted/Declined notifications  
- **Partnership Creation**: Confirmation emails
- **IPO Alerts**: New IPO announcements and opening notifications
- **Welcome Emails**: New user registration
- **Trust Score Updates**: When user reputation changes
- **Security Alerts**: Important account security notifications

### ✅ Advanced Features
- **Email Preferences Management**: User-controlled notification settings
- **Unsubscribe System**: One-click unsubscribe with tokens
- **Email Queue System**: Batch processing and retry logic
- **Delivery Status Tracking**: Monitor email delivery success/failure
- **Template System**: Professional HTML email templates
- **Multi-provider Support**: SMTP, Gmail, Resend, etc.

## 📧 Email Service Configuration

### Option 1: Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to environment variables**:

```bash
# .env.local
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL="IPO Matchmaker <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Option 2: Custom SMTP Server (Production)

```bash
# .env.local
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
FROM_EMAIL="IPO Matchmaker <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Option 3: Disable Emails (Development)

```bash
# .env.local
EMAIL_DISABLED=true
```

## 🔧 Setup Instructions

### 1. Install Dependencies
Already installed with the implementation:
```bash
npm install nodemailer @types/nodemailer
```

### 2. Environment Configuration
Create `.env.local` in your client directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your email service credentials. Never commit `.env.local`.

### 3. Test Email Service

Check the SMTP login without starting the app (prints no credentials):

```bash
cd client && node test-smtp.js
```

Or visit: http://localhost:3002/api/notifications?type=welcome&to=your-email@domain.com

This will send a test welcome email to verify the setup.

## 📁 File Structure

```
client/
├── lib/
│   └── email.ts                 # Core email service
├── app/api/
│   ├── notifications/
│   │   └── route.ts            # Email notification API
│   ├── email-preferences/
│   │   └── route.ts            # User preference management
│   └── ipo-alerts/
│       └── route.ts            # IPO alert system
├── components/settings/
│   ├── email-preferences.tsx   # User settings UI
│   └── notification-status.tsx # Admin dashboard
└── .env.example                # Configuration template
```

## 🎯 Usage Examples

### Send Partnership Request Notification

```javascript
// Automatically triggered in partnership request API
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'partnership_request_received',
    to: 'user@example.com',
    data: {
      fromUserName: 'John Doe',
      toUserName: 'Jane Smith',
      ipoName: 'TechCorp Solutions',
      requestedAmount: 50000,
      type: 'investment',
      message: 'Would love to partner with you!'
    }
  })
})
```

### Subscribe to IPO Alerts

```javascript
// Subscribe user to IPO notifications
const token = localStorage.getItem('auth-token')
await fetch('/api/ipo-alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'subscribe',
    sectors: ['Technology', 'Healthcare'],
    alertTypes: ['opening', 'closing']
  })
})
```

### Update Email Preferences

```javascript
// Update user notification preferences
const token = localStorage.getItem('auth-token')
await fetch('/api/email-preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notifications: {
      partnershipRequests: true,
      partnershipUpdates: true,
      ipoAlerts: false,
      marketingEmails: false,
      securityAlerts: true
    },
    frequency: 'daily'
  })
})
```

## 🎨 Email Templates

The system includes professional HTML email templates for:

- **Partnership Request Sent**: Confirmation to sender
- **Partnership Request Received**: Notification to recipient  
- **Partnership Accepted**: Success notification
- **Partnership Declined**: Gentle rejection notice
- **Partnership Created**: Confirmation email
- **IPO Alerts**: Urgent opportunity notifications
- **Welcome Email**: Onboarding for new users

Each template includes:
- Responsive design for mobile/desktop
- Professional styling with gradients and colors
- Clear call-to-action buttons
- Unsubscribe links (where applicable)
- Brand consistent header/footer

## 🔒 Security Features

- **Unsubscribe Tokens**: Unique tokens for safe unsubscription
- **Email Validation**: Prevent sending to invalid addresses
- **Rate Limiting**: Prevent email spam (implement as needed)
- **Preference Checking**: Respect user notification settings
- **Secure Headers**: Proper email headers for deliverability

## 📊 Monitoring & Analytics

### Email Status Dashboard
Access the notification status dashboard in user settings to monitor:
- Total emails sent
- Delivery success/failure rates
- Recent notification history
- Email service health status

### Delivery Tracking
- Success/failure status for each email
- Error messages for failed deliveries
- Retry mechanisms for temporary failures
- Message IDs for tracking with email providers

## 🚀 Production Deployment

### Recommended Email Providers

1. **Resend** (Modern, Developer-friendly)
   ```bash
   RESEND_API_KEY=your-resend-api-key
   ```

2. **SendGrid** (Enterprise-grade)
   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

3. **Amazon SES** (AWS Integration)
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   ```

### Production Checklist

- [ ] Configure production email service
- [ ] Set up custom domain for email sending
- [ ] Configure SPF, DKIM, and DMARC records
- [ ] Test email deliverability
- [ ] Set up monitoring and alerting
- [ ] Configure email templates with brand assets
- [ ] Test unsubscribe flows
- [ ] Verify GDPR compliance
- [ ] Set up email analytics tracking

## 🧪 Testing

### Test Individual Notifications
```bash
# Test welcome email
curl "http://localhost:3002/api/notifications?type=welcome&to=test@example.com"

# Test partnership request
curl -X POST http://localhost:3002/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"partnership_request_received","to":"test@example.com","data":{"fromUserName":"John","toUserName":"Jane","ipoName":"Test IPO"}}'
```

### Load Testing
For production, consider testing email delivery under load:
- Test concurrent email sending
- Monitor email queue performance
- Test retry mechanisms
- Verify email rate limits

## 🤝 Contributing

When adding new notification types:

1. Add the type to `NotificationType` in `lib/email.ts`
2. Create email template in `getEmailConfigForType()`
3. Add appropriate API triggers
4. Test the new notification type
5. Update user preference options if needed

## 📞 Support

For email delivery issues:
1. Check email service status
2. Verify environment variables
3. Test with simple SMTP settings
4. Check spam folders
5. Monitor email logs for errors

---

## 🎉 Ready to Use!

Your IPO Matchmaker platform now has a complete, production-ready email notification system! Users will receive timely notifications about partnership activities, IPO opportunities, and important account updates.

The system is designed to scale with your platform and provides a great user experience while maintaining high deliverability rates and security standards.
