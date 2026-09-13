#!/usr/bin/env bash
set -e

echo "======================================================="
echo "Smart Dip Accumulator - Automated GitHub Push Utility"
echo "======================================================="

git status

read -p "Enter your GitHub Repository URL (or press Enter if already set): " REPO_URL

if [ -n "$REPO_URL" ]; then
    git remote remove origin 2>/dev/null || true
    git remote add origin "$REPO_URL"
    echo "Remote origin set to $REPO_URL"
fi

echo ""
echo "Staging and committing files..."
git add .
git commit -m "feat: Automated Vercel zero-touch deployment and GitHub workflows" 2>/dev/null || true

echo ""
echo "Renaming branch to main and pushing..."
git branch -M main
git push -u origin main

echo ""
echo "======================================================="
echo "Successfully pushed to GitHub!"
echo "======================================================="
