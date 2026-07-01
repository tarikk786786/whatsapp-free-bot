import os
import json
from fastapi import FastAPI, Request, Response
from pywa import WhatsApp
from pywa.types import Message
import openai
from supabase import create_client, Client

app = FastAPI()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

openai.api_key = os.environ.get("OPENAI_API_KEY")
AI_MODEL = os.environ.get("AI_MODEL", "gpt-4")
AI_TEMPERATURE = float(os.environ.get("AI_TEMPERATURE", "0.7"))

wa = WhatsApp(
    phone_id=os.environ.get("WA_PHONE_NUMBER_ID", ""),
    token=os.environ.get("WHATSAPP_TOKEN", ""),
    server=app,
    verify_token=os.environ.get("WEBHOOK_VERIFY_TOKEN", ""),
    webhook_endpoint="/api/webhook_cloud",
)

def generate_reply(user_id: str, text: str, history: list) -> str:
    memory_text = "No prior memory."
    try:
        mem_res = supabase.table("memory").select("*").eq("user_id", user_id).execute()
        if mem_res.data and len(mem_res.data) > 0:
            memory_text = mem_res.data[0].get("summary") or json.dumps(mem_res.data[0].get("preferences", {}))
    except Exception as e:
        print("Error fetching memory:", e)

    system_prompt = f"""You are a helpful and polite WhatsApp assistant. 
Keep your responses concise and suitable for WhatsApp. Do not use excessive markdown.
User Memory / Preferences:
{memory_text}"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": text})

    try:
        response = openai.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            temperature=AI_TEMPERATURE
        )
        return response.choices[0].message.content or "Sorry, I could not generate a response."
    except Exception as e:
        print("Error with OpenAI:", e)
        return "Sorry, I am currently unavailable. Please try again later."

@wa.on_message()
def handle_message(_: WhatsApp, msg: Message):
    phone = msg.from_user.wa_id
    text = msg.text

    if not text:
        return

    # 1. Get or create user
    user_res = supabase.table("users").select("*").eq("phone", phone).execute()
    if user_res.data:
        user = user_res.data[0]
    else:
        new_user = supabase.table("users").insert({"phone": phone, "name": msg.from_user.name or "Unknown"}).execute()
        user = new_user.data[0]
    user_id = user["id"]

    # 2. Get or create chat
    chat_res = supabase.table("chats").select("*").eq("user_id", user_id).execute()
    if chat_res.data:
        chat = chat_res.data[0]
    else:
        new_chat = supabase.table("chats").insert({"user_id": user_id}).execute()
        chat = new_chat.data[0]
    chat_id = chat["id"]

    # 3. Save incoming message
    supabase.table("messages").insert({
        "chat_id": chat_id,
        "sender": "user",
        "text": text,
        "status": "received"
    }).execute()

    # 4. Load history
    hist_res = supabase.table("messages").select("*").eq("chat_id", chat_id).order("timestamp", desc=True).limit(10).execute()
    history = []
    for m in reversed(hist_res.data or []):
        history.append({
            "role": "assistant" if m["sender"] == "bot" else "user",
            "content": m.get("text") or ""
        })

    # 5. Generate AI Reply
    bot_reply = generate_reply(user_id, text, history)

    # 6. Save bot reply
    supabase.table("messages").insert({
        "chat_id": chat_id,
        "sender": "bot",
        "text": bot_reply,
        "status": "sent"
    }).execute()

    # 7. Update chat last_message
    supabase.table("chats").update({
        "last_message": bot_reply
    }).eq("id", chat_id).execute()

    # 8. Send reply via WhatsApp
    msg.reply_text(bot_reply)

# Optional: Catch-all health route
@app.get("/api/webhook_cloud")
def health_check():
    return {"status": "ok", "message": "Cloud Webhook Running"}
