import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface ReactionUpdate {
    articleId: string;
    reactions: {
        w: number;
        mid: number;
        cooked: number;
        cap: number;
    };
    total: number;
}

interface ReactionPulse {
    type: 'w' | 'mid' | 'cooked' | 'cap';
    from: string;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    joinArticle: (articleId: string) => void;
    leaveArticle: (articleId: string) => void;
    onReactionUpdate: (callback: (data: ReactionUpdate) => void) => void;
    onReactionPulse: (callback: (data: ReactionPulse) => void) => void;
    sendReactionPulse: (articleId: string, type: string) => void;
}

export const useSocket = (): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reactionUpdateCallbackRef = useRef<((data: ReactionUpdate) => void) | null>(null);
    const reactionPulseCallbackRef = useRef<((data: ReactionPulse) => void) | null>(null);

    useEffect(() => {
        // Get auth token
        const token = localStorage.getItem('token');

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('[socket] connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('[socket] disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[socket] connection error:', error);
        });

        // Listen for reaction updates
        socket.on('reaction:update', (data: ReactionUpdate) => {
            if (reactionUpdateCallbackRef.current) {
                reactionUpdateCallbackRef.current(data);
            }
        });

        // Listen for reaction pulse (real-time emoji burst from other users)
        socket.on('reaction:pulse', (data: ReactionPulse) => {
            if (reactionPulseCallbackRef.current) {
                reactionPulseCallbackRef.current(data);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinArticle = useCallback((articleId: string) => {
        socketRef.current?.emit('article:join', articleId);
    }, []);

    const leaveArticle = useCallback((articleId: string) => {
        socketRef.current?.emit('article:leave', articleId);
    }, []);

    const onReactionUpdate = useCallback((callback: (data: ReactionUpdate) => void) => {
        reactionUpdateCallbackRef.current = callback;
    }, []);

    const onReactionPulse = useCallback((callback: (data: ReactionPulse) => void) => {
        reactionPulseCallbackRef.current = callback;
    }, []);

    const sendReactionPulse = useCallback((articleId: string, type: string) => {
        socketRef.current?.emit('reaction:sent', { articleId, type });
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        joinArticle,
        leaveArticle,
        onReactionUpdate,
        onReactionPulse,
        sendReactionPulse,
    };
};

// Simpler hook for single article real-time reactions
export const useArticleReactions = (
    articleId: string,
    onUpdate: (reactions: ReactionUpdate['reactions']) => void
) => {
    const { joinArticle, leaveArticle, onReactionUpdate } = useSocket();

    useEffect(() => {
        // Join the article room
        joinArticle(articleId);

        // Set up the update handler
        onReactionUpdate((data) => {
            if (data.articleId === articleId) {
                onUpdate(data.reactions);
            }
        });

        // Leave on cleanup
        return () => {
            leaveArticle(articleId);
        };
    }, [articleId, joinArticle, leaveArticle, onReactionUpdate, onUpdate]);
};
