import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const useFeed = (category: string = 'general', region: string = 'us') => {
    const [news, setNews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchFeed = async () => {
        setLoading(true)
        try {
            const result = await authService.fetchWithAuth(`/v1/news/feed?category=${category}&region=${region}`)

            if (result.success) {
                setNews(result.data)
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('failed to fetch feed 💀')
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchFeed()
    }, [category, region])

    const reactToArticle = async (articleId: string, type: string) => {
        try {
            const result = await authService.fetchWithAuth('/v1/interactions/react', {
                method: 'POST',
                body: JSON.stringify({ articleId, type }),
            });
            if (result.success) {
                // Update local state for immediate feedback
                setNews(prev => prev.map(art => {
                    if (art._id === articleId) {
                        return { ...art, reactions: result.data };
                    }
                    return art;
                }));
            }
        } catch (err) {
            console.error('failed to react 💀');
        }
    };

    const bookmarkArticle = async (articleId: string) => {
        try {
            const result = await authService.fetchWithAuth('/v1/interactions/bookmark', {
                method: 'POST',
                body: JSON.stringify({ articleId }),
            });
            return result;
        } catch (err) {
            console.error('failed to bookmark 💀');
        }
    };

    return { news, loading, error, refresh: fetchFeed, reactToArticle, bookmarkArticle }
}
