import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /settings/notifications:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Settings]
 */
router.patch('/notifications', settingsController.updateNotifications);

/**
 * @swagger
 * /settings/password:
 *   patch:
 *     summary: Change user password
 *     tags: [Settings]
 */
router.patch('/password', settingsController.changePassword);

/**
 * @swagger
 * /settings/sessions:
 *   get:
 *     summary: Get active login sessions
 *     tags: [Settings]
 */
router.get('/sessions', settingsController.getSessions);

/**
 * @swagger
 * /settings/export-data:
 *   post:
 *     summary: Export all user data
 *     tags: [Settings]
 */
router.post('/export-data', settingsController.exportData);

/**
 * @swagger
 * /settings/account:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Settings]
 */
router.delete('/account', settingsController.deleteAccount);

export default router;
