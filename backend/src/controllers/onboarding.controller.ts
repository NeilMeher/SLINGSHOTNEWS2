import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendResponse } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export class OnboardingController {
    /**
     * Step 1: Set unique username
     */
    public setUsername = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { username } = req.body;

        if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)) {
            return next(new AppError('invalid username format 💀', StatusCodes.BAD_REQUEST));
        }

        const userExists = await User.findOne({ username: username.toLowerCase() });
        if (userExists) {
            return next(new AppError('username already taken 🛑', StatusCodes.BAD_REQUEST));
        }

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            {
                username: username.toLowerCase(),
                onboardingStep: 2
            },
            { new: true }
        );

        return sendResponse(res, {
            message: 'username set! 🔥',
            data: {
                username: user?.username,
                onboardingStep: user?.onboardingStep
            }
        });
    });

    /**
     * Step 2: Set interests
     */
    public setInterests = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { interests } = req.body;

        if (!Array.isArray(interests) || interests.length < 1 || interests.length > 6) {
            return next(new AppError('pick between 1 and 6 interests 💀', StatusCodes.BAD_REQUEST));
        }

        const validCategories = ['tech', 'money', 'world', 'politics', 'science', 'health'];
        const isValid = interests.every(cat => validCategories.includes(cat));

        if (!isValid) {
            return next(new AppError('one or more categories are invalid 🤡', StatusCodes.BAD_REQUEST));
        }

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            {
                interests,
                onboardingStep: 3
            },
            { new: true }
        );

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'interests locked in! 🔥',
            data: {
                interests: user.interests,
                onboardingStep: user.onboardingStep
            }
        });
    });

    /**
     * Step 2: Set region
     */
    public setRegion = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { region } = req.body;

        const validRegions = ['US', 'UK', 'CA', 'AU', 'IN'];
        if (!validRegions.includes(region)) {
            return next(new AppError('invalid region code 🛑', StatusCodes.BAD_REQUEST));
        }

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            {
                region,
                onboardingStep: 4,
                onboardingCompleted: true
            },
            { new: true }
        );

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'onboarding complete! welcome to slingshot news 🚀',
            data: {
                region: user.region,
                onboardingStep: user.onboardingStep,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    });

    /**
     * Get onboarding status
     */
    public getStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = await User.findById(req.user?.id).select('onboardingCompleted onboardingStep interests region');

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'onboarding status fetched ✨',
            data: {
                completed: user.onboardingCompleted,
                step: user.onboardingStep,
                interests: user.interests,
                region: user.region
            }
        });
    });
}

export const onboardingController = new OnboardingController();
