-- supabase/migrations/20250101_initial_schema.sql

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  name text,
  created_at timestamptz DEFAULT now()
);

-- CHATS TABLE
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message text,
  unread_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender text CHECK(sender IN ('user','bot')) NOT NULL,
  text text,
  timestamp timestamptz DEFAULT now(),
  status text,
  is_media boolean DEFAULT false,
  media_url text
);

-- MEMORY TABLE
CREATE TABLE IF NOT EXISTS public.memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  summary text,
  facts jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL
);

-- LOGS TABLE
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  level text,
  source text,
  message text,
  details jsonb
);

-- API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  key text NOT NULL, -- Stored securely (in practice, use Vault or encrypt)
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_user_id ON public.memory(user_id);

-- RLS POLICIES (Assuming authenticated roles for admin API)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Default to blocking public access. Service role bypasses RLS.
CREATE POLICY "Deny all public access to users" ON public.users FOR ALL USING (false);
CREATE POLICY "Deny all public access to chats" ON public.chats FOR ALL USING (false);
CREATE POLICY "Deny all public access to messages" ON public.messages FOR ALL USING (false);
CREATE POLICY "Deny all public access to memory" ON public.memory FOR ALL USING (false);
CREATE POLICY "Deny all public access to settings" ON public.settings FOR ALL USING (false);
CREATE POLICY "Deny all public access to logs" ON public.logs FOR ALL USING (false);
CREATE POLICY "Deny all public access to api_keys" ON public.api_keys FOR ALL USING (false);
