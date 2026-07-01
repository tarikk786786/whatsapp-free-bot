# Admin Dashboard UI Specification

The admin dashboard is a proposed future addition to manage the WhatsApp bot. It should be built using a framework like Next.js or React.

## 1. Overview / Stats
- **Widgets:** Connection status, Total chats handled, Total messages sent, Error counts (24h), Uptime.

## 2. Chat Manager
- **List View:** Table of active chats with last message preview and unread counts.
- **Detail View:** Full chat history between user and bot.
- **Actions:** 
  - Pause/Resume bot for specific chat.
  - Manual override (send message manually).

## 3. User Profiles
- **View:** User's phone number, name, and joined date.
- **Memory Editor:** Inspect and edit the JSON facts and preferences stored for the user by the AI.

## 4. Settings Panel
- **System Prompt:** Editable text area to adjust the AI's core instructions.
- **Operating Hours:** Configurable start and end times for the bot.
- **Blocked/Allowed Lists:** Add phone numbers to block or whitelist.

## 5. Logs & Alerts
- **Log Viewer:** Searchable and filterable table of system logs from the `logs` table in Supabase.
- **API Key Management:** View active keys (masked), add new keys, rotate keys (utilizing Supabase Vault under the hood).
