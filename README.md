## Contact form email delivery

The contact form sends messages through the server-side `/api/contact` Vercel Function. The Resend API key is read only by the function and must never be added to browser code.

### Configure Resend

1. Create a Resend API key in your Resend account.
2. Add these environment variables to the Vercel project:
   - `RESEND_API_KEY`: your secret Resend API key.
   - `CONTACT_TO_EMAIL`: `ahmedhelmybusniess123@gmail.com` (optional; this is the default).
   - `RESEND_FROM_EMAIL`: a sender address on a domain verified in Resend.
3. Redeploy the Vercel project so the function receives the variables.

For local development, copy `.env.example` to `.env.local`, add your real Resend key, and run the project with `vercel dev`. The fallback `onboarding@resend.dev` sender is for testing; production email should use a verified sending domain.
