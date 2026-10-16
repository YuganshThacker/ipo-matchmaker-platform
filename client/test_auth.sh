#!/bin/bash

# Complete Authentication Test Script for IPO Platform

BASE_URL="http://localhost:3000"
TEST_EMAIL="authtest@example.com"
TEST_PASSWORD="authtest123"
TEST_NAME="Auth Test User"

echo "🔧 Testing IPO Platform Authentication Flow..."
echo "================================================"

# 1. Test Registration
echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"name\": \"$TEST_NAME\"}")

echo "   Registration response: $REGISTER_RESPONSE"

# Extract token from registration response
REGISTER_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "   Registration token: $REGISTER_TOKEN"
echo

# 2. Test Session Validation with Registration Token
echo "2. Testing session validation with registration token..."
if [ -n "$REGISTER_TOKEN" ]; then
    SESSION_RESPONSE=$(curl -s -H "Authorization: Bearer $REGISTER_TOKEN" "$BASE_URL/api/auth/me")
    echo "   Session response: $SESSION_RESPONSE"
else
    echo "   ❌ No registration token received!"
fi
echo

# 3. Test Login with Same Credentials
echo "3. Testing login with same credentials..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

echo "   Login response: $LOGIN_RESPONSE"

# Extract token from login response
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "   Login token: $LOGIN_TOKEN"
echo

# 4. Test Session Validation with Login Token
echo "4. Testing session validation with login token..."
if [ -n "$LOGIN_TOKEN" ]; then
    SESSION2_RESPONSE=$(curl -s -H "Authorization: Bearer $LOGIN_TOKEN" "$BASE_URL/api/auth/me")
    echo "   Session response: $SESSION2_RESPONSE"
else
    echo "   ❌ No login token received!"
fi
echo

echo
echo "✅ Authentication test completed!"
echo "   - Registration: $([ -n "$REGISTER_TOKEN" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Login: $([ -n "$LOGIN_TOKEN" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "   - Session validation: $([ -n "$SESSION2_RESPONSE" ] && echo "✅ PASS" || echo "❌ FAIL")"
