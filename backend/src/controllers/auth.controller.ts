import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../utils/jwt';
import { sendResponse } from '../utils/apiResponse';
import { StatusCodes } from '../utils/statusCodes';
import { asyncHandler } from '../utils/asyncHandler';
import { validatePassword } from '../utils/passwordValidator';
import { AppError } from '../utils/AppError';
import { emailService } from '../services/emailService';
import crypto from 'crypto';

export class AuthController {
    public signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, username, displayName, dateOfBirth, region, interests } = req.body;

        // Password Strength Check
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return next(new AppError(passwordCheck.message || 'invalid password', StatusCodes.BAD_REQUEST));
        }

        // Check uniqueness
        const userExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (userExists) {
            return next(new AppError('email or username already taken 💀', StatusCodes.BAD_REQUEST));
        }

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            email,
            password,
            username,
            displayName,
            dateOfBirth,
            region,
            interests,
            onboardingCompleted: false,
            onboardingStep: 1,
            emailVerified: false,
            verificationToken,
            verificationExpires
        });

        // Send Email (Don't await to avoid blocking response)
        emailService.sendVerificationEmail(user.email, verificationToken, user.username);

        const accessToken = generateAccessToken(user._id.toString());
        const refreshTokenValue = generateRefreshToken(user._id.toString());

        // Store refresh token
        await RefreshToken.create({
            userId: user._id,
            token: refreshTokenValue,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return sendResponse(res, {
            message: 'signup successful! welcome to the feed 🚀',
            statusCode: StatusCodes.CREATED,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    region: user.region
                },
                tokens: {
                    accessToken,
                    refreshToken: refreshTokenValue
                }
            }
        });
    });

    public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, rememberMe } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !user.isActive) {
            return next(new AppError('invalid credentials or account inactive 💀', StatusCodes.UNAUTHORIZED));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new AppError('invalid credentials 🤡', StatusCodes.UNAUTHORIZED));
        }

        // Update stats
        user.lastLogin = new Date();
        await user.save();

        // Token Expiry: 30 days if rememberMe, else 7 days
        const expiryDays = rememberMe ? 30 : 7;
        const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

        const accessToken = generateAccessToken(user._id.toString());
        // Pass string like '30d' or '7d'
        const refreshTokenValue = generateRefreshToken(user._id.toString(), `${expiryDays}d`);

        // Save session
        await RefreshToken.create({
            userId: user._id,
            token: refreshTokenValue,
            expiresAt
        });

        return sendResponse(res, {
            message: 'logged in successfully! 🔥',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username
                },
                tokens: {
                    accessToken,
                    refreshToken: refreshTokenValue
                }
            }
        });
    });

    public updatePassword = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(new AppError('current password is wrong 🤡', StatusCodes.UNAUTHORIZED));
        }

        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.isValid) {
            return next(new AppError(passwordCheck.message || 'invalid new password', StatusCodes.BAD_REQUEST));
        }

        user.password = newPassword;
        await user.save();

        return sendResponse(res, {
            message: 'password updated successfully! 🔒',
        });
    });

    public refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new AppError('refresh token required 💀', StatusCodes.BAD_REQUEST));
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken, isValid: true });
        if (!storedToken) {
            return next(new AppError('invalid or expired refresh token 🛑', StatusCodes.UNAUTHORIZED));
        }

        try {
            const decoded = verifyRefreshToken(refreshToken) as any;
            const newAccessToken = generateAccessToken(decoded.id);

            return sendResponse(res, {
                message: 'token refreshed ✨',
                data: { accessToken: newAccessToken }
            });
        } catch (err) {
            return next(new AppError('session expired, please login again 💀', StatusCodes.UNAUTHORIZED));
        }
    });

    public checkUsername = asyncHandler(async (req: Request, res: Response) => {
        const { username } = req.params as { username: string };
        const user = await User.findOne({ username: username.toLowerCase() });

        return sendResponse(res, {
            message: 'username check complete',
            data: { available: !user }
        });
    });

    public logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        return sendResponse(res, { message: 'logged out successfully 👋' });
    });

    public verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: new Date() }
        }).select('+verificationToken +verificationExpires');

        if (!user) {
            return next(new AppError('invalid or expired verification token 💀', StatusCodes.BAD_REQUEST));
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        return sendResponse(res, {
            message: 'email verified successfully! you are now officially lit 🔥',
            data: { emailVerified: true }
        });
    });

    public resendVerification = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('user not found 💀', StatusCodes.NOT_FOUND));
        }

        if (user.emailVerified) {
            return next(new AppError('email already verified 🤡', StatusCodes.BAD_REQUEST));
        }

        // Rate limit: 1 minute
        if (user.lastVerificationSent && (Date.now() - user.lastVerificationSent.getTime() < 60000)) {
            const waitTime = Math.ceil((60000 - (Date.now() - user.lastVerificationSent.getTime())) / 1000);
            return next(new AppError(`please wait ${waitTime}s before requesting a new link 🛑`, StatusCodes.TOO_MANY_REQUESTS));
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.verificationToken = verificationToken;
        user.verificationExpires = verificationExpires;
        user.lastVerificationSent = new Date();
        await user.save();

        emailService.sendVerificationEmail(user.email, verificationToken, user.username);

        return sendResponse(res, {
            message: 'verification email resent! check your inbox 📧'
        });
    });
}

export const authController = new AuthController();
