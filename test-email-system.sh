#!/bin/bash

# Email Notification System Test Script
# This script tests the email notification system for IPO Matchmaker

echo "🧪 Testing IPO Matchmaker Email Notification System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3002"
TEST_EMAIL="test@example.com"

# Check if server is running
echo -e "${BLUE}1. Checking if server is running...${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Server is running at $BASE_URL${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start the development server first.${NC}"
    exit 1
fi

echo ""

# Test 1: Welcome Email
echo -e "${BLUE}2. Testing Welcome Email...${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/notifications?type=welcome&to=$TEST_EMAIL")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Welcome email test passed${NC}"
else
    echo -e "${RED}❌ Welcome email test failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""

# Test 2: Partnership Request Email
echo -e "${BLUE}3. Testing Partnership Request Email...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "partnership_request_received",
    "to": "'$TEST_EMAIL'",
    "data": {
      "fromUserName": "Test User",
      "toUserName": "Demo User",
      "ipoName": "TechCorp Solutions IPO",
      "requestedAmount": 50000,
      "type": "investment",
      "message": "Would love to partner with you for this IPO!"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Partnership request email test passed${NC}"
else
    echo -e "${RED}❌ Partnership request email test failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""

# Test 3: IPO Alert Email
echo -e "${BLUE}4. Testing IPO Alert Email...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ipo_alert",
    "to": "'$TEST_EMAIL'",
    "data": {
      "userName": "Demo User",
      "ipoName": "GreenEnergy Ltd",
      "openingDate": "2025-10-15",
      "closingDate": "2025-10-17",
      "priceRange": "₹100-120",
      "sector": "Renewable Energy"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ IPO alert email test passed${NC}"
else
    echo -e "${RED}❌ IPO alert email test failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""

# Test 4: Partnership Accepted Email
echo -e "${BLUE}5. Testing Partnership Accepted Email...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "partnership_request_accepted",
    "to": "'$TEST_EMAIL'",
    "data": {
      "fromUserName": "Test User",
      "acceptedBy": "Demo Partner",
      "ipoName": "FinTech Innovations IPO",
      "type": "investment",
      "amount": 75000
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Partnership accepted email test passed${NC}"
else
    echo -e "${RED}❌ Partnership accepted email test failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""

# Test environment configuration
echo -e "${BLUE}6. Checking Email Configuration...${NC}"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    
    # Check for email configuration
    if grep -q "GMAIL_USER\|SMTP_HOST\|EMAIL_DISABLED" .env.local; then
        echo -e "${GREEN}✅ Email configuration found in .env.local${NC}"
        
        # Show configuration type
        if grep -q "EMAIL_DISABLED=true" .env.local; then
            echo -e "${YELLOW}ℹ️  Email notifications are disabled (development mode)${NC}"
        elif grep -q "GMAIL_USER" .env.local; then
            echo -e "${BLUE}ℹ️  Using Gmail SMTP configuration${NC}"
        elif grep -q "SMTP_HOST" .env.local; then
            echo -e "${BLUE}ℹ️  Using custom SMTP configuration${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No email configuration found in .env.local${NC}"
        echo -e "${YELLOW}   Please add email settings. See EMAIL_SETUP_GUIDE.md for instructions.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local file not found${NC}"
    echo -e "${YELLOW}   Please create .env.local from .env.example${NC}"
    echo -e "${YELLOW}   See EMAIL_SETUP_GUIDE.md for setup instructions.${NC}"
fi

echo ""

# Final summary
echo -e "${BLUE}📋 Test Summary${NC}"
echo "=============="
echo "Test completed for email notification system."
echo ""
echo -e "${YELLOW}📧 If EMAIL_DISABLED=true is set, emails won't be sent but the API will return success.${NC}"
echo -e "${YELLOW}📧 Check your email inbox at $TEST_EMAIL for actual email delivery.${NC}"
echo ""
echo -e "${BLUE}📖 For setup instructions, see: EMAIL_SETUP_GUIDE.md${NC}"
echo -e "${BLUE}🌐 Email preferences UI: $BASE_URL/dashboard/settings (Email tab)${NC}"
echo ""
echo "🎉 Email notification system testing complete!"
