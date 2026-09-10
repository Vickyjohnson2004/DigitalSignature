# DigitalSignature Suite

A web application for comparing digital signature algorithms: RSA-PSS, DSA, ECDSA, and Ed25519, with verification performance analysis.

## Architecture

- `frontend/` — Next.js + TypeScript + Tailwind UI
- `backend/` — Express + TypeScript REST API + MongoDB + Node crypto
- Algorithms: RSA-PSS, DSA, ECDSA, Ed25519
- Auth: JWT access tokens, bcrypt password hashing, role-based admin protection
- Operations: document upload, hashing, signing, verification, benchmark runs, dashboard, CSV export, and audit logs

## Quick start

1. Install dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Start the backend:
   - `cd backend && npm run dev`
3. Start the frontend:
   - `cd frontend && npm run dev`
4. Open the app:
   - Frontend: `http://localhost:3001` (or `http://localhost:3000` if free)
   - Backend API: `http://localhost:4000`

## Seeded admin account

- Email: `admin@example.com`
- Password: `Admin12345!`
- Seed command: `cd backend && npm run seed`

## Notes

- The project includes a local in-memory MongoDB fallback so it can run in environments without a reachable external MongoDB instance.
- For production, replace the connection string and secret in `backend/.env` with real values.
- Private keys are not persisted; signatures and public keys are stored as Base64 metadata.

## Production notes

Use HTTPS, a managed MongoDB instance, strong secrets, a reverse proxy, object storage for larger documents, and a queue/worker for long benchmark jobs. This project intentionally uses the Node crypto library for secure algorithm comparisons rather than custom cryptographic primitives.

#Login
Use:

Email: admin@example.com
Password: Admin12345!
