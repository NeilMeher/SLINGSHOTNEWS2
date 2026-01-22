import { Request, Response } from 'express';
import { translationService } from '../services/translation.service';
import { sendResponse, sendError } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';

export class TranslationController {
    /**
     * Translate a single article by ID
     */
    public translateArticle = asyncHandler(async (req: Request, res: Response) => {
        const { articleId } = req.body;
        if (!articleId) {
            return sendError(res, 'articleId is required 💀', StatusCodes.BAD_REQUEST);
        }

        const result = await translationService.translateArticle(articleId);
        return sendResponse(res, {
            message: 'article glowed up successfully ✨',
            data: result
        });
    });

    /**
     * Batch translate multiple articles by IDs
     */
    public batchTranslate = asyncHandler(async (req: Request, res: Response) => {
        const { articleIds } = req.body;
        if (!articleIds || !Array.isArray(articleIds)) {
            return sendError(res, 'articleIds array is required 🤡', StatusCodes.BAD_REQUEST);
        }

        const result = await translationService.batchTranslate(articleIds);
        return sendResponse(res, {
            message: `batch translation complete! ${result.length} articles updated 🔥`,
            data: {
                processed: result.length,
                articles: result
            }
        });
    });
}

export const translationController = new TranslationController();
