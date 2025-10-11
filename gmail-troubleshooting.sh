#!/bin/bash

echo "=== Gmail App Password Troubleshooting ==="
echo ""

# Read and display the current password from .env.local
echo "Current app password from .env.local:"
grep SMTP_PASS /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS/client/.env.local | cut -d'=' -f2 | sed 's/^/[/' | sed 's/$/]/'

echo ""
echo "Password length:"
grep SMTP_PASS /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS/client/.env.local | cut -d'=' -f2 | wc -c

echo ""
echo "Password in hex (to check for hidden characters):"
grep SMTP_PASS /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS/client/.env.local | cut -d'=' -f2 | xxd

echo ""
echo "=== Action Items ==="
echo ""
echo "The Gmail authentication is failing with error 535-5.7.8."
echo "This means the username/password combination is not accepted."
echo ""
echo "To fix this, please:"
echo ""
echo "1. Verify 2FA is enabled on fintogether.team@gmail.com:"
echo "   - Go to https://myaccount.google.com/security"
echo "   - Under 'Signing in to Google', ensure '2-Step Verification' is ON"
echo ""
echo "2. Generate a NEW app password:"
echo "   - Go to https://myaccount.google.com/apppasswords"
echo "   - Select 'Mail' as the app"
echo "   - Copy the new 16-character app password"
echo ""
echo "3. Update the .env.local file with the new app password:"
echo "   - Replace 'jwcdflqsswhucfp' with the new password"
echo "   - Ensure no spaces or extra characters"
echo ""
echo "4. Test again by running: ./test-email-system.sh"
echo ""
echo "Note: App passwords are case-sensitive and expire if not used."
echo "The current password 'jwcdflqsswhucfp' may be expired or incorrect."
