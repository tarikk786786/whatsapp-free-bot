export interface User {
  id: string;
  phone: string;
  name?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'bot';
  text?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'received';
  is_media: boolean;
  media_url?: string;
}

export interface Memory {
  id: string;
  user_id: string;
  summary?: string;
  facts: Record<string, any>;
  preferences: Record<string, any>;
  updated_at: string;
}

// WhatsApp Webhook Payloads
export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
          image?: { id: string };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
