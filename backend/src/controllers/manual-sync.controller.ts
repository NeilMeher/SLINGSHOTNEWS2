import { Request, Response } from 'express';
import { newsAggregatorService } from '../services/newsAggregator.service';
import { translationService } from '../services/translation.service';

export class ManualSyncController {
    /**
     * Manually trigger news sync + translation
     */
    async triggerSync(req: Request, res: Response) {
        try {
            console.log('🔥 MANUAL SYNC TRIGGERED');

            // 1. Sync new viral news
            const syncResult = await newsAggregatorService.syncNews();
            console.log(`✅ Synced ${syncResult.count} articles`);

            // 2. Translate immediately (30 articles)
            const translated = await translationService.processPendingTranslations(30);
            console.log(`✅ Translated ${translated.length} articles`);

            res.json({
                success: true,
                message: 'Sync completed!',
                data: {
                    synced: syncResult.count,
                    translated: translated.length
                }
            });
        } catch (err: any) {
            console.error('❌ Manual sync error:', err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
}

export const manualSyncController = new ManualSyncController();
