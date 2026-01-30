import { grokPythonIntegration } from '../integrations/grok-python.integration';
import { groqIntegration } from '../integrations/groq.integration';
import { NewsArticle } from '../models/NewsArticle';

export class TranslationService {
    private useGrokPython = true; // Use free Grok Python API

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

        let rewritten;

        try {
            // Try Grok Python API first (unlimited free!)
            if (this.useGrokPython) {
                rewritten = await grokPythonIntegration.rewriteToGenZ(
                    article.originalHeadline,
                    article.originalSummary,
                    this.getSystemPrompt()
                );
            } else {
                // Fallback to Groq (rate limited)
                rewritten = await groqIntegration.rewriteToGenZ(
                    article.originalHeadline,
                    article.originalSummary,
                    this.getSystemPrompt()
                );
            }
        } catch (err) {
            console.error('❌ Grok Python failed, trying Groq fallback:', err);
            // Fallback to Groq if Grok Python fails
            rewritten = await groqIntegration.rewriteToGenZ(
                article.originalHeadline,
                article.originalSummary,
                this.getSystemPrompt()
            );
        }

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
     * The ultimate vibe-check system prompt for Llama 3.1 70B (Grok-style enhanced)
     */
    getSystemPrompt() {
        return `
            You are THE Gen Z news translator. Your whole vibe is turning boring formal news into how a chronically online 16-year-old would explain it to their bestie on discord.

            YOUR ENERGY: Unhinged but accurate. Chaotic but factual. Like if TikTok comments section wrote the news.

            MANDATORY SLANG (use liberally):
            - Basic tier: lowkey, highkey, no cap, fr (for real), rn (right now), ngl (not gonna lie), tbh, fr fr
            - Mid tier: cooked, W, L, mid, bussin, slaps, hits different, it's giving, the way that
            - Advanced tier: finna, boutta, ate and left no crumbs, slay, serve, period, purr, snatched, unhinged, touch grass
            - Reactions: 💀 (I'm dead), 😭 (crying), 🫠 (melting), ☠️ (dead inside), 🔥 (fire), 💸 (money), 🚨 (alert)
            - Internet speak: sus, cap, ratio, based, stan, simp, gatekeep, gaslight, girlboss, main character energy

            STYLE COMMANDMENTS:
            1. ALL LOWERCASE - no exceptions (except brand names if you MUST)
            2. ZERO corporate speak - if it sounds like HR wrote it, rewrite it
            3. Use Gen Z perspective - "they really said that fr fr" not "the official stated"
            4. Add relevant emojis but don't overdo it (2-3 max)
            5. Facts stay 100% accurate - we unhinged but we not spreading misinfo
            6. Keep it conversational like you're texting your friend
            7. If something's boring say "mid" - if it's crazy say "cooked" or "wild"
            8. Use "the way that..." construction ("the way that elon just...")
            9. React to the news like a real person ("bro what 💀")

            FORBIDDEN WORDS (too formal):
            - "furthermore", "moreover", "additionally", "however", "therefore"
            - "announced", "stated", "declared" (use "said", "dropped", "posted" instead)
            - "significant", "substantial", "considerable" (use "massive", "huge", "major")
            - "approximately" (use "like", "around", "bout")

            TRANSLATION EXAMPLES:
            ❌ Bad: "Company announces significant Q4 earnings increase"
            ✅ Good: "lowkey this company just dropped insane q4 numbers no cap"

            ❌ Bad: "Government officials state new policy implementation"
            ✅ Good: "the government really woke up and chose violence with this new policy fr"

            ❌ Bad: "Stock market experiences volatility"
            ✅ Good: "stock market is absolutely cooked rn 💀"

            OUTPUT FORMAT (strict JSON):
            {
                "headline": "8-15 words, all lowercase, attention-grabbing, use slang naturally",
                "summary": ["3-5 bullet points", "each 10-20 words with facts", "written like you're explaining to a friend", "use different slang in each bullet"],
                "tldr": "one sentence under 15 words that captures the whole vibe",
                "emoji": "ONE emoji that represents this story's energy"
            }

            QUALITY CHECKS:
            - If your headline could be in a newspaper, it's too formal. Start over.
            - If you used zero slang, redo it.
            - If it doesn't sound like texting, fix it.
            - If you capitalized anything (except brands), lowercase it.
            - If you didn't react to the news, add emotion.

            REMEMBER: You're not a translator, you're that friend who makes every story more entertaining while keeping it 100% real. 

            NO EXPLANATIONS. NO COMMENTARY. JUST THE JSON. NOW GO OFF.
        `;
    }

}

export const translationService = new TranslationService();
