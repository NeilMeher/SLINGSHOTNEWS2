import { rssIntegration } from '../src/integrations/rss.integration';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
    console.log('📰 Testing RSS Feeds...');

    // Test General Category
    console.log('\n--- Fetching General ---');
    const articles = await rssIntegration.fetchDiverseRSS(5);

    console.log(`✅ Fetched ${articles.length} articles`);
    if (articles.length > 0) {
        console.log('Sample Article:', articles[0].title);
    } else {
        console.error('❌ No articles found! Check feed URLs or filter logic.');
    }
};

runTest();
