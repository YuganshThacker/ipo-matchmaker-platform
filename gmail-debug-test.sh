#!/bin/bash
cd "$(dirname "$0")/client"

echo "=== Gmail Authentication Troubleshooting ==="
echo "Testing various Gmail authentication approaches..."
echo ""

# Test 1: Basic Gmail connection test
echo "Test 1: Testing Gmail SMTP connection..."
node -e "
const nodemailer = require('nodemailer');

async function testGmailConnection() {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    }
  });
  
  try {
    console.log('Attempting to verify Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully!');
  } catch (error) {
    console.log('❌ Gmail connection failed:', error.message);
    console.log('Full error:', error);
  }
}

testGmailConnection();
"

echo ""

# Test 2: Alternative SMTP configuration
echo "Test 2: Testing alternative SMTP configuration..."
node -e "
const nodemailer = require('nodemailer');

async function testAlternativeConfig() {
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('Testing alternative SMTP config (port 465, secure: true)...');
    await transporter.verify();
    console.log('✅ Alternative config works!');
  } catch (error) {
    console.log('❌ Alternative config failed:', error.message);
  }
}

testAlternativeConfig();
"

echo ""

# Test 3: Send actual test email with detailed logging
echo "Test 3: Attempting to send test email with detailed logging..."
node -e "
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  // Try the service: 'gmail' approach first
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    },
    debug: true,
    logger: true
  });
  
  const mailOptions = {
    from: 'fintogether.team@gmail.com',
    to: 'test@example.com',
    subject: 'Gmail Test Email',
    text: 'This is a test email to verify Gmail authentication.',
    html: '<p>This is a test email to verify Gmail authentication.</p>'
  };
  
  try {
    console.log('Attempting to send test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Error response:', error.response);
    console.log('Full error object:', error);
  }
}

sendTestEmail();
"

echo ""
echo "=== Troubleshooting Complete ==="
echo ""
echo "If all tests fail, please verify:"
echo "1. Gmail account has 2-Factor Authentication enabled"
echo "2. App password 'jwcdflqsswhucfp' is correct and recently generated"
echo "3. Less secure app access is NOT needed for app passwords"
echo "4. Account is not locked or restricted"
echo ""
echo "To generate a new app password:"
echo "1. Go to https://myaccount.google.com/security"
echo "2. Under 'Signing in to Google', select 'App passwords'"
echo "3. Generate a new app password for 'Mail'"
echo "4. Replace the password in .env.local"
