# Smart Dip Accumulator & Dashboard (Vercel Architecture)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftiwari17aditya%2Fetf-tracking-automation&project-name=etf-tracking-automation&env=CRON_SECRET,ALERT_RECIPIENT_EMAIL,RESEND_API_KEY)

An end-to-end, highly accurate quantitative monitoring system for **Gold & Silver ETFs (`GOLDBEES.NS` & `SILVERBEES.NS`)**, featuring a Next.js web dashboard, an integrated AI Quant Co-Pilot chatbot, Vercel Serverless Cron automation, and an automated SMTP / Resend email alerting system. The system enforces a **>99% mathematical accuracy mandate** with a **Human-In-The-Loop (HITL)** capital protection mechanism.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[Vercel Cron '0 4-10 * * 1-5'] -->|Bearer CRON_SECRET| B[/api/cron-runner]
    B -->|Layer 1: Tenacity Backoff| C[api/quant.py: yfinance + pandas]
    C -->|RSI-14 & 50-EMA Calculation| D{Dip Condition Met?}
    D -->|No| E[Log Telemetry / No-Op]
    D -->|Yes: RSI < 35| F[Log Signal: PENDING_APPROVAL]
    F -->|Await Promise / Resend API| G[Email Alert with One-Click HITL Link]
    F --> H[HITL Action Center Dashboard]
    H -->|User Approves ₹7,400| I[Execute & Deduct Sweep-In Balance]
    H -->|User Rejects| J[Archive Proposal with Audit Note]
    K[AI Quant Co-Pilot] -->|Deterministic Tools| L[Exact DB Telemetry - Zero Hallucination]
```

---

## 🚀 Environment Variables for Deployment

When deploying to **Vercel**, set the following in **Project Settings > Environment Variables**:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `CRON_SECRET` | **Required.** Authorization secret for Vercel Cron. | `smart_dip_cron_secure_secret_2026` |
| `NEXT_PUBLIC_APP_URL` | **Required.** Your production Vercel URL. | `https://your-app.vercel.app` |
| `ALERT_RECIPIENT_EMAIL` | **Required.** Email address to receive accumulation alerts. | `your-email@example.com` |
| `RESEND_API_KEY` | **Recommended.** HTTP Email API key (resend.com) to bypass serverless TCP drops. | `re_123456789...` |
| `SMTP_HOST` | *(Optional if not using Resend)* SMTP server host. | `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional if not using Resend)* SMTP server port. | `587` |
| `SMTP_USER` | *(Optional if not using Resend)* SMTP username. | `user@gmail.com` |
| `SMTP_PASS` | *(Optional if not using Resend)* SMTP app password. | `app-password-here` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | *(Optional)* Google Gemini API key for AI Chatbot. Built-in deterministic engine works without it! | `AIzaSy...` |
| `DATABASE_URL` | Database connection string. SQLite is default for zero-setup local dev; Supabase or Vercel Postgres for cloud. | `file:./dev.db` |

---

## 🛠️ Local Development

### 1. Python Virtual Environment (`.venv`)
```bash
# Create virtual environment
python -m venv .venv

# Install quantitative requirements
.\.venv\Scripts\pip.exe install -r requirements.txt
```

### 2. Node.js Next.js Server
```bash
# Install npm dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 📦 Deployment to Vercel via Git

1. **Initialize and Commit to Git**:
```bash
git add .
git commit -m "feat: Smart Dip Accumulator with HITL, Vercel Cron, and AI Co-Pilot"
```

2. **Connect your GitHub Remote Repository**:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

3. **Import into Vercel**:
- Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
- Under **Environment Variables**, paste the variables listed in the table above.
- Click **Deploy**.
- Vercel will automatically detect `vercel.json` and activate the Cron Job for Indian market hours (`0 4-10 * * 1-5`).

---

## 🛡️ Anti-Crash Mandate (3 Layers)

1. **Layer 1 (Ingestion)**: Exponential retries with `tenacity` against NSE/Yahoo Finance throttling; exits cleanly with `204` or `502` to prevent database corruption.
2. **Layer 2 (Frontend UI)**: React Error Boundary ([`app/error.tsx`](./app/error.tsx)) with cached fallback feed ensuring zero blank white screens.
3. **Layer 3 (Chatbot Guardrails)**: Deterministic RAG tool-calling with zero price hallucination and verified hardcoded fallback prompts.
