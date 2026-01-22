import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { StatusCodes } from '../utils/statusCodes';
import { config } from '../config/env';

/**
 * Development error response: includes full stack trace and error details.
 */
const sendErrorDev = (err: any, res: Response) => {
    res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
        error: {
            statusCode: err.statusCode,
            status: err.status,
            isOperational: err.isOperational,
            details: err.details,
            stack: err.stack,
        }
    });
};

/**
 * Production error response: user-friendly messages, no sensitive details.
 */
const sendErrorProd = (err: any, res: Response) => {
    // 1. Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                statusCode: err.statusCode,
                details: err.details
            }
        });
    }
    // 2. Programming or other unknown error: don't leak error details
    else {
        console.error('🔥 ERROR:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'something went very wrong 💀',
            error: {
                statusCode: 500
            }
        });
    }
};

/**
 * Mongoose validation error handler
 */
const handleValidationErrorDB = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `invalid input data: ${errors.join('. ')} 💀`;
    return new AppError(message, StatusCodes.BAD_REQUEST, errors);
};

/**
 * JWT error handlers
 */
const handleJWTError = () => new AppError('invalid token, please login again 🤡', StatusCodes.UNAUTHORIZED);
const handleJWTExpiredError = () => new AppError('your session has expired, please login again 🕒', StatusCodes.UNAUTHORIZED);

/**
 * Global Error Middleware
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    if (config.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;
        error.stack = err.stack;

        // Specialized Error Handling
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
