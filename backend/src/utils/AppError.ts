import { StatusCode } from './statusCodes';

export class AppError extends Error {
    public statusCode: StatusCode;
    public status: string;
    public isOperational: boolean;
    public details?: any;

    constructor(message: string, statusCode: StatusCode, details?: any) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}
