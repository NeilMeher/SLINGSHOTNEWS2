import axios from 'axios';

/**
 * Grok Python API Integration (Free, Unlimited)
 * Using: https://github.com/realasfngl/Grok-Api
 */
export class GrokPythonIntegration {
    private readonly apiUrl = 'http://localhost:6969';

    /**
     * Rewrite news to Gen Z using FREE Grok API
     */
    async rewriteToGenZ(headline: string, summary: string, systemPrompt: string): Promise<any> {
        try {
            const userPrompt = `
                Translate this news into Gen Z language:
                
                HEADLINE: ${headline}
                SUMMARY: ${summary}
                
                ${systemPrompt}
            `;

            const response = await axios.post(`${this.apiUrl}/ask`, {
                message: userPrompt,
                model: 'grok-3-fast', // Fast model for speed
                extra_data: null,
                proxy: null
            }, {
                timeout: 30000 // 30 second timeout
            });

            if (response.data.status === 'success') {
                const aiResponse = response.data.response;

                // Parse JSON from AI response
                const parsed = this.extractJSON(aiResponse);

                console.log('🤖 Grok Python Response:', parsed);

                return parsed;
            } else {
                throw new Error('Grok API returned error');
            }
        } catch (err: any) {
            console.error('❌ Grok Python API Error:', err?.message);
            throw err;
        }
    }

    /**
     * Extract JSON from Grok response
     */
    private extractJSON(text: string): any {
        try {
            // Try to parse directly
            return JSON.parse(text);
        } catch {
            // Extract JSON from markdown code blocks
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                text.match(/```\n([\s\S]*?)\n```/) ||
                text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }

            throw new Error('Could not extract JSON from response');
        }
    }

    /**
     * Test connection to Grok API
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/ask`, {
                message: 'Hello, respond with just "OK"',
                model: 'grok-3-fast',
                extra_data: null,
                proxy: null
            }, {
                timeout: 10000
            });

            return response.data.status === 'success';
        } catch (err) {
            console.error('❌ Grok Python API not reachable:', err);
            return false;
        }
    }
}

export const grokPythonIntegration = new GrokPythonIntegration();
