#!/bin/bash

# Credentials come from the environment; defaults are the public demo account
TEST_EMAIL="${TEST_EMAIL:-demo@ipoplatform.com}"
TEST_PASSWORD="${TEST_PASSWORD:-demo123}"

echo "🔧 Testing Portfolio Management System"
echo "====================================="

# Test 1: Login
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d '"' -f 4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo "✅ Login successful"

# Test 2: Fetch portfolio data
echo ""
echo "Testing portfolio analytics..."
PORTFOLIO_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/portfolio/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Portfolio Response: $PORTFOLIO_RESPONSE"

# Check if response contains success
if echo "$PORTFOLIO_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Portfolio analytics working"
else
  echo "❌ Portfolio analytics failed"
fi

# Test 3: Fetch holdings
echo ""
echo "Testing holdings data..."
HOLDINGS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/portfolio/investments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Holdings Response: $HOLDINGS_RESPONSE"

if echo "$HOLDINGS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Holdings data working"
else
  echo "❌ Holdings data failed"
fi

echo ""
echo "🎉 All tests completed!"
echo "Now you can login at http://localhost:3000 as $TEST_EMAIL"
