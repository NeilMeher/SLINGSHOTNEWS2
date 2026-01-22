import { groqIntegration } from '../integrations/groq.integration';
import { NewsArticle } from '../models/NewsArticle';

export class TranslationService {
    /**
     * Rewrite a single article's contents into Gen Z style.
     */
    async translateArticle(articleId: string) {
        const article = await NewsArticle.findById(articleId);
        if (!article) throw new Error('article not found 💀');

        const prompt = `
            Translate this news into Gen Z language:

            HEADLINE: ${article.originalHeadline}
            SUMMARY: ${article.originalSummary}

            Provide:
            1. headline: (translated headline)
            2. tldr: (one sentence summary)
            3. summary: (4-5 bullet points)
            4. emoji: (one emoji that represents the story)

            Return as JSON.
        `;

        const rewritten = await groqIntegration.rewriteToGenZ(
            article.originalHeadline,
            article.originalSummary,
            this.getSystemPrompt()
        );

        // Quality Checks
        this.runQualityChecks(rewritten);

        article.headline = rewritten.headline;
        article.summary = rewritten.summary;
        article.tldr = rewritten.tldr;
        article.emoji = rewritten.emoji;
        article.translatedAt = new Date();

        await article.save();
        return article;
    }

    /**
     * Batch translate multiple articles with delays to respect rate limits.
     */
    async batchTranslate(articleIds: string[]) {
        const results = [];
        for (const id of articleIds) {
            try {
                const updated = await this.translateArticle(id);
                results.push(updated);
                await this.delay(200); // Rate limit protection
            } catch (err) {
                console.error(`❌ Batch translation failed for ${id}:`, err);
            }
        }
        return results;
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private runQualityChecks(data: any) {
        // 1. Verify JSON format (checked by groqIntegration usually, but enforced here)
        if (!data.headline || !data.summary || !data.tldr || !data.emoji) {
            throw new Error('mid response from ai: missing fields 💀');
        }

        // 2. Check bullet point count (4-5)
        if (data.summary.length < 3 || data.summary.length > 5) {
            console.warn('⚠️ ai yapping too much or too little, summary length:', data.summary.length);
        }

        // 3. Verify lowercase (simple check)
        const isLowercase = data.headline === data.headline.toLowerCase();
        if (!isLowercase) {
            console.log('💡 ai forgot lowercase. fixing it...');
            data.headline = data.headline.toLowerCase();
        }
    }

    /**
     * Process all pending (untranslated) articles in the database.
     */
    async processPendingTranslations(limit: number = 10) {
        const pending = await NewsArticle.find({
            headline: { $exists: false }
        }).limit(limit);

        if (pending.length === 0) return [];

        console.log(`🤖 Processing ${pending.length} pending translations...`);
        return this.batchTranslate(pending.map(p => p._id.toString()));
    }

    /**
     * The ultimate vibe-check system prompt for Llama 3.1 70B
     */
    getSystemPrompt() {
        return `
            You are a Gen Z news translator. Transform formal news into Gen Z language while keeping facts accurate.
            TAKE THE PERSONA: Act like an unhinged 16-year-old telling news to his friend.

            STYLE RULES:
            - All lowercase (except proper nouns if needed).
            - Use Gen Z slang naturally (lowkey, highkey, no cap, fr, rn, cooked, W, L, mid, lol, lmao, sup, etc.).
            - If you know ANY other Gen Z slang, use it.
            - Add relevant emojis (💀 😭 🔥 🫠 💸 🚨 ⚠️ 📉 📈).
            - Keep it concise and punchy.
            - Keep numbers and facts EXACT.
            - Don't sensationalize - stay neutral but unhinged in delivery.

            REQUIREMENTS:
            1. Headline: 8-15 words, attention-grabbing, lowercase.
            2. Summary: 4-5 bullet points, each 10-20 words, each with facts in slang.
            3. TLDR: One sentence, under 15 words.
            4. Emoji: One thematic emoji.

            OUTPUT JSON ONLY:
            {
                "headline": "...",
                "summary": ["...", "...", "...", "..."],
                "tldr": "...",
                "emoji": "..."
            }

            NO YAPPING. NO EXPLANATIONS.
        `;
    }
}

export const translationService = new TranslationService();
