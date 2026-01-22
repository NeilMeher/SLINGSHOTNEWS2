import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { StatusCodes } from '../utils/statusCodes';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        [key: string]: any;
    };
}

/**
 * Protects routes by verifying the JWT access token in the Authorization header.
 * Attaches the decoded user info to the request object.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('not authorized, no token found 💀', StatusCodes.UNAUTHORIZED));
    }

    try {
        const decoded = verifyAccessToken(token) as { id: string };
        const user = await User.findById(decoded.id).select('role isActive');

        if (!user) {
            return next(new AppError('user no longer exists 🛑', StatusCodes.UNAUTHORIZED));
        }

        if (!user.isActive) {
            return next(new AppError('account is deactivated 🔒', StatusCodes.FORBIDDEN));
        }

        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('session expired, please refresh token 🕒', StatusCodes.UNAUTHORIZED));
        }
        return next(new AppError('not authorized, invalid token 🤡', StatusCodes.UNAUTHORIZED));
    }
};

/**
 * Higher-order middleware for role-based access control.
 * @param roles Array of allowed roles (e.g., ['admin'])
 */
export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('authentication required 💀', StatusCodes.UNAUTHORIZED));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(`access denied: ${req.user.role} role is not allowed 🛑`, StatusCodes.FORBIDDEN));
        }

        next();
    };
};

/**
 * Optional authentication: Decodes token if present, but doesn't block if missing.
 * Useful for public feeds that can be enriched if user is logged in.
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = verifyAccessToken(token) as { id: string };
        const user = await User.findById(decoded.id).select('role isActive');

        if (user && user.isActive) {
            req.user = {
                id: user._id.toString(),
                role: user.role
            };
        }
    } catch (error) {
        // Silently fail auth for optional routes
    }

    next();
};
