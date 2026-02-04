import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config/env';
import { connectDatabase, getDbStatus } from './config/database';
import apiRoutes from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';
import { StatusCodes } from './utils/statusCodes';
import { trendingService } from './services/trendingService';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { startNewsSyncJob } from './jobs/newsSync.job';
import { startTranslationJob } from './jobs/translation.job';
import { startTrendingUpdateJob } from './jobs/trending.job';
import { setupSocketIO } from './config/socket';

const app = express();
const PORT = config.PORT;

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Setup Socket.io
const io = setupSocketIO(httpServer);

// Attach io to app for access in controllers
app.set('io', io);

// Connect to Database
connectDatabase();

// Start Background Jobs
startNewsSyncJob();
startTranslationJob();
startTrendingUpdateJob();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRoutes);

// Root route (simple landing)
app.get('/', (req: Request, res: Response) => {
    res.send('slingshot news api is running 🚀');
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`${req.originalUrl} not found 💀`, StatusCodes.NOT_FOUND));
});

// Global Error Handler
app.use(globalErrorHandler);

// Export app for Vercel
export default app;

let server: any;

// Only listen if not running on Vercel (Vercel handles the server automatically)
if (process.env.NODE_ENV !== 'production') {
    server = httpServer.listen(PORT, () => {
        console.log(`[server]: server is running at http://localhost:${PORT}`);
        console.log(`[socket]: socket.io is ready for connections`);
    });
}


// Graceful Shutdown
const shutdown = async () => {
    console.log('\n🛑 Shutdown signal received. Closing server and database...');

    // Close Socket.io connections
    io.close(() => {
        console.log('🔌 Socket.io connections closed.');
    });

    const closeDatabase = async () => {
        try {
            const { disconnectDatabase } = await import('./config/database');
            await disconnectDatabase();
            console.log('💾 Database connection closed.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error during shutdown:', err);
            process.exit(1);
        }
    };

    if (server) {
        server.close(async () => {
            console.log('📡 HTTP server closed.');
            await closeDatabase();
        });
    } else {
        await closeDatabase();
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


