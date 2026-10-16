// Verify SMTP settings from .env.local (see .env.example). Never prints credentials.
// Usage: node test-smtp.js            -> verify login only
//        TEST_EMAIL_TO=you@example.com node test-smtp.js  -> also send a test email
const { loadEnvConfig } = require('@next/env')
const nodemailer = require('nodemailer')

loadEnvConfig(__dirname)

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, FROM_EMAIL, TEST_EMAIL_TO } = process.env

async function main() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ SMTP_HOST, SMTP_USER and SMTP_PASS must be set in .env.local (copy .env.example)')
    process.exit(1)
  }

  console.log('SMTP config:', { host: SMTP_HOST, port: SMTP_PORT || '587', secure: SMTP_SECURE === 'true' })

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })

  try {
    await transporter.verify()
    console.log('✅ SMTP login succeeded')
  } catch (error) {
    console.error('❌ SMTP login failed:', error.code || '', error.responseCode || '', error.message)
    process.exit(1)
  }

  if (TEST_EMAIL_TO) {
    const info = await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: TEST_EMAIL_TO,
      subject: 'IPO Matchmaker SMTP test',
      text: 'SMTP is configured correctly.'
    })
    console.log('✅ Test email sent:', info.messageId)
  }
}

main().catch((error) => {
  console.error('❌ SMTP test failed:', error.message)
  process.exit(1)
})
