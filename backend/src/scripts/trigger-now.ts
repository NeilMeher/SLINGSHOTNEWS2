import { translationService } from '../services/translation.service';
import { newsAggregatorService } from '../services/newsAggregator.service';

/**
 * MANUAL TRIGGER SCRIPT
 * Run this to immediately:
 * 1. Sync viral news
 * 2. Translate all pending articles
 */
async function triggerNow() {
    console.log('🔥 MANUAL TRIGGER STARTED');

    // 1. Sync new viral news
    console.log('\n📡 Syncing viral news...');
    const syncResult = await newsAggregatorService.syncNews();
    console.log(`✅ Synced ${syncResult.count} articles`);

    // 2. Translate pending articles
    console.log('\n🤖 Translating articles...');
    const translated = await translationService.processPendingTranslations(30);
    console.log(`✅ Translated ${translated.length} articles`);

    console.log('\n🎉 DONE! Refresh your feed!');
    process.exit(0);
}

triggerNow().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
