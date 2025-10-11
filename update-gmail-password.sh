#!/bin/bash

echo "=== Gmail App Password Update Script ==="
echo ""

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <new_app_password>"
    echo ""
    echo "Example: $0 abcd efgh ijkl mnop"
    echo "Note: Remove spaces from the app password"
    echo ""
    exit 1
fi

NEW_PASSWORD="$1"

# Remove any spaces from the password
NEW_PASSWORD=$(echo "$NEW_PASSWORD" | tr -d ' ')

# Validate password format (should be 16 characters)
if [ ${#NEW_PASSWORD} -ne 16 ]; then
    echo "❌ Error: App password should be exactly 16 characters"
    echo "Current length: ${#NEW_PASSWORD}"
    echo "Password provided: $NEW_PASSWORD"
    exit 1
fi

echo "Updating .env.local with new app password..."
echo "New password: $NEW_PASSWORD"
echo ""

cd /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS/client

# Update the .env.local file
printf "# Email Configuration\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=fintogether.team@gmail.com\nSMTP_PASS=%s\nEMAIL_FROM=fintogether.team@gmail.com\nEMAIL_FROM_NAME=\"FinTogether Team\"" "$NEW_PASSWORD" > .env.local

echo "✅ Updated .env.local with new app password"
echo ""

echo "Testing Gmail authentication..."
node test-gmail.js

echo ""
echo "If authentication succeeded, you can now test the full email system:"
echo "cd /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS && ./test-email-system.sh"
