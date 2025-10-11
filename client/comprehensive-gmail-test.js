const nodemailer = require('nodemailer');

console.log('=== Comprehensive Gmail Diagnostics ===\n');

// Test different authentication methods and configurations
const testConfigurations = [
  {
    name: 'Gmail Service (Current Password)',
    config: {
      service: 'gmail',
      auth: {
        user: 'fintogether.team@gmail.com',
        pass: 'dvpeqrlebvsswygc'
      }
    }
  },
  {
    name: 'Gmail SMTP Port 587 (Current Password)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fintogether.team@gmail.com',
        pass: 'dvpeqrlebvsswygc'
      }
    }
  },
  {
    name: 'Gmail SMTP Port 465 (Current Password)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'fintogether.team@gmail.com',
        pass: 'dvpeqrlebvsswygc'
      }
    }
  },
  {
    name: 'Test with Previous Password',
    config: {
      service: 'gmail',
      auth: {
        user: 'fintogether.team@gmail.com',
        pass: 'jwcdflqsswhucfp'
      }
    }
  }
];

async function runDiagnostics() {
  console.log('Account being tested: fintogether.team@gmail.com');
  console.log('Current app password: dvpeqrlebvsswygc');
  console.log('Previous app password: jwcdflqsswhucfp\n');
  
  for (const test of testConfigurations) {
    console.log(`Testing: ${test.name}`);
    console.log(`Config:`, {
      ...test.config,
      auth: { ...test.config.auth, pass: '[HIDDEN]' }
    });
    
    try {
      const transporter = nodemailer.createTransport(test.config);
      await transporter.verify();
      console.log('✅ SUCCESS: Authentication passed!\n');
      
      // If this config works, try sending a test email
      console.log('Attempting to send test email with working config...');
      const testEmail = {
        from: 'fintogether.team@gmail.com',
        to: 'fintogether.team@gmail.com', // Send to self for testing
        subject: 'Gmail Authentication Test - SUCCESS',
        text: 'This email confirms that Gmail authentication is working correctly.',
        html: '<h2>Gmail Authentication Test</h2><p>✅ Authentication is working correctly!</p>'
      };
      
      const info = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', info.messageId);
      break; // Stop testing if we find a working configuration
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      if (error.code) console.log('Error Code:', error.code);
      if (error.responseCode) console.log('Response Code:', error.responseCode);
      console.log('');
    }
  }
  
  console.log('=== Diagnostic Results Summary ===\n');
  console.log('If ALL tests failed with 535-5.7.8 errors, the issue is likely:');
  console.log('1. 2-Factor Authentication is NOT enabled on the Gmail account');
  console.log('2. The app password was not generated correctly');
  console.log('3. The Gmail account has security restrictions');
  console.log('4. The account is temporarily locked');
  console.log('\nIMPORTANT CHECKS:');
  console.log('• Verify 2FA is enabled: https://myaccount.google.com/security');
  console.log('• Check app passwords: https://myaccount.google.com/apppasswords');
  console.log('• Verify account access: https://myaccount.google.com/device-activity');
  console.log('\nIf 2FA is enabled and you have valid app passwords, but authentication still fails,');
  console.log('the Gmail account may have additional security restrictions that prevent SMTP access.');
}

runDiagnostics().catch(console.error);
