import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/bookmarks/export:
 *   get:
 *     summary: Export user's bookmarks as JSON
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmarks exported successfully
 */
router.get('/export', protect, bookmarkController.exportBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/count:
 *   get:
 *     summary: Get user's bookmark count
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmark count
 */
router.get('/count', protect, bookmarkController.getBookmarkCount);

/**
 * @swagger
 * /api/v1/bookmarks/check:
 *   post:
 *     summary: Check bookmark status for multiple articles
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleIds
 *             properties:
 *               articleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bookmark status for each article
 */
router.post('/check', protect, bookmarkController.checkBookmarkStatus);

/**
 * @swagger
 * /api/v1/bookmarks:
 *   get:
 *     summary: Get user's saved articles
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [tech, money, world, politics, science, health]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [savedDate, publishedDate]
 *           default: savedDate
 *     responses:
 *       200:
 *         description: List of saved articles with pagination
 */
router.get('/', protect, bookmarkController.getMyBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks:
 *   delete:
 *     summary: Remove all user's bookmarks
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookmarks removed
 */
router.delete('/', protect, bookmarkController.removeAllBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/{articleId}:
 *   delete:
 *     summary: Remove a specific bookmark
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
 *         description: Bookmark removed
 */
router.delete('/:articleId', protect, bookmarkController.removeBookmark);

export default router;
