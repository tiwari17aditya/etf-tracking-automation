"""
Standalone Log Purge Utility for Smart Dip Accumulator.
Cleans up stale records from data/store.json based on retention days.
Scheduled automatically on Vercel via /api/purge cron.
"""

import sys
import json
import os
from datetime import datetime, timezone, timedelta

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "store.json")
RETENTION_DAYS = 14

def run_purge(retention_days: int = RETENTION_DAYS):
    if not os.path.exists(DATA_FILE):
        print(f"Data file not found at {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=retention_days)
    signal_cutoff = now - timedelta(days=7)

    # Purge App Logs
    initial_app_logs = len(data.get("appLogs", []))
    data["appLogs"] = [
        l for l in data.get("appLogs", [])
        if datetime.fromisoformat(l["timestamp"].replace("Z", "+00:00")) > cutoff
    ]
    if len(data["appLogs"]) < 20 and initial_app_logs > 0:
        data["appLogs"] = data.get("appLogs", [])[:20]
    purged_app_logs = initial_app_logs - len(data["appLogs"])

    # Purge Cron Logs
    initial_cron_logs = len(data.get("cronLogs", []))
    data["cronLogs"] = [
        c for c in data.get("cronLogs", [])
        if datetime.fromisoformat(c["createdAt"].replace("Z", "+00:00")) > cutoff
    ]
    if len(data["cronLogs"]) < 10 and initial_cron_logs > 0:
        data["cronLogs"] = data.get("cronLogs", [])[:10]
    purged_cron_logs = initial_cron_logs - len(data["cronLogs"])

    # Purge Chat Logs
    initial_chat_logs = len(data.get("chatLogs", []))
    data["chatLogs"] = [
        c for c in data.get("chatLogs", [])
        if datetime.fromisoformat(c["timestamp"].replace("Z", "+00:00")) > cutoff
    ]
    purged_chat_logs = initial_chat_logs - len(data["chatLogs"])

    # Expire stale pending signals
    expired_signals = 0
    for s in data.get("signals", []):
        if s.get("status") == "PENDING_APPROVAL":
            sig_time = datetime.fromisoformat(s["createdAt"].replace("Z", "+00:00"))
            if sig_time < signal_cutoff:
                s["status"] = "EXPIRED"
                s["notes"] = "Auto-expired during scheduled retention purge."
                expired_signals += 1

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Purge complete ({retention_days}-day retention):")
    print(f"  • Purged App Logs: {purged_app_logs}")
    print(f"  • Purged Cron Logs: {purged_cron_logs}")
    print(f"  • Purged Chat Sessions: {purged_chat_logs}")
    print(f"  • Expired Stale Signals: {expired_signals}")

if __name__ == "__main__":
    days = int(sys.argv[1]) if len(sys.argv) > 1 else RETENTION_DAYS
    run_purge(days)
