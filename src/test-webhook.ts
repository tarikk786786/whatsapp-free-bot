import { handleIncomingMessage } from './whatsappHandler';
import { WhatsAppWebhookPayload } from './types';

// Simulate an incoming WhatsApp Webhook payload
const testPayload: WhatsAppWebhookPayload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '1234567890',
    changes: [{
      field: 'messages',
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '1234567890',
          phone_number_id: '1234567890'
        },
        contacts: [{
          profile: { name: 'Test User' },
          wa_id: '15555555555'
        }],
        messages: [{
          from: '15555555555',
          id: 'wamid.HBgLMTU1NTU1NTU1NTUVREI3QzM4QzJFMzM3MEI4OUEA',
          timestamp: Date.now().toString(),
          type: 'text',
          text: { body: 'Hello! This is a test message to the bot.' }
        }]
      }
    }]
  }]
};

console.log('Simulating incoming WhatsApp webhook message...');

handleIncomingMessage(testPayload)
  .then(() => {
    console.log('Webhook processed successfully! Check your database to see if the message and AI reply were saved.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error processing webhook:', err);
    process.exit(1);
  });
