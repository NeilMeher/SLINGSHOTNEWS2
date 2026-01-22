import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Token Management
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, username, dateOfBirth]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               username: { type: string }
 *               displayName: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               region: { type: string, enum: [US, UK, CA, AU, IN] }
 *               interests: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user exists
 */
router.post('/signup', authLimiter, authController.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /auth/check-username/{username}:
 *   get:
 *     summary: Check if username is available
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Username availability checked
 */
router.get('/check-username/:username', authController.checkUsername);

/**
 * @swagger
 * /auth/update-password:
 *   post:
 *     summary: Update user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post('/update-password', protect, authController.updatePassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   post:
 *     summary: Verify email with token
 *     tags: [Auth]
 */
router.post('/verify-email/:token', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 */
router.post('/resend-verification', protect, authController.resendVerification);

export default router;
