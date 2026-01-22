import { Router } from 'express';
import { feedController } from '../controllers/feed.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /feed/home:
 *   get:
 *     summary: Personalized home feed
 *     tags: [Feed]
 */
router.get('/home', protect, feedController.getHome);

/**
 * @swagger
 * /feed/trending:
 *   get:
 *     summary: Global trending feed
 *     tags: [Feed]
 */
router.get('/trending', optionalAuth, feedController.getTrending);

/**
 * @swagger
 * /feed/category/{category}:
 *   get:
 *     summary: Category-specific feed
 *     tags: [Feed]
 */
router.get('/category/:category', optionalAuth, feedController.getCategory);

export default router;
