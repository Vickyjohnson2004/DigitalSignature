# DigitalSignature Suite

Production-oriented MERN implementation of the DigitalSignature Suite described in the supplied project document.

## Architecture
- `frontend/` — Next.js + TypeScript + Tailwind UI
- `backend/` — Express + TypeScript REST API + MongoDB + Node crypto
- Algorithms: RSA-PSS, DSA, ECDSA, Ed25519
- Auth: JWT access tokens, bcrypt password hashing, role-based admin protection
- Operations: document upload, hashing, signing, verification, benchmark runs, dashboard, CSV export, audit logs

## Run
1. Start MongoDB.
2. Backend: `cd backend && cp .env.example .env && npm install && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env.local && npm install && npm run dev`
4. Open `http://localhost:3000`.

The backend API is at `http://localhost:4000/api` by default.

## Production notes
Use HTTPS, a managed MongoDB instance, strong secrets, a reverse proxy, object storage for larger documents, and a queue/worker for long benchmark jobs. Private keys are never persisted; signatures and public keys are stored as Base64 metadata. This project intentionally does not implement cryptography from mathematical primitives.
# DigitalSignature
