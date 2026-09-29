# DigitalSignature Suite

A **fullstack Next.js** web application for comparing digital signature algorithms: RSA-PSS, DSA, ECDSA, and Ed25519, with verification performance analysis.

## Architecture

Single **Next.js 15** fullstack app — API routes and UI live together at the repository root.

- **Frontend** — Next.js 15 + TypeScript + Tailwind CSS
- **Backend** — Next.js API Routes + MongoDB (Mongoose) + Node.js `crypto`
- **Algorithms** — RSA-PSS, DSA, ECDSA, Ed25519
- **Auth** — JWT access tokens, bcrypt password hashing, role-based admin protection
- **Operations** — Document upload, hashing, signing, verification, benchmark runs, dashboard, CSV export, audit logs

```
/
├── app/                  # Next.js pages + API routes
│   ├── api/              # API route handlers (backend logic)
│   │   ├── auth/         # login, register, me
│   │   ├── admin/        # overview, users, audit-logs
│   │   ├── documents/    # upload, download
│   │   ├── signatures/   # sign, verify, list
│   │   ├── benchmarks/   # run, list, export CSV
│   │   ├── dashboard/    # stats
│   │   └── algorithms/   # algorithm list
│   ├── dashboard/
│   ├── documents/
│   ├── sign/
│   ├── verify/
│   ├── benchmark/
│   ├── admin/
│   ├── login/
│   └── register/
├── lib/
│   ├── api.ts            # Axios client for browser-side requests
│   └── server/           # Server-only utilities
│       ├── auth.ts       # JWT helpers
│       ├── db.ts         # MongoDB connection
│       ├── crypto.ts     # DSA, ECDSA, RSA-PSS, Ed25519 implementations
│       ├── audit.ts      # Audit log helper
│       ├── env.ts        # Environment variable validation
│       └── models/       # Mongoose models
├── components/           # Shared React components
├── scripts/
│   └── seed.ts           # Admin account seeder
├── .env.example          # Environment variable template
└── package.json
```

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Vickyjohnson2004/DigitalSignature.git
cd DigitalSignature
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables in `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/DigitalSignature?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-at-least-32-chars
MAX_FILE_SIZE_MB=10
NEXT_PUBLIC_API_URL=/api
```

### 3. Seed the admin account

```bash
npm run seed
```

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000**

## Admin credentials (after seeding)

| Field    | Value               |
|----------|---------------------|
| Email    | admin@example.com   |
| Password | Admin12345!         |

## Environment Variables Reference

| Variable               | Required | Default | Description                          |
|------------------------|----------|---------|--------------------------------------|
| `MONGODB_URI`          | ✅       | —       | MongoDB connection string             |
| `JWT_SECRET`           | ✅       | —       | JWT signing secret (min 16 chars)     |
| `MAX_FILE_SIZE_MB`     | ❌       | `10`    | Max document upload size in MB        |
| `NEXT_PUBLIC_API_URL`  | ❌       | `/api`  | API base URL (keep `/api` for local)  |

## How It Works

### User Authentication
- Sign in at `/login` — JWT token returned and stored in `localStorage`
- Protected pages redirect to `/login` if no valid token

### Document Workflow
- Upload documents (PDF, TXT, DOC, DOCX) via `/documents`
- Files are SHA-256 hashed and stored in MongoDB

### Signature Generation
- Choose a document + algorithm at `/sign`
- Ephemeral key pair generated, document signed, public key and signature stored
- Private key is **never persisted**

### Signature Verification
- Select a signature and document at `/verify`
- System checks document integrity (hash match) + cryptographic validity

### Benchmarks
- Run controlled signing/verification loops at `/benchmark`
- Compare algorithm performance — signing time, verification time, signature size
- Export results as CSV

### Admin Console
- System-wide stats, user list, and audit log at `/admin`
- Requires admin role

## Scripts

| Command          | Description                             |
|------------------|-----------------------------------------|
| `npm run dev`    | Start development server (port 3000)    |
| `npm run build`  | Build production bundle                 |
| `npm run start`  | Start production server                 |
| `npm run seed`   | Seed admin user into database           |
| `npm run lint`   | Run ESLint                              |

## Production Notes

- Use HTTPS and a managed MongoDB Atlas instance
- Set a strong random `JWT_SECRET` (32+ chars)
- Use a reverse proxy (Nginx / Vercel) in front of the app
- This project uses Node.js built-in `crypto` for all cryptographic operations — no third-party crypto libraries
