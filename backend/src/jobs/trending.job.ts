import cron from 'node-cron';
import { feedService } from '../services/feed.service';

/**
 * Scheduled job to recalculate trending scores for articles.
 * Runs every 5 minutes to keep the trending feed fresh.
 */
export const startTrendingUpdateJob = () => {
    console.log('📈 Trending Update Job successfully initialized. Timing: Every 5 minutes.');

    cron.schedule('*/5 * * * *', async () => {
        console.log('🔥 Recalculating trending scores...');
        const startTime = Date.now();

        try {
            const count = await feedService.updateTrendingScores();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Trending update complete. Top ${count} articles curated in ${duration}s. ✨`);
        } catch (err) {
            console.error('❌ Trending update job failed:', err);
        }
    });

    // Run initial update on startup
    console.log('🚀 Running initial trending score calculation...');
    feedService.updateTrendingScores().catch(err => console.error('❌ Initial trending update failed:', err));
};
