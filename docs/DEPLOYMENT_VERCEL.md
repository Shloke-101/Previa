# Deploying Previa Frontend on Vercel

This guide outlines how to deploy the **Previa Frontend** (supporting both Next.js App Router and Vite Single Page Application modes) to [Vercel](https://vercel.com).

---

## 1. Quick Deploy via Vercel Dashboard (Next.js - Recommended)

1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/new).
3. Import your **`Previa`** repository.
4. In the Project Configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. **Environment Variables**:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://previa-backend.onrender.com` | Production URL of your FastAPI backend |
6. Click **Deploy**.

---

## 2. Deploy as Vite SPA on Vercel (Alternative)

If you prefer to deploy the lightweight Vite single-page application:

1. Import the repository in Vercel.
2. In Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build:vite`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://previa-backend.onrender.com` | Production URL of your FastAPI backend |
4. Click **Deploy**.

---

## 3. Vercel Configuration Files

The repository includes pre-configured Vercel configuration files:

- **[`vercel.json`](file:///vercel.json)** (Root Level): Allows importing the monorepo from the repository root without manually changing build settings.
- **[`frontend/vercel.json`](file:///frontend/vercel.json)** (Frontend Level): Configures API rewrites so calls to `/api/v1/*` are automatically forwarded to your production backend.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://previa-backend.onrender.com/api/v1/:path*"
    }
  ]
}
```

---

## 4. Local Development Commands

Inside the `frontend/` directory:

```bash
# Next.js development server
npm run dev

# Vite development server
npm run dev:vite

# Production builds
npm run build        # Next.js build
npm run build:vite   # Vite build
```
