import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { Signal } from '../db/types';

export interface EmailAlertPayload {
  signal: Signal;
  recipientEmail: string;
  appUrl: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: 'RESEND' | 'NODEMAILER' | 'MOCK';
  messageId?: string;
  error?: string;
}

export async function sendDipAlertEmail(payload: EmailAlertPayload): Promise<EmailSendResult> {
  const { signal, recipientEmail, appUrl } = payload;
  const isGold = signal.symbol.includes('GOLD');
  const assetName = isGold ? 'GoldBEES (Nippon India Gold ETF)' : 'SilverBEES (Nippon India Silver ETF)';
  const badgeColor = isGold ? '#D97706' : '#64748B';
  const approveUrl = `${appUrl}/api/hitl-action?action=APPROVE&signalId=${signal.id}`;
  const dashboardUrl = `${appUrl}`;

  const subject = `🚨 ACCUMULATION ALERT: ${signal.symbol} @ ₹${signal.price.toFixed(2)} (RSI ${signal.rsi.toFixed(1)}) - Action Required`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0F19; color: #F3F4F6; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1F2937, #111827); padding: 24px; border-bottom: 1px solid #374151; }
    .badge { display: inline-block; background-color: ${badgeColor}; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0; }
    .content { padding: 24px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; }
    .metric-box { background-color: #1F2937; padding: 12px 16px; border-radius: 8px; border: 1px solid #374151; }
    .metric-label { font-size: 11px; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.05em; }
    .metric-value { font-size: 20px; font-weight: 700; color: #F9FAFB; margin-top: 4px; }
    .rsi-highlight { color: #34D399; font-weight: 800; }
    .rule-box { background-color: rgba(217, 119, 6, 0.15); border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; color: #FDE68A; }
    .actions { margin-top: 24px; text-align: center; }
    .btn-approve { display: inline-block; background-color: #10B981; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; margin-right: 12px; }
    .btn-dashboard { display: inline-block; background-color: #374151; color: #D1D5DB; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 20px; border-radius: 8px; }
    .footer { padding: 16px 24px; background-color: #0B0F19; border-top: 1px solid #1F2937; font-size: 12px; color: #6B7280; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">${signal.symbol}</div>
      <h1 class="title">Quantitative Dip Trigger Detected</h1>
      <p style="color: #9CA3AF; font-size: 13px; margin: 6px 0 0 0;">Strict >99% mathematical RSI-14 & 50-EMA accumulation mandate</p>
    </div>
    <div class="content">
      <div class="rule-box">
        <strong>Mandate Trigger:</strong> ${signal.conditionTriggered}<br />
        <strong>Recommended Action:</strong> Deploy <strong>₹${signal.recommendedAmount.toLocaleString('en-IN')}</strong> from HDFC Sweep-in.
      </div>
      <div class="metric-grid">
        <div class="metric-box">
          <div class="metric-label">Current Market Price</div>
          <div class="metric-value">₹${signal.price.toFixed(2)}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">14-Day Wilder's RSI</div>
          <div class="metric-value rsi-highlight">${signal.rsi.toFixed(2)}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">50-Day EMA</div>
          <div class="metric-value">₹${signal.ema50.toFixed(2)}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">HITL Status</div>
          <div class="metric-value" style="color: #F59E0B; font-size: 16px;">Pending Approval</div>
        </div>
      </div>
      <p style="font-size: 14px; color: #D1D5DB; line-height: 1.5;">
        Human-in-the-loop safeguard is active. Capital will <strong>not</strong> be deployed until you authorize this accumulation tranche.
      </p>
      <div class="actions">
        <a href="${approveUrl}" class="btn-approve">✓ One-Click Approve (₹${signal.recommendedAmount.toLocaleString('en-IN')})</a>
        <a href="${dashboardUrl}" class="btn-dashboard">Open Dashboard</a>
      </div>
    </div>
    <div class="footer">
      Smart Dip Accumulator Automation • Vercel Serverless Architecture • NSE India
    </div>
  </div>
</body>
</html>
`;

  // 1. Try Resend HTTP API if configured (Vercel recommended edge approach)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: process.env.SMTP_FROM || 'alerts@smartdip.finance',
        to: recipientEmail,
        subject,
        html: htmlContent,
      });
      return {
        success: true,
        provider: 'RESEND',
        messageId: res.data?.id,
      };
    } catch (err: any) {
      console.error('Resend API failed, trying SMTP fallback:', err);
    }
  }

  // 2. Try Nodemailer with awaited Promise (anti-connection-drop mandate)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Await explicitly before function returns to satisfy Vercel TCP rule
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        provider: 'NODEMAILER',
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('Nodemailer SMTP failed:', err);
      return {
        success: false,
        provider: 'NODEMAILER',
        error: err.message || String(err),
      };
    }
  }

  // 3. Fallback: Simulated Mock Mode (Logs clean simulated alert without crashing)
  console.log(`[EMAIL ALERT SIMULATED] Alert queued for ${recipientEmail}: ${subject}`);
  return {
    success: true,
    provider: 'MOCK',
    messageId: `mock-msg-${Date.now()}`,
  };
}
