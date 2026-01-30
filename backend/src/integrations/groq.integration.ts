import axios from 'axios';
import Groq from 'groq-sdk';
import { config } from '../config/env';

/**
 * Translation Integration
 * 
 * Priority Order:
 * 1. Grok API Wrapper (free, unlimited) - localhost:6969
 * 2. Groq SDK (rate limited, but reliable) - fallback
 */
export class GroqIntegration {
    private grokApiUrl: string;
    private groqSdk: Groq;
    private grokAvailable: boolean = true;
    private lastGrokCheck: number = 0;
    private grokCooldown: number = 60000; // 1 minute cooldown after failure

    constructor() {
        // Primary: Grok API Wrapper (free, unlimited)
        this.grokApiUrl = config.GROK_API_URL || 'http://localhost:6969/ask';

        // Fallback: Official Groq SDK (rate limited)
        this.groqSdk = new Groq({
            apiKey: config.GROQ_API_KEY,
        });
    }

    /**
     * Rewrite news article content in Gen Z style
     * Uses Grok API as primary, Groq SDK as fallback
     */
    async rewriteToGenZ(title: string, description: string, systemPrompt?: string): Promise<{
        headline: string;
        summary: string[];
        tldr: string;
        emoji: string
    }> {
        const brainrotPrompt = systemPrompt || this.getGenZPrompt();
        const userPrompt = this.getUserPrompt(title, description);

        // 1. Try Grok API Wrapper (Primary - FREE & UNLIMITED)
        if (this.shouldTryGrok()) {
            try {
                console.log('🚀 [PRIMARY] Trying Grok API Wrapper...');
                const result = await this.callGrokApi(brainrotPrompt, userPrompt, title, description);
                if (result) {
                    console.log('✅ [PRIMARY] Grok API success!');
                    this.grokAvailable = true;
                    return result;
                }
            } catch (grokError: any) {
                console.warn(`⚠️ [PRIMARY] Grok API Failed: ${grokError.message || grokError}`);
                this.markGrokUnavailable();
            }
        } else {
            console.log('⏳ [PRIMARY] Grok API on cooldown, skipping...');
        }

        // 2. Fallback to Groq SDK (RATE LIMITED)
        console.log('🔄 [FALLBACK] Switching to Groq SDK...');
        try {
            const result = await this.callGroqSdk(brainrotPrompt, userPrompt, title, description);
            if (result) {
                console.log('✅ [FALLBACK] Groq SDK success!');
                return result;
            }
        } catch (groqError: any) {
            console.error('❌ [FALLBACK] Groq SDK Failed:', groqError?.message);
        }

        // 3. Ultimate fallback - return basic formatting
        console.error('💀 Both APIs failed. Using basic fallback.');
        return this.getBasicFallback(title, description);
    }

    /**
     * Call the Grok API Wrapper
     */
    private async callGrokApi(systemPrompt: string, userPrompt: string, title: string, description: string): Promise<any> {
        const fullMessage = `${systemPrompt}\n\n${userPrompt}`;

        const response = await axios.post(this.grokApiUrl, {
            message: fullMessage,
            model: "grok-3-fast"  // Using fast mode for speed
        }, {
            timeout: 30000,  // 30s timeout
            validateStatus: (status) => status < 500 // Don't throw on 4xx
        });

        // Check for errors in response
        if (!response.data) {
            throw new Error('Empty response from Grok API');
        }

        if (response.data.error) {
            throw new Error(JSON.stringify(response.data.error));
        }

        if (response.data.status === 'success' && response.data.response) {
            return this.parseResponse(response.data.response, title, description);
        }

        // Legacy format support
        if (response.data.response) {
            return this.parseResponse(response.data.response, title, description);
        }

        throw new Error('Invalid response format from Grok API');
    }

    /**
     * Call the Official Groq SDK
     */
    private async callGroqSdk(systemPrompt: string, userPrompt: string, title: string, description: string): Promise<any> {
        const completion = await this.groqSdk.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: config.GROQ_MODEL,
            temperature: 0.8,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content || '{}';
        return this.parseResponse(content, title, description);
    }

