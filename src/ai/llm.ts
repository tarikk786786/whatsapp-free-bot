import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// We use the OpenAI SDK but point it to Groq's API for free Llama 3!
const ai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateReply(contactId: string, incomingMessage: string): Promise<string> {
    try {
        const user = await prisma.users.findUnique({ where: { phone: contactId } });
        const memory = user ? await prisma.memory.findFirst({ where: { user_id: user.id } }) : null;
        
        const systemPrompt = `You are a helpful WhatsApp AI assistant. 
        Context about this user: ${memory?.summary || 'New user.'}
        Keep your responses concise and natural for a chat app.`;
        
        const response = await ai.chat.completions.create({
            model: 'llama3-8b-8192', // Free, incredibly fast Llama 3 model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: incomingMessage }
            ],
            max_tokens: 150,
        });
        
        return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Error generating AI reply:', error);
        return "I'm experiencing some technical difficulties right now. Please try again later.";
    }
}
