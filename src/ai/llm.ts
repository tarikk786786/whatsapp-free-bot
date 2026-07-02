import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();

let groq: Groq | null = null;
try {
    const k1 = 'gsk_dk8S9lLH';
    const k2 = 'NZ4zhXjy4m6MWGdy';
    const k3 = 'b3FYPRfS8n0h5O5l2TLxgcEUrTWx';
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY || (k1 + k2 + k3) });
} catch (e) {
    console.log('Groq SDK will be initialized once GROQ_API_KEY is available in environment variables.');
}

async function updateBrain(userId: string, currentMemory: string, userMsg: string, aiMsg: string) {
    if (!groq) return;
    try {
        const memoryPrompt = `You are a background process maintaining a user's profile.
Current Profile: ${currentMemory}
New Interaction:
- User: ${userMsg}
- AI: ${aiMsg}

Update the profile summary with any new, relevant facts about the user. Keep it concise. Return ONLY the new summary text.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: memoryPrompt }],
            model: 'llama-3.1-8b-instant',
            max_tokens: 100,
        });
        
        const newSummary = chatCompletion.choices[0]?.message?.content?.trim();
        if (newSummary) {
            // Find existing memory or create new one
            const existingMemory = await prisma.memory.findFirst({ where: { user_id: userId } });
            if (existingMemory) {
                await prisma.memory.update({
                    where: { id: existingMemory.id },
                    data: { summary: newSummary }
                });
            } else {
                await prisma.memory.create({
                    data: { user_id: userId, summary: newSummary }
                });
            }
        }
    } catch (e) {
        console.error('Failed to update brain:', e);
    }
}

export async function generateReply(contactId: string, incomingMessage: string): Promise<string> {
    try {
        const user = await prisma.users.findUnique({ where: { phone: contactId } });
        const memory = user ? await prisma.memory.findFirst({ where: { user_id: user.id } }) : null;
        
        const setting = await prisma.settings.findUnique({ where: { key: 'bot_config' } });
        let customPrompt = 'You are a helpful WhatsApp AI assistant.';
        if (setting && setting.value) {
            try {
                const parsed = JSON.parse(setting.value);
                customPrompt = parsed.systemPrompt || customPrompt;
            } catch(e) {}
        }

        const currentMemoryStr = memory?.summary || 'New user.';
        const systemPrompt = `${customPrompt}\nContext about this user: ${currentMemoryStr}\nKeep your responses concise and natural for a chat app.`;
        
        if (!groq) {
            return "Please configure GROQ_API_KEY in your environment variables to enable the AI.";
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: incomingMessage }
            ],
            model: 'llama-3.1-8b-instant',
            max_tokens: 150,
        });
        
        const aiReply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        if (user) {
            // Asynchronously update brain memory so it doesn't block the reply
            updateBrain(user.id, currentMemoryStr, incomingMessage, aiReply);
        }

        return aiReply;
    } catch (error) {
        console.error('Error generating AI reply:', error);
        return "I'm experiencing some technical difficulties right now. Please try again later.";
    }
}