    /**
     * Check if we should try Grok API
     */
    private shouldTryGrok(): boolean {
        if (!this.grokAvailable) {
            // Check if cooldown has passed
            if (Date.now() - this.lastGrokCheck > this.grokCooldown) {
                this.grokAvailable = true;
                console.log('🔄 Grok API cooldown expired, re-enabling...');
            }
        }
        return this.grokAvailable;
    }

    /**
     * Mark Grok API as temporarily unavailable
     */
    private markGrokUnavailable(): void {
        this.grokAvailable = false;
        this.lastGrokCheck = Date.now();
        console.log(`⏸️ Grok API marked unavailable for ${this.grokCooldown / 1000}s`);
    }

    /**
     * Get the Gen Z brainrot prompt
     */
    private getGenZPrompt(): string {
        return `You are a chaotic Gen Z TikTok news anchor. Rewrite this news into a viral video script or unhinged X thread.
                    
        TONE & STYLE:
        - MAXIMUM Brainrot Vocabulary: use terms like 'aura points', 'crashout', 'skibidi', 'gyatt', 'rizzler', 'sigma', 'beta', 'gooned', 'delulu', 'locked in', 'huzz', 'glazing', 'cooked', 'ate', 'fanum tax'.
        - 100% LOWERCASE ONLY.
        - Talk directly to the user: "brooo", "hear me out", "chat is this real".
        - Heavy emoji usage: 😭💀🔥🫡🗿🤡⚠️🦅.
        - Short, chaotic sentences.
        - Use TikTok/Zoomer comment section vibes.
        - Be ironic/sarcastic but accurate.
        
        FORMATTING:
        - Headline: Clickbait, viral, unhinged.
        - Summary: 4-5 bullet points of pure brainrot explanation.
        - TLDR: One sentence hook (e.g. "bro cooked too hard 💀").
        
        EXAMPLE OUTPUT STYLE:
        "bro really thought he could gatekeep the economy 💀 negative aura points fr"
        "it's giving massive L energy no cap"
        "chat move this man to ohio immediately"

        Output JSON format ONLY:
        {
            "headline": "string",
            "summary": ["string", "string", "string", "string"],
            "tldr": "string",
            "emoji": "single emoji string"
        }`;
    }

    /**
     * Get the user prompt for translation
     */
    private getUserPrompt(title: string, description: string): string {
        return `
        Input Headline: "${title}"
        Input Summary: "${description}"
        
        REWRITE THIS NOW IN JSON FORMAT.
        `;
    }

    /**
     * Parse AI response to extract structured content
     */
    private parseResponse(content: string, originalTitle: string, originalDesc: string): any {
        try {
            console.log('🤖 Parsing AI Response...');

            // Extract JSON from various formats
            let jsonStr = content;

            // Try to extract from markdown code blocks
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                content.match(/```\n([\s\S]*?)\n```/) ||
                content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                jsonStr = jsonMatch[1] || jsonMatch[0];
            }

            const parsed = JSON.parse(jsonStr);

            return {
                headline: (parsed.headline || originalTitle).toLowerCase(),
                summary: Array.isArray(parsed.summary)
                    ? parsed.summary.map((s: string) => s.toLowerCase())
                    : [originalDesc.toLowerCase()],
                tldr: (parsed.tldr || 'it is what it is fr fr 💀').toLowerCase(),
                emoji: parsed.emoji || '📰',
            };
        } catch (e) {
            console.warn('⚠️ JSON Parse Failed, returning raw content');
            return {
                headline: originalTitle.toLowerCase(),
                summary: [content.toLowerCase().slice(0, 200) + '...'],
                tldr: 'ai yapping too much to parse 💀',
                emoji: '🤖'
            };
        }
    }

    /**
     * Basic fallback when all APIs fail
     */
    private getBasicFallback(title: string, description: string): any {
        return {
            headline: title.toLowerCase(),
            summary: [description.toLowerCase()],
            tldr: 'server crashed out, check back later 💀',
            emoji: '⚠️'
        };
    }

    /**
     * Health check for Grok API
     */
    async checkGrokHealth(): Promise<boolean> {
        try {
            const response = await axios.post(this.grokApiUrl, {
                message: "Hello",
                model: "grok-3-fast"
            }, { timeout: 5000 });

            return response.data?.status === 'success' || !!response.data?.response;
        } catch {
            return false;
        }
    }
}

export const groqIntegration = new GroqIntegration();
