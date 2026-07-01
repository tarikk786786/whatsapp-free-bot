import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();

// Initialize the Groq SDK with the provided API key from env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function generateReply(contactId: string, incomingMessage: string): Promise<string> {
    try {
        const user = await prisma.users.findUnique({ where: { phone: contactId } });
        const memory = user ? await prisma.memory.findFirst({ where: { user_id: user.id } }) : null;
        
        const setting = await prisma.settings.findUnique({ where: { key: 'bot_config' } });
        let customPrompt = 'You are a helpful WhatsApp AI assistant.';
        if (setting && setting.value && typeof setting.value === 'object' && 'systemPrompt' in setting.value) {
            customPrompt = (setting.value as any).systemPrompt || customPrompt;
        }

        const systemPrompt = `${customPrompt}\nContext about this user: ${memory?.summary || 'New user.'}\nKeep your responses concise and natural for a chat app.`;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: incomingMessage }
            ],
            model: 'llama3-8b-8192',
            max_tokens: 150,
        });
        
        return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Error generating AI reply:', error);
        return "I'm experiencing some technical difficulties right now. Please try again later.";
    }
}
