import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendResponse } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';

export class SettingsController {
    /**
     * Update notification preferences
     */
    public updateNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { email, push, frequency } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { notificationPreferences: { email, push, frequency } },
            { new: true }
        );

        return sendResponse(res, {
            message: 'notifications updated! 🔔',
            data: user?.notificationPreferences
        });
    });

    /**
     * Change password
     */
    public changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user?.id).select('+password');
        if (!user) return next(new AppError('user not found', StatusCodes.NOT_FOUND));

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return next(new AppError('incorrect current password 🔒', StatusCodes.BAD_REQUEST));

        user.password = newPassword;
        await user.save();

        return sendResponse(res, {
            message: 'password changed successfully! 🔑'
        });
    });

    /**
     * Get active sessions
     */
    public getSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await User.findById(req.user?.id).select('sessions');
        return sendResponse(res, {
            message: 'active sessions fetched 📱',
            data: user?.sessions || []
        });
    });

    /**
     * Export account data
     */
    public exportData = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await User.findById(req.user?.id);
        // In a real app, this might generate a JSON/PDF and return a link
        return sendResponse(res, {
            message: 'data export initiated! 📦 check your email soon.',
            data: {
                exportedAt: new Date(),
                format: 'JSON'
            }
        });
    });

    /**
     * Delete account (Self)
     */
    public deleteAccount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.user as any;

        // Prevent deleting last admin (already handled in user controller but good to have here)
        const targetUser = await User.findById(id);
        if (targetUser?.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return next(new AppError('cannot delete the last admin 💀', StatusCodes.BAD_REQUEST));
            }
        }

        await User.findByIdAndDelete(id);

        return sendResponse(res, {
            message: 'account deleted permanently. we will miss you 😭'
        });
    });
}

export const settingsController = new SettingsController();
