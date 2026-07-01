# WhatsApp Auto-Reply Bot

A production-ready, secure WhatsApp auto-reply bot using the official WhatsApp Cloud API, Node.js/TypeScript backend, Supabase (Postgres), and OpenAI.

## Features
- **WhatsApp Cloud API Integration:** Webhooks for incoming messages and Graph API for sending replies.
- **Intelligent Responses:** Uses OpenAI (GPT-4) with context-aware RAG based on user memory stored in Supabase.
- **Secure Storage:** Uses Supabase Postgres with Row Level Security (RLS).
- **CI/CD Ready:** Includes GitHub Actions workflow and Dockerfile.

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your credentials (WhatsApp, Supabase, OpenAI).
4. **Database Setup:**
   Make sure you have Supabase CLI installed. Run the migrations:
   ```bash
   supabase db push
   ```

## Running Locally

```bash
npm run dev
```
The server will start on port 3000 (or the port specified in your `.env`).

## Deployment
Use the included `Dockerfile` and CI/CD pipeline (`.github/workflows/ci.yml`) to deploy to your preferred hosting provider (e.g., Render, Vercel, AWS ECS).
