# Smart Dip Accumulator - Core Engineering Rules

## 1. Mathematical Accuracy Mandate (>99%)
- All quantitative calculations for RSI and EMA must strictly follow NSE standard formulas.
- Never hardcode or guess prices, RSI, or indicator values in production endpoints.
- If upstream data is unavailable, exit cleanly with 204 or 502 status; never write false signals to the database.

## 2. Human-In-The-Loop (HITL) Guarantee
- The pipeline MUST NOT execute automated trades or capital deductions without explicit user approval.
- All new dip conditions must produce `PENDING_APPROVAL` status records.
- Sweep-in balance deductions only happen upon explicit user confirmation (`UI_DASHBOARD`, `EMAIL_ACTION`, or `CHATBOT_TOOL`).

## 3. Serverless Anti-Drop Email Pattern
- Raw persistent SMTP TCP connections must never be returned without awaiting the promise.
- Prefer Resend HTTP API for Vercel edge/serverless runtimes.

## 4. Anti-Crash UI Boundaries
- All page components must remain wrapped in `error.tsx`.
- The dashboard must degrade gracefully with cached telemetry instead of rendering a blank screen.
