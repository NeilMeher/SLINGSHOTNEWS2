import { Router } from 'express';
import { onboardingController } from '../controllers/onboarding.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: User onboarding flow
 */

// All onboarding routes require authentication
router.use(protect);

/**
 * @swagger
 * /onboarding/username:
 *   post:
 *     summary: Step 1 - Set unique username
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 20 }
 *     responses:
 *       200:
 *         description: Username set
 *       400:
 *         description: Validation error or username taken
 */
router.post('/username', onboardingController.setUsername);

/**
 * @swagger
 * /onboarding/interests:
 *   post:
 *     summary: Step 1 - Set user interests
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [interests]
 *             properties:
 *               interests: { type: array, items: { type: string }, minItems: 1, maxItems: 6 }
 *     responses:
 *       200:
 *         description: Interests updated
 *       400:
 *         description: Validation error
 */
router.post('/interests', onboardingController.setInterests);

/**
 * @swagger
 * /onboarding/region:
 *   post:
 *     summary: Step 2 - Set user region
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [region]
 *             properties:
 *               region: { type: string, enum: [US, UK, CA, AU, IN] }
 *     responses:
 *       200:
 *         description: Region updated and onboarding completed
 *       400:
 *         description: Validation error
 */
router.post('/region', onboardingController.setRegion);

/**
 * @swagger
 * /onboarding/status:
 *   get:
 *     summary: Get onboarding progress
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status fetched
 */
router.get('/status', onboardingController.getStatus);

export default router;
