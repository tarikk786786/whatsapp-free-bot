import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateReply(contactId: string, incomingMessage: string): Promise<string> {
    try {
        const memory = await prisma.memory.findUnique({ where: { contactId } });
        
        const systemPrompt = `You are a helpful WhatsApp AI assistant. 
        Context about this user: ${memory?.summary || 'New user.'}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\nUser: ${incomingMessage}`,
        });
        
        return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Error generating AI reply:', error);
        return "I'm experiencing some technical difficulties right now. Please try again later.";
    }
}
