import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

let transporterInstance = null

const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  return transporterInstance
}

/**
 * Generate responsive and modern HTML template for Drivea Welcome Email
 */
const getWelcomeEmailHtml = ({ name, email, clientUrl }) => {
  const currentYear = new Date().getFullYear()
  const dashboardLink = clientUrl || 'http://localhost:5173'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Drivea Cloud Storage</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
      border: 1px solid #e2e8f0;
    }
    .header-banner {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      padding: 36px 32px 28px;
      text-align: center;
      border-bottom: 1px solid #fed7aa;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0f172a;
      line-height: 1;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 10px;
      letter-spacing: 0.2em;
      color: #ea580c;
      font-weight: 700;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .lead-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .features-card {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .feature-icon {
      font-size: 18px;
      margin-right: 12px;
      margin-top: 1px;
    }
    .feature-text {
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
    }
    .feature-title {
      font-weight: 700;
      color: #0f172a;
    }
    .account-summary {
      background-color: #fffaf5;
      border: 1px dashed #fdba74;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
    }
    .summary-label {
      color: #64748b;
    }
    .summary-val {
      font-weight: 600;
      color: #0f172a;
    }
    .cta-container {
      text-align: center;
      margin-bottom: 32px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #ea580c;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
      transition: background-color 0.2s;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer a {
      color: #ea580c;
      text-decoration: none;
      font-weight: 600;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header Banner with Logo -->
      <div class="header-banner">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td valign="middle" style="padding-right: 12px;">
              <!-- Embedded Drivea Logo SVG -->
              <img src="cid:drivea-logo" alt="Drivea Logo" width="40" height="38" style="display: block; border: 0;" />
            </td>
            <td valign="middle" style="text-align: left;">
              <h1 class="brand-title">DRIVEA</h1>
              <div class="brand-subtitle">CLOUD STORAGE</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Email Content -->
      <div class="content">
        <h2 class="greeting">Welcome aboard, ${name || 'Explorer'}! 👋</h2>
        <p class="lead-text">
          Thank you for creating an account on <strong>Drivea</strong>. Your personal high-speed cloud drive is active, secure, and ready to store your digital universe.
        </p>

        <!-- Account Summary -->
        <div class="account-summary">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="summary-label" style="padding: 4px 0; font-size: 13px; color: #64748b;">Registered Email:</td>
              <td align="right" class="summary-val" style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">${email}</td>
            </tr>
            <tr>
              <td class="summary-label" style="padding: 4px 0; font-size: 13px; color: #64748b;">Free Storage Space:</td>
              <td align="right" class="summary-val" style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #ea580c;">1.00 GB</td>
            </tr>
            <tr>
              <td class="summary-label" style="padding: 4px 0; font-size: 13px; color: #64748b;">Security:</td>
              <td align="right" class="summary-val" style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #16a34a;">Encrypted & Protected</td>
            </tr>
          </table>
        </div>

        <!-- Features Showcase -->
        <div class="features-card">
          <div style="font-size: 12px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
            What you can do right now:
          </div>

          <div style="margin-bottom: 12px;">
            <strong style="color: #0f172a; font-size: 13.5px;">⚡ Drag & Drop Uploads:</strong>
            <span style="color: #475569; font-size: 13.5px;"> Drop files directly into your browser with real-time speed & progress tracking.</span>
          </div>

          <div style="margin-bottom: 12px;">
            <strong style="color: #0f172a; font-size: 13.5px;">📂 Smart Folders & Views:</strong>
            <span style="color: #475569; font-size: 13.5px;"> Switch smoothly between Grid and Google Drive-style List Table views.</span>
          </div>

          <div style="margin-bottom: 12px;">
            <strong style="color: #0f172a; font-size: 13.5px;">📦 Multi-Select & ZIP Export:</strong>
            <span style="color: #475569; font-size: 13.5px;"> Select multiple files and folders to batch-delete or download as a .ZIP archive.</span>
          </div>

          <div>
            <strong style="color: #0f172a; font-size: 13.5px;">⭐ Starred & Recent:</strong>
            <span style="color: #475569; font-size: 13.5px;"> Star your critical documents for instant access from any device.</span>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="cta-container">
          <a href="${dashboardLink}" class="cta-btn" target="_blank">
            Launch Drivea &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
          Need assistance or have questions? Simply reply directly to this email.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>
          Designed &amp; Developed with precision by{' '}
          <a href="https://melanakash.vercel.app" target="_blank">Melan Akash</a>
        </div>
        <div style="margin-top: 6px;">
          &copy; ${currentYear} Drivea Cloud Storage Platform. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send welcome email to newly registered user
 * @param {Object} options
 * @param {string} options.name - User's full name
 * @param {string} options.email - User's email address
 */
export const sendWelcomeEmail = async ({ name, email }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] SMTP credentials not set in .env. Skipping welcome email.')
    return { success: false, reason: 'Credentials not configured' }
  }

  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    const mailOptions = {
      from: `"Drivea Cloud Storage" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to Drivea, ${name || 'User'}! 🚀 (Your 1 GB Cloud Storage is Ready)`,
      html: getWelcomeEmailHtml({ name, email, clientUrl }),
      attachments: [
        {
          filename: 'logo.svg',
          content: `<svg width="63" height="59" viewBox="0 0 63 59" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.7696 33.9423L19.6599 20.6719L9.82994 38.4886L0 56.3054H15.7279L27.7696 33.9423Z" fill="#F54900"/><path d="M29.4812 1.44167L22.3329 16.7865L46.3377 56.2469L62.666 56.2469L29.4812 1.44167Z" fill="#F54900"/></svg>`,
          cid: 'drivea-logo',
        },
      ],
    }

    const info = await getTransporter().sendMail(mailOptions)
    console.log(`[EmailService] Welcome email sent successfully to ${email}. MessageId: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[EmailService] Failed to send welcome email to ${email}:`, error)
    return { success: false, error: error.message }
  }
}

export default {
  sendWelcomeEmail,
}
