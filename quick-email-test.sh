#!/bin/bash

# Quick Email Test Script
echo "🧪 Testing Email Configuration with Your Gmail Account"
echo "===================================================="

# Test email address - change this to your test email
TEST_EMAIL="fintogether.team@gmail.com"

echo "📧 Sending test welcome email to: $TEST_EMAIL"
echo ""

# Send test email
RESPONSE=$(curl -s "http://localhost:3002/api/notifications?type=welcome&to=$TEST_EMAIL")

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Email test PASSED! Check your inbox at $TEST_EMAIL"
    echo ""
    echo "🎉 If you received the email, the system is working!"
    echo "📝 If not, check the server console logs for detailed error information."
else
    echo "❌ Email test FAILED!"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check that the development server is running (npm run dev)"
    echo "2. Verify your .env.local file has the correct Gmail credentials"
    echo "3. Check the server console for detailed error logs"
    echo "4. Make sure your Gmail App Password is correct (no spaces)"
fi

echo ""
echo "📋 Current configuration check:"
echo "Gmail User: fintogether.team@gmail.com"
echo "App Password: jwcd**** (configured)"
echo "Server URL: http://localhost:3002"
