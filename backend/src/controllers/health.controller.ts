import { Request, Response } from 'express'
import { getDbStatus } from '../config/database'
import { sendResponse } from '../utils/apiResponse'
import { StatusCodes } from '../utils/statusCodes'

export class HealthController {
    public checkHealth = (req: Request, res: Response) => {
        const healthData = {
            timestamp: new Date().toISOString(),
            service: 'slingshot-news-api',
            database: {
                status: getDbStatus(),
                connected: getDbStatus() === 'connected',
            },
        }

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'system is healthy 🚀',
            data: healthData,
        })
    }
}

export const healthController = new HealthController()
