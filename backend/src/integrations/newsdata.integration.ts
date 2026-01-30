import axios from 'axios';
import { config } from '../config/env';

export interface NewsDataArticle {
    article_id: string;
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string[] | null;
    video_url: string | null;
    description: string | null;
    content: string | null;
    pubDate: string;
    image_url: string | null;
    source_id: string;
    source_priority: number;
    country: string[];
    category: string[];
    language: string;
}

export class NewsDataIntegration {
    private readonly baseUrl = 'https://newsdata.io/api/1';
    private readonly apiKey = process.env.NEWSDATA_API_KEY || '';

    async getLatestNews(category?: string, country?: string, language: string = 'en'): Promise<NewsDataArticle[]> {
        try {
            const params: any = {
                apikey: this.apiKey,
                language,
            };

            if (category) params.category = category;
            if (country) params.country = country.toLowerCase();

            const response = await axios.get(`${this.baseUrl}/news`, { params });

            return response.data.results || [];
        } catch (error: any) {
            console.error('❌ NewsData.io Error:', error?.response?.data || error?.message);
            return [];
        }
    }

    async searchNews(query: string, language: string = 'en'): Promise<NewsDataArticle[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/news`, {
                params: {
                    apikey: this.apiKey,
                    q: query,
                    language,
                },
            });

            return response.data.results || [];
        } catch (error: any) {
            console.error('❌ NewsData.io Search Error:', error?.response?.data || error?.message);
            return [];
        }
    }

    mapCategoryToNewsData(category: string): string {
        const map: Record<string, string> = {
            tech: 'technology',
            money: 'business',
            world: 'top',
            politics: 'politics',
            science: 'science',
            health: 'health'
        };
        return map[category] || 'top';
    }
}

export const newsDataIntegration = new NewsDataIntegration();
