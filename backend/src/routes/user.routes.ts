import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and preferences management
 */

// Protected: All routes in this file require authentication
router.use(protect);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update complete user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName: { type: string }
 *               bio: { type: string, maxLength: 500 }
 *               phone: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               location:
 *                 type: object
 *                 properties:
 *                   city: { type: string }
 *                   country: { type: string }
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   twitter: { type: string }
 *                   instagram: { type: string }
 *                   website: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/me', userController.updateMe);

/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar: { type: string, description: "URL or base64 of the image" }
 *     responses:
 *       200:
 *         description: Avatar updated
 */
router.patch('/me/avatar', userController.updateAvatar);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile (Legacy)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /users/preferences:
 *   patch:
 *     summary: Update user preferences (Legacy)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch('/preferences', userController.updatePreferences);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list fetched
 */
router.get('/all', authorize(['admin']), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 */
router.put('/:id/role', authorize(['admin']), userController.updateUserRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', authorize(['admin']), userController.deleteUser);

export default router;
