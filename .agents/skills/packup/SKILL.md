---
name: packup
description: End-of-session packup and wrap-up automation. Validates project health, synchronizes reviewed entity scores, commits session prompt logs in JSONL and Markdown, and delivers a clean status recap.
---

# `/packup` - End-of-Session Wrap-Up Skill

This skill executes whenever the user runs `/packup` or requests to pack up / wrap up the day's engineering and research session.

## Packup Runbook Protocol

When `/packup` is called, perform the following 5 steps sequentially:

### 1. Synchronize the Reviewed Entities Vault
Run the vault updater to ensure all reviewed entities (e.g. `GOLDBEES.md`) have fresh live quotes, refreshed technical indicators, and updated checklist scores:
```bash
.\.venv\Scripts\python.exe scripts/update_reviewed_entities.py
```

### 2. Verify UI & Server Health
Ensure the backend API (`core/ui_server.py`) and static web files (`web/index.html`, `web/styles.css`, `web/app.js`) are syntax-clean and responsive:
- Test endpoint: `http://localhost:8000/api/reviewed_entities`
- Ensure JSON responses validate with zero errors.

### 3. Verify Session Logs Integrity
Ensure the current day's session logs are complete and properly formatted:
- `session_logs/json/session_log_dd-mm-yyyy.jsonl` (Valid JSON per line)
- `session_logs/md/session_log_dd-mm-yyyy.md` (Properly closed Markdown table rows)

### 4. Git Hygiene & Workspace Cleanliness
- Verify `git status` to ensure no stray temporary files or uncommitted legacy artifacts exist.
- Stage changes cleanly with `git add -u` or explicit staging.

### 5. Final Packup Summary
Present the user with a concise, executive wrap-up report:
- **Session Duration & Completed Objectives**
- **Reviewed Entities Status**: Count and score summary (e.g., GOLDBEES 9.0/10 BUY)
- **Active Endpoints**: Local UI station URL and Vercel cloud deployment status
- **Next Session Kickoff Roadmap**: Immediate priority for tomorrow.
