import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { supabase } from './supabaseClient';
import { Memory } from './types';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a reply using the AI provider.
 */
export async function generateReply(userId: string, currentMessage: string, history: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  // Fetch user memory
  let memoryText = 'No prior memory.';
  try {
    const { data: memory, error } = await supabase
      .from('memory')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && memory) {
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
