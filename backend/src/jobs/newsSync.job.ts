import cron from 'node-cron';
import { newsAggregatorService } from '../services/newsAggregator.service';

/**
 * Scheduled job to fetch new articles every 15 minutes.
 * Uses the aggregator service to scrape multiple sources
 * across categories and regions.
 */
export const startNewsSyncJob = () => {
    console.log('📡 News Sync Job successfully initialized. Timing: Every 15 minutes.');

    cron.schedule('*/15 * * * *', async () => {
        console.log('🔄 Starting scheduled news sync...');
        const startTime = Date.now();

        try {
            const result = await newsAggregatorService.syncNews();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Sync complete. Inhaled ${result.count} new articles in ${duration}s. 🔥`);
        } catch (err) {
            console.error('❌ Scheduled news sync failed:', err);
        }
    });

    // Optional: Run an initial sync on startup in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Running initial sync for development...');
        newsAggregatorService.syncNews().catch(err => console.error('❌ Initial sync failed:', err));
    }
};
