import { Router } from 'express';
import { reactionController } from '../controllers/reaction.controller';
import { bookmarkController } from '../controllers/bookmark.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/articles/leaderboard:
 *   get:
 *     summary: Get reaction leaderboard (most W'd articles)
 *     tags: [Reactions]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Leaderboard of articles by W reactions
 */
router.get('/leaderboard', reactionController.getLeaderboard);

/**
 * @swagger
 * /api/v1/articles/{articleId}/react:
 *   post:
 *     summary: Toggle reaction on an article
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [w, mid, cooked, cap]
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 */
router.post('/:articleId/react', protect, reactionController.toggleReaction);

/**
 * @swagger
 * /api/v1/articles/{articleId}/react:
 *   delete:
 *     summary: Remove user's reaction from an article
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 */
router.delete('/:articleId/react', protect, reactionController.removeReaction);

/**
 * @swagger
 * /api/v1/articles/{articleId}/reactions:
 *   get:
 *     summary: Get reaction breakdown for an article
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reaction counts and user's reaction
 */
router.get('/:articleId/reactions', optionalAuth, reactionController.getReactions);

/**
 * @swagger
 * /api/v1/articles/{articleId}/bookmark:
 *   post:
 *     summary: Toggle bookmark on an article
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully
 */
router.post('/:articleId/bookmark', protect, bookmarkController.toggleBookmark);

export default router;


