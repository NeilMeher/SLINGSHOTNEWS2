import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendResponse } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export class UserController {
    /**
     * Get current user profile (Self)
     */
    public getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = await User.findById(req.user?.id);
        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'your profile fetched ✨',
            data: user,
        });
    });

    /**
     * Alias for getMe (Legacy)
     */
    public getProfile = this.getMe;

    /**
     * Update current user profile
     */
    public updateMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { displayName, bio, phone, location, dateOfBirth, socialLinks } = req.body;

        // Validation: Phone (Simple check)
        if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
            return next(new AppError('invalid phone format 📱', StatusCodes.BAD_REQUEST));
        }

        // Validation: Age (13+)
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const age = new Date().getFullYear() - dob.getFullYear();
            if (age < 13) {
                return next(new AppError('you must be at least 13 years old 💀', StatusCodes.BAD_REQUEST));
            }
        }

        // Validation: Social Links (URL check)
        if (socialLinks) {
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            for (const [key, value] of Object.entries(socialLinks)) {
                if (value && typeof value === 'string' && !urlRegex.test(value)) {
                    return next(new AppError(`invalid URL for ${key} 🔗`, StatusCodes.BAD_REQUEST));
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { displayName, bio, phone, location, dateOfBirth, socialLinks },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'profile updated successfully! 🔥',
            data: user,
        });
    });

    /**
     * Update user avatar
     */
    public updateAvatar = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { avatar } = req.body;

        if (!avatar) {
            return next(new AppError('avatar URL or base64 required 🖼️', StatusCodes.BAD_REQUEST));
        }

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { avatar },
            { new: true }
        );

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'avatar updated! 💅',
            data: { avatar: user.avatar },
        });
    });

    /**
     * Admin only: Update user role
     */
    public updateUserRole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return next(new AppError('invalid role 💀', StatusCodes.BAD_REQUEST));
        }

        // Prevent last admin from being demoted
        if (role === 'user') {
            const targetUser = await User.findById(id);
            if (targetUser?.role === 'admin') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return next(new AppError('cannot demote the last admin 🛑', StatusCodes.BAD_REQUEST));
                }
            }
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: `user role updated to ${role} 🛡️`,
            data: { id: user._id, role: user.role }
        });
    });

    /**
     * Admin only: Delete user
     */
    public deleteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        // Prevent self-deletion of last admin
        const targetUser = await User.findById(id);
        if (targetUser?.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return next(new AppError('cannot delete the last admin 💀', StatusCodes.BAD_REQUEST));
            }
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'user deleted successfully 🗑️'
        });
    });

    /**
     * Admin only: Get all users
     */
    public getAllUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const users = await User.find().select('-password');
        return sendResponse(res, {
            message: 'users list fetched (admin only) 🛡️',
            data: users,
        });
    });

    /**
     * Legacy method for preferences (Deprecated by updateMe but kept for compatibility)
     */
    public updatePreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { interests, region, displayName } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { interests, region, displayName },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        return sendResponse(res, {
            message: 'preferences updated successfully! 🔥',
            data: user,
        });
    });
}

export const userController = new UserController();
