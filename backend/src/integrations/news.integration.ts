import axios from 'axios';
import { config } from '../config/env';

export interface NewsAPIArticle {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export class NewsAPIIntegration {
    private readonly baseUrl = 'https://newsapi.org/v2';
    private readonly apiKey = config.NEWS_API_KEY;

    async getTopHeadlines(category: string = 'general', country: string = 'us'): Promise<NewsAPIArticle[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/top-headlines`, {
                params: {
                    apiKey: this.apiKey,
                    category,
                    country,
                },
            });

            return response.data.articles;
        } catch (error) {
            console.error('❌ NewsAPI Error:', error);
            return [];
        }
    }

    async searchNews(query: string): Promise<NewsAPIArticle[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    apiKey: this.apiKey,
                    q: query,
                    sortBy: 'publishedAt',
                },
            });

            return response.data.articles;
        } catch (error) {
            console.error('❌ NewsAPI Search Error:', error);
            return [];
        }
    }
}

export const newsApiIntegration = new NewsAPIIntegration();
