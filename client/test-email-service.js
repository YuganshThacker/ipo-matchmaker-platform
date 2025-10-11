// Test the email service directly with real credentials
process.env.SMTP_HOST = 'smtp.gmail.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.SMTP_USER = 'fintogether.team@gmail.com';
process.env.SMTP_PASS = 'dvpeqrlebvsswygc';
process.env.EMAIL_FROM = 'fintogether.team@gmail.com';
process.env.EMAIL_FROM_NAME = 'FinTogether Team';

const { EmailService } = require('../lib/email.ts');

async function testEmailService() {
  console.log('🧪 Testing IPO Matchmaker Email Service');
  console.log('=====================================\n');
  
  const emailService = new EmailService();
  
  // Test 1: Partnership Request Email
  console.log('Test 1: Partnership Request Notification');
  try {
    await emailService.sendPartnershipRequestEmail({
      recipientEmail: 'fintogether.team@gmail.com',
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      requestId: 'test-123',
      message: 'This is a test partnership request from the email system.'
    });
    console.log('✅ Partnership request email sent successfully!\n');
  } catch (error) {
    console.log('❌ Partnership request email failed:', error.message, '\n');
  }
  
  // Test 2: Partnership Accepted Email
  console.log('Test 2: Partnership Accepted Notification');
  try {
    await emailService.sendPartnershipAcceptedEmail({
      recipientEmail: 'fintogether.team@gmail.com',
      recipientName: 'Test Sender',
      partnerName: 'Test Partner',
      partnershipId: 'partnership-456'
    });
    console.log('✅ Partnership accepted email sent successfully!\n');
  } catch (error) {
    console.log('❌ Partnership accepted email failed:', error.message, '\n');
  }
  
  // Test 3: IPO Alert Email
  console.log('Test 3: IPO Alert Notification');
  try {
    await emailService.sendIpoAlertEmail({
      recipientEmail: 'fintogether.team@gmail.com',
      recipientName: 'Test Investor',
      ipoDetails: {
        company: 'Test Corp',
        symbol: 'TEST',
        price: '$25-30',
        date: '2024-12-01',
        description: 'A test IPO notification for the email system.'
      }
    });
    console.log('✅ IPO alert email sent successfully!\n');
  } catch (error) {
    console.log('❌ IPO alert email failed:', error.message, '\n');
  }
  
  console.log('🎉 Email Service Testing Complete!');
  console.log('Check your inbox at fintogether.team@gmail.com for the test emails.');
}

testEmailService().catch(console.error);
