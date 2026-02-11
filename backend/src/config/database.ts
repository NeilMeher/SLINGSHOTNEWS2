import mongoose from 'mongoose';
import { config } from './env';

let mongoServer: any = null;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const connectDatabase = async () => {
    let retries = 0;

    const attemptConnection = async () => {
        try {
            console.log('⏳ Connecting to MongoDB...');

            // Mongoose global configuration
            mongoose.set('strictQuery', true);

            let connectionUri = config.DATABASE_URL;
            let connectionOptions: any = {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
            };

            // Use MongoDB Memory Server if in development and using localhost
            if (config.NODE_ENV === 'development' && connectionUri.includes('localhost')) {
                console.log('🧪 Starting MongoDB Memory Server for development...');

                if (!mongoServer) {
                    const { MongoMemoryServer } = await import('mongodb-memory-server');
                    mongoServer = await MongoMemoryServer.create({
                        instance: {
                            dbName: 'slingshot_news',
                        },
                    });
                }

                connectionUri = mongoServer.getUri();
                console.log(`📍 Memory Server running at: ${connectionUri}`);
            } else {
                // For production/cloud MongoDB
                connectionOptions = {
                    ...connectionOptions,
                    retryWrites: true,
                    w: 'majority',
                };
            }

            await mongoose.connect(connectionUri, connectionOptions);

            console.log('✅ MongoDB Connected successfully');
            if (mongoose.connection.db) {
                console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
            }
            retries = 0; // Reset retries on successful connection
        } catch (error) {
            retries += 1;
            const err = error as any;
            console.error(`❌ MongoDB connection error (Attempt ${retries}/${MAX_RETRIES}):`);
            console.error(`   Error: ${err.message || err}`);

            if (err.message?.includes('IP') || err.message?.includes('whitelist')) {
                console.error('');
                console.error('⚠️  NETWORK ACCESS ISSUE DETECTED');
                console.error('📝 Please whitelist your IP address in MongoDB Atlas:');
                console.error('   1. Go to https://cloud.mongodb.com/');
                console.error('   2. Navigate to Network Access');
                console.error('   3. Click "Add IP Address"');
                console.error('   4. Add your current IP or allow 0.0.0.0/0 for testing');
                console.error('');
            }

            if (retries < MAX_RETRIES) {
                console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000}s...`);
                setTimeout(attemptConnection, RETRY_INTERVAL);
            } else {
                console.error('');
                console.error('💥 Max retries reached. Continuing without database...');
                console.error('⚠️  API will run in limited mode');
                console.error('📖 See MONGODB_FIX.md for help');
                console.error('');
                // Don't exit, let the server run in degraded mode
            }
        }
    };

    attemptConnection();
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('🚨 MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

// Graceful shutdown - stop memory server
export const disconnectDatabase = async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
            console.log('🛑 MongoDB Memory Server stopped');
        }
    } catch (err) {
        console.error('❌ Error during database shutdown:', err);
    }
};

export const getDbStatus = () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState];
};
