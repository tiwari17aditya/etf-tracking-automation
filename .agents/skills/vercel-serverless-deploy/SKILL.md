---
name: vercel-serverless-deploy
description: >-
  Vercel Serverless deployment, Cron job scheduling, environment secrets setup,
  and zero-downtime continuous deployment workflows.
  Use when deploying updates, debugging serverless cold-start timeouts, or modifying vercel.json.
---

# Vercel Serverless Deployment Runbook

This skill guides the agent through deploying, updating, and troubleshooting Vercel Serverless functions and scheduled Cron jobs.

## Deployment Checklist

1. **Verify Production Build**:
   ```bash
   npm run build
   ```
   Ensure zero TypeScript errors, valid App Router dynamic routes (`/api/cron-runner`, `/api/chat`, `/api/dashboard-data`, `/api/hitl-action`).

2. **Verify Cron Configuration** (`vercel.json`):
   - Market hours: `0 4-10 * * 1-5` (UTC 04:00 to 10:00 = 09:30 AM to 03:30 PM IST).
   - Route path: `/api/cron-runner`.

3. **Required Environment Variables**:
   - `CRON_SECRET`: Authorization bearer token.
   - `NEXT_PUBLIC_APP_URL`: Public app URL for action links.
   - `ALERT_RECIPIENT_EMAIL`: Recipient email.
   - `RESEND_API_KEY`: HTTP API key for serverless-safe email delivery.

4. **Git Push Deployment**:
   ```bash
   git add .
   git commit -m "feat: updates"
   git push origin main
   ```
   Vercel will automatically build and deploy the changes via Git integration.
