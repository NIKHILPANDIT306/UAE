# UAE Pass Integration Project

Full-stack MERN application with normal authentication (sign in, sign up, forgot/reset password) and UAE PASS OAuth integration.

## Project Structure

```
UAE/
├── backend/          # Node.js + Express API
├── frontend/         # React (Vite) SPA
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local via Compass or Atlas)
- UAE PASS staging credentials (from TDRA after registration — see PDF guide)

## Quick Start

### 1. MongoDB

Ensure MongoDB is running locally (`mongodb://localhost:27017`). The app uses database `uae_pass_app` by default.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your JWT secret and UAE PASS credentials
npm install
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Authentication Features

| Feature | Route | Description |
|---------|-------|-------------|
| Sign Up | `/signup` | Email/password registration |
| Sign In | `/signin` | Email/password login |
| Forgot Password | `/forgot-password` | Request reset link |
| Reset Password | `/reset-password?token=...` | Set new password |
| UAE PASS Login | Sign in/up pages | OAuth via UAE PASS staging |
| Dashboard | `/dashboard` | Protected user profile |

## UAE PASS Integration

### OAuth Flow

1. User clicks **Sign in with UAE PASS**
2. Backend generates auth URL → redirects to `stg-id.uaepass.ae`
3. User authenticates on UAE PASS (mobile MFA)
4. Callback to `http://localhost:5000/api/auth/uae-pass/callback`
5. Backend exchanges code for token, fetches user info, creates/links user
6. Redirect to frontend with JWT

### Required Environment Variables

```env
UAE_PASS_CLIENT_ID=your_client_id
UAE_PASS_CLIENT_SECRET=your_client_secret
UAE_PASS_REDIRECT_URI=http://localhost:5000/api/auth/uae-pass/callback
```

### Obtaining Credentials

Follow the TDRA Digital Portal process (see `UAE PASS Integration.pdf`):

1. Log in to TDRA Digital Portal with UAE PASS
2. Register your entity/company if needed
3. Submit **Request for Linking to UAE PASS** with UAE PASS Toolkit Link
4. After approval, receive `client_id` and `client_secret` for staging

### Staging Endpoints (default in `.env.example`)

- Authorize: `https://stg-id.uaepass.ae/idshub/authorize`
- Token: `https://stg-id.uaepass.ae/idshub/token`
- UserInfo: `https://stg-id.uaepass.ae/idshub/userinfo`
- Logout: `https://stg-id.uaepass.ae/idshub/logout`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/signin` | No | Login |
| POST | `/api/auth/forgot-password` | No | Request reset |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/uae-pass/login` | No | Get UAE PASS auth URL |
| GET | `/api/auth/uae-pass/callback` | No | OAuth callback |
| POST | `/api/auth/uae-pass/logout` | No | UAE PASS logout URL |

## Forgot Password (Dev Mode)

If SMTP is not configured, the reset link is logged to the backend console and returned in the API response (`devResetUrl`) for testing.

## Production Notes

- Change `JWT_SECRET` and use strong secrets
- Use production UAE PASS endpoints (`id.uaepass.ae` instead of `stg-id.uaepass.ae`)
- Configure SMTP for password reset emails
- Set `CLIENT_URL` and `UAE_PASS_REDIRECT_URI` to production URLs
- Register production callback URL with TDRA

## Documentation

- [UAE PASS Developer Docs](https://docs.uaepass.ae/overview)
- [TDRA Digital Portal](https://tdra.gov.ae) — for credential registration
