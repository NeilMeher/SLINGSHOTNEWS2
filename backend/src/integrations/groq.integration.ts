import Groq from 'groq-sdk';
import { config } from '../config/env';

export class GroqIntegration {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: config.GROQ_API_KEY,
        });
    }

    async rewriteToGenZ(title: string, description: string, systemPrompt?: string): Promise<{
        headline: string;
        summary: string[];
        tldr: string;
        emoji: string
    }> {
        try {
            const prompt = `
        Input Headline: "${title}"
        Input Summary: "${description}"

        Provide:
        1. headline: (translated headline)
        2. tldr: (one sentence summary)
        3. summary: (4-5 bullet points)
        4. emoji: (one emoji that represents the story)

        Return as JSON format ONLY:
        {
          "headline": "...",
          "summary": ["...", "...", "...", "..."],
          "tldr": "...",
          "emoji": "..."
        }
      `;

            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt || `You are a Gen Z news translator. Transform formal news into Gen Z language while keeping facts accurate. 
                        Act like an unhinged 16-year-old telling news to his friend. 
                        Style: all lowercase, natural slang (no cap, fr, cooked, mid, etc.), relevant emojis, concise, exact facts. 
                        Output valid JSON ONLY. NO YAPPING.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: config.GROQ_MODEL,
                response_format: { type: 'json_object' },
            });

            const content = chatCompletion.choices[0]?.message?.content || '{}';
            console.log('🤖 Raw Groq Response:', content);
            const response = JSON.parse(content);

            return {
                headline: response.headline || title.toLowerCase(),
                summary: Array.isArray(response.summary) ? response.summary : [description.toLowerCase()],
                tldr: response.tldr || 'it is what it is fr fr 💀',
                emoji: response.emoji || '📰',
            };
        } catch (error) {
            console.error('❌ Groq Rewrite Error:', error);
            return {
                headline: title.toLowerCase(),
                summary: [description.toLowerCase()],
                tldr: 'check back later, ai is cooked 💀',
                emoji: '⚠️',
            };
        }
    }
}

export const groqIntegration = new GroqIntegration();
