import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

export const setupSocketIO = (httpServer: HttpServer): SocketServer => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use(async (socket: Socket, next: (err?: Error) => void) => {
        const token = socket.handshake.auth.token;

        if (token) {
            try {
                const decoded = verifyAccessToken(token) as { id: string };
                socket.data.userId = decoded.id;
            } catch (error) {
                // Allow anonymous connections for public feeds
                socket.data.userId = null;
            }
        } else {
            socket.data.userId = null;
        }
        next();
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[socket] client connected: ${socket.id}`);

        // Join article room for real-time reaction updates
        socket.on('article:join', (articleId: string) => {
            socket.join(`article:${articleId}`);
            console.log(`[socket] ${socket.id} joined article:${articleId}`);
        });

        // Leave article room
        socket.on('article:leave', (articleId: string) => {
            socket.leave(`article:${articleId}`);
            console.log(`[socket] ${socket.id} left article:${articleId}`);
        });

        // Join feed room for live updates
        socket.on('feed:join', (feedType: string) => {
            socket.join(`feed:${feedType}`);
            console.log(`[socket] ${socket.id} joined feed:${feedType}`);
        });

        // Leave feed room
        socket.on('feed:leave', (feedType: string) => {
            socket.leave(`feed:${feedType}`);
        });

        // Reaction notification (from user to server)
        socket.on('reaction:sent', (data: { articleId: string; type: string }) => {
            // Broadcast to others in the article room
            socket.to(`article:${data.articleId}`).emit('reaction:pulse', {
                type: data.type,
                from: socket.data.userId || 'anon'
            });
        });

        // Disconnect
        socket.on('disconnect', (reason: string) => {
            console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
};

// Helper to emit reaction updates
export const emitReactionUpdate = (
    io: SocketServer,
    articleId: string,
    reactions: { w: number; mid: number; cooked: number; cap: number }
): void => {
    io.to(`article:${articleId}`).emit('reaction:update', {
        articleId,
        reactions,
        total: reactions.w + reactions.mid + reactions.cooked + reactions.cap
    });
};

// Helper to emit trending article updates
export const emitTrendingUpdate = (
    io: SocketServer,
    articles: unknown[]
): void => {
    io.to('feed:trending').emit('trending:update', {
        articles,
        timestamp: new Date().toISOString()
    });
};


