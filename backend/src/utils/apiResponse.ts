import { Response } from 'express'
import { StatusCode, StatusCodes } from './statusCodes'

interface ApiResponse<T = any> {
    success: boolean
    data: T
    message: string
    error?: any
}

export const sendResponse = <T>(
    res: Response,
    {
        statusCode = StatusCodes.OK,
        success = true,
        data = null as any,
        message = '',
        error = undefined,
    }: {
        statusCode?: StatusCode
        success?: boolean
        data?: T
        message?: string
        error?: any
    },
) => {
    const responsePayload: ApiResponse<T> = {
        success,
        data,
        message,
    }

    if (error) {
        responsePayload.error = error
    }

    return res.status(statusCode).json(responsePayload)
}

export const sendError = (
    res: Response,
    message: string,
    statusCode: StatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    error?: any,
) => {
    return sendResponse(res, {
        success: false,
        statusCode,
        message,
        error,
    })
}
