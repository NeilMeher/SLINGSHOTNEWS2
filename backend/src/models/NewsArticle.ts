import mongoose, { Schema, Document } from 'mongoose';

export interface INewsArticle extends Document {
    sourceId: string;
    source: string;
    sourceUrl: string;
    category: 'tech' | 'money' | 'world' | 'politics' | 'science' | 'health' | 'general';
    region: string;

    // Original Content
    originalHeadline: string;
    originalSummary: string;

    // Translated Content (Gen Z)
    headline: string;
    summary: string[]; // 4-5 bullet points
    tldr: string;
    emoji: string;

    // Metadata
    publishedAt: Date;
    translatedAt: Date;
    imageUrl?: string;
    reactions: {
        w: number;
        mid: number;
        cooked: number;
        cap: number;
    };
    views: number;
    bookmarks: number;
    trending: boolean;
    trendingScore: number;
}

const NewsArticleSchema: Schema = new Schema({
    sourceId: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    category: {
        type: String,
        enum: ['tech', 'money', 'world', 'politics', 'science', 'health', 'general'],
        required: true,
        index: true
    },
    region: { type: String, required: true, default: 'US', index: true },

    originalHeadline: { type: String, required: true },
    originalSummary: { type: String, required: true },

    headline: { type: String },
    summary: { type: [String], default: [] },
    tldr: { type: String },
    emoji: { type: String },

    publishedAt: { type: Date, required: true, index: -1 },
    translatedAt: { type: Date, default: Date.now },
    imageUrl: { type: String },
    reactions: {
        w: { type: Number, default: 0 },
        mid: { type: Number, default: 0 },
        cooked: { type: Number, default: 0 },
        cap: { type: Number, default: 0 },
    },
    views: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    trending: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Compound index for trending algorithm
NewsArticleSchema.index({ trending: 1, trendingScore: -1 });

// Text index for search
NewsArticleSchema.index({
    headline: 'text',
    tldr: 'text',
    summary: 'text',
    originalHeadline: 'text'
});

export const NewsArticle = mongoose.model<INewsArticle>('NewsArticle', NewsArticleSchema);

