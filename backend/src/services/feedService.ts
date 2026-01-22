import { NewsArticle } from '../models/types';
import { newsService } from './newsService';

export class FeedService {
    async getPersonalizedFeed(userId: string): Promise<NewsArticle[]> {
        // Logic to mix and match news based on user interests
        return newsService.getLatestNews();
    }
}

export const feedService = new FeedService();
