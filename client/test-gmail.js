const nodemailer = require('nodemailer');

async function testGmailAuth() {
  console.log('=== Gmail Authentication Test ===');
  
  // Test with service: 'gmail'
  console.log('\nTesting with service: "gmail"...');
  const transporter1 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    }
  });
  
  try {
    await transporter1.verify();
    console.log('✅ Gmail service configuration works!');
  } catch (error) {
    console.log('❌ Gmail service failed:', error.message);
    console.log('Error code:', error.code);
  }
  
  // Test with explicit SMTP settings (port 587)
  console.log('\nTesting with explicit SMTP (port 587)...');
  const transporter2 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    }
  });
  
  try {
    await transporter2.verify();
    console.log('✅ SMTP port 587 works!');
  } catch (error) {
    console.log('❌ SMTP port 587 failed:', error.message);
    console.log('Error code:', error.code);
  }
  
  // Test with explicit SMTP settings (port 465)
  console.log('\nTesting with explicit SMTP (port 465)...');
  const transporter3 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'fintogether.team@gmail.com',
      pass: 'jwcdflqsswhucfp'
    }
  });
  
  try {
    await transporter3.verify();
    console.log('✅ SMTP port 465 works!');
  } catch (error) {
    console.log('❌ SMTP port 465 failed:', error.message);
    console.log('Error code:', error.code);
  }
  
  // Try to send a test email
  console.log('\nAttempting to send test email...');
  const mailOptions = {
    from: 'fintogether.team@gmail.com',
    to: 'test@example.com',
    subject: 'Gmail Authentication Test',
    text: 'This is a test to verify Gmail authentication is working.',
    html: '<p>This is a test to verify Gmail authentication is working.</p>'
  };
  
  try {
    const info = await transporter1.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Full error:', JSON.stringify(error, null, 2));
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nIf authentication fails, please:');
  console.log('1. Verify 2FA is enabled on fintogether.team@gmail.com');
  console.log('2. Generate a new app password at: https://myaccount.google.com/security');
  console.log('3. Update .env.local with the new app password');
  console.log('4. Make sure the Gmail account is not locked or restricted');
}

testGmailAuth().catch(console.error);
