# Security and Runbook

## Security Checklist
- [x] **HTTPS Only:** Ensure production hosting forces TLS.
- [x] **Secure Secrets:** Environment variables are used for all keys; no hardcoded credentials.
- [x] **RBAC/RLS:** Supabase tables have Row Level Security enabled to isolate tenant data.
- [x] **Input Sanitization:** Relies on Supabase client parameters to prevent SQL injection.
- [x] **Webhook Verification:** The bot verifies the `hub.verify_token` during WhatsApp webhook setup.

## Runbook

### Incident: Webhook Failing (WhatsApp unable to reach server)
1. Check hosting provider logs (e.g., Render/AWS) to see if the server is up.
2. Hit the `/health` endpoint manually.
3. If the server is down, restart the container.

### Incident: AI Model Quota Exceeded / 429 Errors
1. Rotate the `OPENAI_API_KEY` in the environment variables (via CI/CD secrets or hosting provider dashboard).
2. Restart the deployment.

### Database Backups
- Supabase provides automated daily backups.
- For point-in-time recovery, use the Supabase dashboard to restore from the latest healthy snapshot.

### Rollback Procedure
1. Revert the problematic commit in GitHub.
2. The CI/CD pipeline will automatically build and deploy the previous stable image.
3. If a database migration caused the issue, apply a reverse migration via the Supabase CLI (`supabase migration down`).
