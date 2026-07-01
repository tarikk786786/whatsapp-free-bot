# WhatsApp AI Assistant (100% Free Version)

This version of the WhatsApp bot uses completely free technologies:
- **Baileys** for direct WhatsApp WebSocket connection (No Paid APIs)
- **Google Gemini Flash 2.5** for AI (Free tier via Google AI Studio)
- **Supabase** for PostgreSQL database (Free tier)

## How to Deploy to Render (For Free)

Since this bot requires a continuous WebSocket connection to your phone, it cannot run on Vercel. We will host it on Render.com instead.

### 1. Push to GitHub
First, you need to push this code to a new GitHub repository:
1. Go to github.com and create a new repository (e.g. `whatsapp-free-bot`).
2. Run these commands in your terminal to push your code:
   ```bash
   git remote add origin https://github.com/yourusername/whatsapp-free-bot.git
   git branch -M main
   git push -u origin main
   ```

### 2. Connect to Render
1. Go to [Render.com](https://render.com) and sign up using your GitHub account.
2. Click **New +** and select **Web Service**.
3. Select the `whatsapp-free-bot` repository you just created.
4. Fill in the settings:
   - **Name:** WhatsApp AI Bot
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3. Environment Variables
Scroll down on Render and click **Advanced**. Add the following environment variables (copy them from your `.env` file):
- `DATABASE_URL`
- `DIRECT_URL`
- `GEMINI_API_KEY`

### 4. Deploy and Scan QR
1. Click **Create Web Service**.
2. Once Render finishes deploying, look at the **Logs** tab on Render.
3. You will see a QR code printed in the logs! 
4. Open WhatsApp on your phone, go to **Linked Devices**, and scan the QR code on your computer screen to connect the bot!

> Note: Render's free tier spins down after 15 minutes of inactivity. To keep the bot awake 24/7, you can use a free pinging service like UptimeRobot to ping the `https://your-render-url.onrender.com/health` endpoint every 10 minutes.
