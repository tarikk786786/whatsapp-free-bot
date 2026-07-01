import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { handleIncomingMessage } from './whatsappHandler';
import { WhatsAppWebhookPayload } from './types';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_webhook_verification_token';

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// WhatsApp Webhook Verification Endpoint
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// WhatsApp Webhook Event Endpoint
app.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload: WhatsAppWebhookPayload = req.body;
    
    // In a real production scenario, you would also verify the X-Hub-Signature 
    // to ensure the payload is actually from Meta/WhatsApp.
    
    // Process message asynchronously
    // WhatsApp requires a 200 OK response immediately
    res.sendStatus(200);

    await handleIncomingMessage(payload);
  } catch (err) {
    console.error('Error handling webhook POST:', err);
    // Even on error, we don't want WhatsApp to retry infinitely if it's a parsing issue,
    // but in a queue-based system, we might handle this differently.
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp Auto-Reply Bot server listening on port ${PORT}`);
});
