import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });
dotenv.config({ path: defaultEnvPath });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid MongoDB connection string" }),
    JWT_SECRET: z.string().min(8, { message: "JWT_SECRET must be at least 8 characters long" }),
    JWT_REFRESH_SECRET: z.string().min(8, { message: "JWT_REFRESH_SECRET must be at least 8 characters long" }),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    // News APIs
    REUTERS_API_KEY: z.string().optional(),
    AP_NEWS_API_KEY: z.string().optional(),
    BBC_API_KEY: z.string().optional(),
    NEWS_API_KEY: z.string().min(1, { message: "NEWS_API_KEY is required for news aggregation" }),

    // AI Translation
    GROQ_API_KEY: z.string().min(1, { message: "GROQ_API_KEY is required for AI translation" }),
    GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        result.error.issues.forEach((issue) => {
            console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        });
        process.exit(1);
    }

    return result.data;
};

export const config = validateEnv();
