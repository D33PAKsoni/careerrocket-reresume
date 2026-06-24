# ReResume — AI Resume & Portfolio Builder

> Next.js 14 · Supabase · Claude Sonnet 4.6 · Tailwind CSS · Vercel

---

## Prerequisites

- Node.js 18 or later
- npm (comes with Node)
- A [Supabase](https://supabase.com) account (free tier works)

---

## Local Setup (VS Code)

### 1. Clone the repository

```bash
git clone https://github.com/D33PAKsoni/careerrocket-reresume.git
cd careerrocket-reresume
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Give it a name (e.g. `resumeai`) and choose a region close to you
3. Wait ~1 minute for provisioning
4. Go to **Settings → API** in your Supabase project dashboard
5. Copy **Project URL** and **anon / public** key

### 4. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` in VS Code and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Enable email confirmation (dev shortcut)

By default Supabase requires email confirmation. To skip this during development:

1. In Supabase dashboard → **Authentication → Providers → Email**
2. Toggle **"Confirm email"** OFF
3. Save

This lets you register and log in immediately without checking email. **Re-enable before going to production.**

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment variables reference

| Variable | Scope | Phase |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser) | 
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser) | 
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never expose to browser | 
| `GEMINI_API_KEY` | Server only — never expose to browser | 

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (/ route)
│   ├── login/page.tsx      # Login page
│   ├── register/page.tsx   # Register page
│   └── dashboard/page.tsx  # Protected dashboard
├── components/
│   └── LogoutButton.tsx    # Client component for sign-out
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server Supabase client
└── middleware.ts            # Route protection + session refresh
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Auth & Database | Supabase (Auth, PostgreSQL, Storage) |
| AI Generation | Gemini 3.1 Flash Lite |
| Hosting | Vercel |
