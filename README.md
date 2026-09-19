# ClubOps-AI-

## Development RBAC test users

The backend includes a local-only seed command for testing the `ADMIN`, `EVENT_MANAGER`, and `VOLUNTEER` roles:

1. Copy the `TEST_*` variables from `backend/.env.example` into the local `backend/.env` and set unique, non-production passwords.
2. Run `npm run seed:test-users` from `backend/`.
3. Log in normally through the application using the printed test emails and configured passwords.

This command updates or creates users by email and is idempotent. It is for local/development testing only. Do not expose it as an API endpoint, commit real credentials, or run it against production data.
