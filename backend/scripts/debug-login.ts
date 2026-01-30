import mongoose from 'mongoose';
import { generateRefreshToken, generateAccessToken } from '../src/utils/jwt';
import { User } from '../src/models/User';
import { RefreshToken } from '../src/models/RefreshToken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const runDebug = async () => {
    console.log('🔍 Debugging Login Process...');

    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('✅ Connected to DB');

        // 1. Test JWT Generation Logic
        console.log('\n--- Testing JWT Generation ---');
        const dummyUserId = new mongoose.Types.ObjectId();

        try {
            const token7d = generateRefreshToken(dummyUserId.toString(), '7d');
            console.log('✅ Generated 7d token:', token7d.substring(0, 20) + '...');
        } catch (e) {
            console.error('❌ Failed to generate 7d token:', e);
        }

        try {
            const token30d = generateRefreshToken(dummyUserId.toString(), '30d');
            console.log('✅ Generated 30d token:', token30d.substring(0, 20) + '...');
        } catch (e) {
            console.error('❌ Failed to generate 30d token:', e);
        }

        // 2. Test DB Save Logic
        console.log('\n--- Testing RefreshToken DB Save ---');
        try {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const rt = await RefreshToken.create({
                userId: dummyUserId,
                token: 'dummy_token_' + Date.now(),
                expiresAt
            });
            console.log('✅ Saved RefreshToken to DB:', rt._id);
        } catch (e) {
            console.error('❌ Failed to save RefreshToken to DB:', e);
        }

        console.log('\n✨ Debugging Complete');
    } catch (err) {
        console.error('❌ Fatal Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
