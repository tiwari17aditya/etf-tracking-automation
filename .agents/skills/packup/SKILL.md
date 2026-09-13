---
name: packup
description: >-
  Automated session packup routine for the Smart Dip Accumulator project.
  Triggers all project skills (smart-dip-quant, smart-dip-hitl-workflow, vercel-serverless-deploy,
  smart-dip-orchestrator), updates all project documentation across the workspace, validates production builds,
  stages and pushes changes to GitHub, and concludes with an inspiring motivational proverb.
---

# /packup Workflow Runbook

When the user types `/packup` or requests a session packup, you must execute this sequence without omitting any steps.

---

## Step 1: Trigger All Project Skills & Workflows
Sequentially verify and activate the mandates from all skills:
1. **`smart-dip-quant`**: Verify mathematical calculation integrity (>99% Wilder's RSI-14 and 50-EMA).
2. **`smart-dip-hitl-workflow`**: Ensure all pending signals and HITL states are persisted with audit logs.
3. **`vercel-serverless-deploy`**: Validate `vercel.json` crons, headers, and serverless runtime budgets.
4. **`smart-dip-orchestrator`**: Check cross-system dependencies, logs, and token tracking tables.

---

## Step 2: Update All Project Documentation Across Workspace
1. **`README.md`**: Update feature list, architecture diagram, environment variables table, and 1-click deployment badge.
2. **`walkthrough.md`**: Document recent features, token metrics, tabular log structures, and test results.
3. **`data/store.json`**: Ensure recent seeds, logs, and token counters are safely flushed.

---

## Step 3: Run Validation Quality Gate
Run the production build:
```bash
npm run build
```
Verify that TypeScript type checks pass with 0 errors and all dynamic routes are generated.

---

## Step 4: Stage, Commit & Push to GitHub
```bash
git add .
git commit -m "feat(packup): synchronize project state, docs, and git suite [automated packup]"
git push origin main
```

---

## Step 5: Output Report & Motivational Proverb
Output a concise summary table of:
- Files synchronized & committed
- Total GitHub commit hash
- Active ETF tickers & Sweep-in balance
- Tabular telemetry & token usage summary

### Mandatory Conclusion
Conclude the response with an inspiring, uplifting financial or perseverance proverb formatted in bold blockquotes:

> *"Gold is tried by fire, and acceptable men in the furnace of adversity."* — Seneca  
> *(or another profound, motivating proverb on discipline, accumulation, and patience).*
