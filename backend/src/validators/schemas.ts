import { z } from 'zod';

/**
 * Validation schemas for Slingshot News
 * Using Zod for runtime type validation
 */

// User Registration Schema
export const userRegistrationSchema = z.object({
    email: z.string()
        .email('invalid email address')
        .min(5, 'email must be at least 5 characters')
        .max(255, 'email too long'),
    password: z.string()
        .min(8, 'password must be at least 8 characters')
        .max(128, 'password too long')
        .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'password must contain at least one special character'),
    username: z.string()
        .min(3, 'username must be at least 3 characters')
        .max(30, 'username too long')
        .regex(/^[a-zA-Z0-9_]+$/, 'username can only contain letters, numbers, and underscores'),
    dateOfBirth: z.string()
        .refine((date) => {
            const birthDate = new Date(date);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            return age >= 13;
        }, 'you must be at least 13 years old')
});

// User Login Schema
export const userLoginSchema = z.object({
    email: z.string().email('invalid email address'),
    password: z.string().min(1, 'password is required')
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
    displayName: z.string()
        .min(2, 'display name must be at least 2 characters')
        .max(50, 'display name too long')
        .optional(),
    bio: z.string()
        .max(500, 'bio must be 500 characters or less')
        .optional(),
    phone: z.string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'invalid phone number format')
        .optional()
        .or(z.literal('')),
    location: z.object({
        city: z.string().max(100, 'city name too long').optional(),
        country: z.string().max(100, 'country name too long').optional()
    }).optional(),
    socialLinks: z.object({
        twitter: z.string().url('invalid twitter URL').optional().or(z.literal('')),
        instagram: z.string().url('invalid instagram URL').optional().or(z.literal('')),
        website: z.string().url('invalid website URL').optional().or(z.literal(''))
    }).optional()
});

// Onboarding Schema
export const onboardingSchema = z.object({
    interests: z.array(z.enum(['tech', 'money', 'world', 'politics', 'science', 'health']))
        .min(1, 'select at least one interest')
        .max(6, 'you can select up to 6 interests'),
    region: z.enum(['US', 'UK', 'EU', 'ASIA', 'OTHER'])
});

// News Article Creation Schema (for admin)
export const newsArticleSchema = z.object({
    sourceId: z.string().min(1, 'source ID is required'),
    source: z.string().min(1, 'source is required').max(100, 'source name too long'),
    sourceUrl: z.string().url('invalid source URL'),
    category: z.enum(['tech', 'money', 'world', 'politics', 'science', 'health']),
    region: z.string().min(2, 'region is required').max(10, 'region code too long'),
    originalHeadline: z.string().min(10, 'headline must be at least 10 characters').max(500, 'headline too long'),
    originalSummary: z.string().min(20, 'summary must be at least 20 characters').max(5000, 'summary too long'),
    headline: z.string().min(10, 'headline must be at least 10 characters').max(300, 'headline too long').optional(),
    summary: z.array(z.string()).min(3, 'summary must have at least 3 points').max(6, 'summary can have at most 6 points').optional(),
    tldr: z.string().min(20, 'TLDR must be at least 20 characters').max(500, 'TLDR too long').optional(),
    emoji: z.string().max(10, 'emoji too long').optional(),
    imageUrl: z.string().url('invalid image URL').optional(),
    publishedAt: z.string().or(z.date())
});

// Reaction Schema
export const reactionSchema = z.object({
    type: z.enum(['w', 'mid', 'cooked', 'cap'])
});

// Comment Schema (if you add comments later)
export const commentSchema = z.object({
    content: z.string()
        .min(1, 'comment cannot be empty')
        .max(1000, 'comment must be 1000 characters or less'),
    articleId: z.string().min(1, 'article ID is required')
});

// Search Query Schema
export const searchQuerySchema = z.object({
    q: z.string()
        .min(2, 'search query must be at least 2 characters')
        .max(200, 'search query too long'),
    category: z.enum(['all', 'tech', 'money', 'world', 'politics', 'science', 'health']).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100, 'limit cannot exceed 100').optional()
});

// Feed Query Schema
export const feedQuerySchema = z.object({
    category: z.enum(['all', 'tech', 'money', 'world', 'politics', 'science', 'health', 'general']).optional(),
    region: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.number().int().positive().max(50, 'limit cannot exceed 50').optional(),
    sort: z.enum(['publishedAt', 'views', 'bookmarks', 'createdAt', 'trendingScore']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    minViews: z.number().int().nonnegative().optional(),
    minBookmarks: z.number().int().nonnegative().optional()
});

// Password Change Schema
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'current password is required'),
    newPassword: z.string()
        .min(8, 'new password must be at least 8 characters')
        .max(128, 'new password too long')
        .regex(/[A-Z]/, 'new password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'new password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'new password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'new password must contain at least one special character')
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'new password must be different from current password',
    path: ['newPassword']
});

// Type exports for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
export type NewsArticleData = z.infer<typeof newsArticleSchema>;
export type ReactionData = z.infer<typeof reactionSchema>;
export type CommentData = z.infer<typeof commentSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
