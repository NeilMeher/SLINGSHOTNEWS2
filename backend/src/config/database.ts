import mongoose from 'mongoose';
import { config } from './env';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const connectDatabase = async () => {
    let retries = 0;

    const attemptConnection = async () => {
        try {
            console.log('⏳ Connecting to MongoDB...');

            // Mongoose global configuration
            mongoose.set('strictQuery', true);

            await mongoose.connect(config.DATABASE_URL, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log('✅ MongoDB Connected successfully');
        } catch (error) {
            retries += 1;
            console.error(`❌ MongoDB connection error (Attempt ${retries}/${MAX_RETRIES}):`, error);

            if (retries < MAX_RETRIES) {
                console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000}s...`);
                setTimeout(attemptConnection, RETRY_INTERVAL);
            } else {
                console.error('💥 Max retries reached. Database connection failed.');
                process.exit(1);
            }
        }
    };

    await attemptConnection();
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('🚨 MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

export const getDbStatus = () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState];
};
