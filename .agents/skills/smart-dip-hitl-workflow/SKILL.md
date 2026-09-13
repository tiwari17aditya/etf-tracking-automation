---
name: smart-dip-hitl-workflow
description: >-
  Human-In-The-Loop (HITL) order execution, capital safety safeguards, email dispatching,
  and audit trail ledger management for the Smart Dip Accumulator.
  Use when debugging order state transitions, testing one-click email approval links,
  or adjusting capital deployment rules.
---

# Human-In-The-Loop (HITL) Order & Safety Workflow

This skill guides the agent on how to manage, test, and audit the Human-in-the-Loop decision pipeline.

## Core Safeguards

1. **Explicit Authorization**:
   - Automated market scans **never** deploy capital directly without user consent.
   - All triggered signals are stored with status: `PENDING_APPROVAL`.
2. **Capital Deductions**:
   - Only when status transitions to `APPROVED` or `EXECUTED` is the allocated amount (e.g. ₹7,400) deducted from the HDFC Sweep-In balance (`sweepInBalance`).
3. **Audit Trail**:
   - Every approval records `approvedAt`, `approvedBy` (`UI_DASHBOARD`, `EMAIL_ACTION`, or `CHATBOT_TOOL`), and `notes`.

## Triggering a Test Dip Scan

To simulate a dip signal without waiting for market hours:
1. Hit the cron endpoint with the simulation flag:
   ```bash
   curl -X POST "http://localhost:3000/api/cron-runner?simulate=true&secret=smart_dip_cron_secure_secret_2026"
   ```
2. Or in the UI header, click **"Trigger Cron" -> "Simulate Dip Trigger (Test)"**.
3. Verify that a new pending order appears in the HITL Action Center and the audit ledger updates.

## Testing One-Click Email Links

One-click email links use:
```
http://localhost:3000/api/hitl-action?action=APPROVE&signalId=<SIGNAL_ID>
```
When clicked, it updates the signal in `data/store.json` and redirects the user to the dashboard with a success toast notification.
