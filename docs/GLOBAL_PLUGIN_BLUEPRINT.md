# Antigravity Global Plugin Blueprint: `smart-dip-suite`

This document defines the architecture and roadmap for converting the Smart Dip Accumulator customizations into a **Universal Global Antigravity Plugin** (`smart-dip-suite`).

Once registered in the global customization root (`~/.gemini/config/plugins/`), **every new and existing project created in Google Antigravity** will automatically inherit:
1. **Mathematical Quant Engine skills** (14-period RSI, 50-EMA, dip triggers).
2. **Human-In-The-Loop (HITL) capital protection safeguards**.
3. **Vercel Serverless zero-touch deployment templates & cron schedulers**.
4. **Formatted Tabular Telemetry & Chat Token Tracking patterns**.
5. **The `/packup` automated git synchronization & documentation routine**.

---

## 🏛️ Plugin Architecture

```
~/.gemini/config/plugins/smart-dip-suite/
├── plugin.json                          # Plugin manifest & bundle definition
├── skills/
│   ├── smart-dip-quant/SKILL.md         # Quantitative surveillance runbook
│   ├── smart-dip-hitl-workflow/SKILL.md # HITL approval workflows
│   ├── vercel-serverless-deploy/SKILL.md# Zero-touch Vercel deployment
│   ├── smart-dip-orchestrator/SKILL.md  # Cross-skill coordinator
│   └── packup/SKILL.md                  # Git push, docs update, proverb
└── rules/
    └── quant_mandates.md                # >99% Math & Anti-Crash error boundaries
```

---

## ⚡ How to Install Globally (1 Click)

In the current workspace, double-click:
```
scripts/install_global_plugin.bat
```
Or execute in PowerShell:
```powershell
.\scripts\install_global_plugin.bat
```

This copies the plugin definition directly into `%USERPROFILE%\.gemini\config\plugins\smart-dip-suite\`.

---

## 📋 Features Inherited by Any New Project

| Customization | Type | What It Does for New Projects |
| :--- | :--- | :--- |
| **`smart-dip-quant`** | Skill | Teaches the agent how to fetch Yahoo Finance / NSE tickers, calculate RSI-14 and 50-EMA, and set up `.venv` virtual environments. |
| **`smart-dip-hitl-workflow`** | Skill | Ensures all financial or state-changing actions generate pending approval proposals instead of executing autonomously. |
| **`vercel-serverless-deploy`** | Skill | Provides instant `vercel.json` configurations, security headers, and cron schedules. |
| **`quant_mandates`** | Rule | Enforces three-layer error boundaries (Tenacity backoff, React error boundaries, and AI chatbot anti-hallucination guardrails). |
| **`packup`** | Slash Command & Skill | Automates session wrap-ups: runs quality checks, updates docs, pushes to GitHub, and concludes with an inspiring proverb. |

---

## 🚀 Roadmap for Next Run

1. **Test Global Plugin Inheritance**: Open a clean test workspace in Antigravity and verify all skills load automatically via global discovery.
2. **Backtesting Visualizer**: Add historical backtesting curves for GoldBEES / SilverBEES to test dip accumulation strategies over 5-year horizons.
3. **Multi-Asset Expansion**: Add support for NIFTYBEES, MON100, and CPSEETF tickers.
4. **Local Scheduled Daemon**: Run `python scripts/local_scheduler.py` in the background during market hours for continuous zero-cloud-cost tracking.
