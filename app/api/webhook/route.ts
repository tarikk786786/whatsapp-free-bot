import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v16.0'
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Handles Webhook Verification from WhatsApp
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 })
  } else {
    return new NextResponse('Forbidden', { status: 403 })
  }
}

/**
 * Sends a message via WhatsApp Cloud API.
 */
async function sendWhatsAppMessage(to: string, text: string) {
  if (!WA_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    console.warn('WhatsApp credentials missing, skipping send. Message:', text);
    return;
  }

  const url = `${WHATSAPP_API_URL}/${WA_PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send WhatsApp message:', JSON.stringify(errorData));
    }
  } catch (error) {
    console.error('Network error sending WhatsApp message:', error);
  }
}

/**
 * Generate a reply using the AI provider.
 */
async function generateReply(userId: string, currentMessage: string, history: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  // Fetch user memory
  let memoryText = 'No prior memory.';
  try {
    const memory = await prisma.memory.findFirst({
      where: { user_id: userId }
    });

    if (memory) {
      memoryText = memory.summary || JSON.stringify(memory.preferences || {});
    }
  } catch (err) {
    console.error('Error fetching memory:', err);
  }

  const systemPrompt = `You are a helpful and polite WhatsApp assistant. 
Keep your responses concise and suitable for WhatsApp. Do not use excessive markdown.
User Memory / Preferences:
${memoryText}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: currentMessage }
      ],
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });

    return response.choices[0].message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return 'Sorry, I am currently unavailable. Please try again later.';
  }
}

/**
 * Handles incoming WhatsApp webhook payloads.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (payload.object !== 'whatsapp_business_account') {
      return new NextResponse('Not a WhatsApp event', { status: 404 });
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value.messages && change.value.messages[0]) {
          const message = change.value.messages[0];
          const contact = change.value.contacts?.[0];
          const from = message.from; // Phone number
          const text = message.text?.body;

          if (!text) {
            console.log('Received non-text message. Ignoring for now.');
            continue;
          }

          // 1. Get or create user
          let user = await prisma.users.findUnique({
            where: { phone: from }
          });

          if (!user) {
            user = await prisma.users.create({
              data: { phone: from, name: contact?.profile?.name || 'Unknown' }
            });
          }

          // 2. Get or create chat
          let chat = await prisma.chats.findFirst({
            where: { user_id: user.id }
          });

          if (!chat) {
            chat = await prisma.chats.create({
              data: { user_id: user.id }
            });
          }

          // 3. Save incoming message
          await prisma.messages.create({
            data: {
              chat_id: chat.id,
              sender: 'user',
              text: text,
              status: 'received'
            }
          });

          // 4. Load recent history
          const historyMessages = await prisma.messages.findMany({
            where: { chat_id: chat.id },
            orderBy: { timestamp: 'desc' },
            take: 10
          });

          const history = historyMessages.reverse().map(m => ({
            role: m.sender === 'bot' ? 'assistant' as const : 'user' as const,
            content: m.text || ''
          }));

          // 5. Generate AI Reply
          const botReply = await generateReply(user.id, text, history);

          // 6. Save bot reply
          await prisma.messages.create({
            data: {
              chat_id: chat.id,
              sender: 'bot',
              text: botReply,
              status: 'sent'
            }
          });

          // 7. Update chat last_message
          await prisma.chats.update({
            where: { id: chat.id },
            data: {
              last_message: botReply,
              updated_at: new Date()
            }
          });

          // 8. Send reply via WhatsApp
          await sendWhatsAppMessage(from, botReply);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
