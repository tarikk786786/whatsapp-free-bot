import { supabase } from './supabaseClient';
import { generateReply } from './aiClient';
import { WhatsAppWebhookPayload } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v16.0';
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

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
 * Handles incoming WhatsApp webhook payloads.
 */
export async function handleIncomingMessage(payload: WhatsAppWebhookPayload) {
  try {
    if (payload.object !== 'whatsapp_business_account') {
      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value.messages && change.value.messages[0]) {
          const message = change.value.messages[0];
          const contact = change.value.contacts?.[0];
          const from = message.from; // Phone number
          const text = message.text?.body;
          const messageId = message.id;

          if (!text) {
            console.log('Received non-text message. Ignoring for now.');
            continue;
          }

          // 1. Get or create user
          let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('phone', from)
            .single();

          if (!user) {
            const { data: newUser, error } = await supabase
              .from('users')
              .insert({ phone: from, name: contact?.profile?.name || 'Unknown' })
              .select()
              .single();
            if (error) throw error;
            user = newUser;
          }

          if (!user) throw new Error('Failed to create or retrieve user.');

          // 2. Get or create chat
          let { data: chat } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!chat) {
            const { data: newChat, error } = await supabase
              .from('chats')
              .insert({ user_id: user.id })
              .select()
              .single();
            if (error) throw error;
            chat = newChat;
          }

          if (!chat) throw new Error('Failed to create or retrieve chat.');

          // 3. Save incoming message
          await supabase.from('messages').insert({
            chat_id: chat.id,
            sender: 'user',
            text: text,
            status: 'received'
          });

          // 4. Load recent history
          const { data: historyMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('timestamp', { ascending: false })
            .limit(10);

          const history = (historyMessages || []).reverse().map(m => ({
            role: m.sender === 'bot' ? 'assistant' as const : 'user' as const,
            content: m.text || ''
          }));

          // 5. Generate AI Reply
          const botReply = await generateReply(user.id, text, history);

          // 6. Save bot reply
          await supabase.from('messages').insert({
            chat_id: chat.id,
            sender: 'bot',
            text: botReply,
            status: 'sent'
          });

          // 7. Update chat last_message
          await supabase.from('chats').update({
            last_message: botReply,
            updated_at: new Date().toISOString()
          }).eq('id', chat.id);

          // 8. Send reply via WhatsApp
          await sendWhatsAppMessage(from, botReply);
        }
      }
    }
  } catch (error) {
    console.error('Error in handleIncomingMessage:', error);
  }
}
