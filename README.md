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

## How the project works

This project is a full-stack digital signature comparison app built with a Node/Express backend and a Next.js frontend.

### 1. User authentication

- A user signs in through the frontend at `/login`.
- The backend verifies the email and password and returns a JWT token.
- That token is stored in local storage so protected pages can request data from the API.
- The app redirects logged-in users to `/dashboard` automatically.

### 2. Document workflow

- Users upload a document to the backend through the documents API.
- The backend stores the document metadata and prepares it for signing or verification.
- The document is hashed and processed using the selected cryptographic algorithm.

### 3. Signature generation

- A user chooses a signing algorithm such as RSA-PSS, DSA, ECDSA, or Ed25519.
- The backend generates a digital signature using the selected key material and document hash.
- Signature records are saved in MongoDB along with metadata such as date, user, algorithm, and document reference.

### 4. Signature verification

- The system can verify whether a signature matches the original document and the public key.
- Verification checks the signature against the document hash and confirms authenticity.
- This helps compare how different algorithms behave under real validation conditions.

### 5. Benchmarks and analytics

- The app can run benchmark tests comparing signing and verification performance across algorithms.
- Results are collected and displayed in the dashboard for analysis.
- The admin section gives a higher-level view of system activity and usage.

### 6. Backend architecture

- The backend exposes REST routes for authentication, documents, signatures, benchmarks, dashboard statistics, and admin actions.
- MongoDB stores users, documents, signatures, audit logs, and benchmark data.
- The app uses JWT authentication, bcrypt hashing, and schema validation to protect the API.

### 7. Frontend flow

- The frontend is organized by pages like `/login`, `/dashboard`, `/documents`, `/sign`, `/verify`, `/benchmark`, and `/admin`.
- The app uses route protection so only authenticated users can access protected screens.
- Most of the UI is focused on interacting with the backend APIs and rendering comparison results.

## Production notes

Use HTTPS, a managed MongoDB instance, strong secrets, a reverse proxy, object storage for larger documents, and a queue/worker for long benchmark jobs. This project intentionally uses the Node crypto library for secure algorithm comparisons rather than custom cryptographic primitives.

# Login

Use:

Email: admin@example.com
Password: Admin12345!
