# Automated Git CI/CD Push Mandate

## Mandatory Directive
After completing any feature implementation, bug fix, or codebase modification requested by the user, the agent MUST automatically stage, commit, and push changes to the remote Git repository (`origin main`).

## Execution Protocol
1. Verify working directory cleanliness and test integrity.
2. Stage all modifications:
   ```bash
   git add -A
   ```
3. Commit with a concise, descriptive conventional-commit message:
   ```bash
   git commit -m "<type>: <brief description of changes>"
   ```
4. Push to origin main:
   ```bash
   git push origin main
   ```
5. Confirm that the push was successful, triggering automatic Vercel CI/CD and GitHub Actions deployment pipelines.
