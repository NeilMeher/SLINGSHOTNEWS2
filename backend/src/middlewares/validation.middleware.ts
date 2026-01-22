import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 */
export const validate = (schema: z.ZodType<any>, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get data from specified source
            const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

            // Parse and validate
            const validated = await schema.parseAsync(data);

            // Replace request data with validated data
            if (source === 'body') {
                req.body = validated;
            } else if (source === 'query') {
                req.query = validated as any;
            } else {
                req.params = validated as any;
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors into user-friendly messages
                const errors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                return sendError(res, 'validation failed 💀', StatusCodes.BAD_REQUEST, errors);
            }

            // Handle unexpected errors
            return sendError(res, 'validation error', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };
};

/**
 * Validate multiple sources
 * Example: validateMultiple({ body: userSchema, query: paginationSchema })
 */
export const validateMultiple = (schemas: {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    params?: z.ZodType<any>;
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors: Array<{ field: string; message: string }> = [];

            // Validate body
            if (schemas.body) {
                try {
                    req.body = await schemas.body.parseAsync(req.body);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        errors.push(...error.issues.map((issue) => ({
                            field: `body.${issue.path.join('.')}`,
                            message: issue.message
                        })));
                    }
                }
            }

            // Validate query
            if (schemas.query) {
                try {
                    req.query = await schemas.query.parseAsync(req.query) as any;
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        errors.push(...error.issues.map((issue) => ({
                            field: `query.${issue.path.join('.')}`,
                            message: issue.message
                        })));
                    }
                }
            }

            // Validate params
            if (schemas.params) {
                try {
                    req.params = await schemas.params.parseAsync(req.params) as any;
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        errors.push(...error.issues.map((issue) => ({
                            field: `params.${issue.path.join('.')}`,
                            message: issue.message
                        })));
                    }
                }
            }

            // If there are validation errors, return them
            if (errors.length > 0) {
                return sendError(res, 'validation failed 💀', StatusCodes.BAD_REQUEST, errors);
            }

            next();
        } catch (error) {
            return sendError(res, 'validation error', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };
};

/**
 * Sanitize input data
 * Removes potentially dangerous characters
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
    const sanitizeString = (str: string): string => {
        return str
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    };

    const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
};
