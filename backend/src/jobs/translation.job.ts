import cron from 'node-cron';
import { translationService } from '../services/translation.service';

/**
 * Scheduled job to translate raw news articles into Gen Z style.
 * Runs every 5 minutes to keep up with the news aggregator.
 */
export const startTranslationJob = () => {
    console.log('🤖 Translation Sync Job successfully initialized. Timing: Every 5 minutes.');

    cron.schedule('*/5 * * * *', async () => {
        console.log('✨ Starting scheduled translation batch...');
        const startTime = Date.now();

        try {
            // Process up to 20 articles per batch to respect rate limits
            const result = await translationService.processPendingTranslations(20);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            if (result.length > 0) {
                console.log(`✅ Translation complete. Glowed up ${result.length} articles in ${duration}s. ✨`);
            }
        } catch (err) {
            console.error('❌ Scheduled translation failed:', err);
        }
    });
};
