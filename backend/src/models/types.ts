export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt: Date;
    category: string;
    region: string;
    tone: 'gen-z' | 'formal';
}

export interface User {
    id: string;
    username: string;
    email: string;
    interests: string[];
    preferredRegion: string;
    bookmarks: string[]; // Article IDs
}

export interface Reaction {
    id: string;
    articleId: string;
    userId: string;
    emoji: string; // 🔥, 💀, 🤡, 💅, etc.
}

export interface Bookmark {
    id: string;
    userId: string;
    articleId: string;
    createdAt: Date;
}
