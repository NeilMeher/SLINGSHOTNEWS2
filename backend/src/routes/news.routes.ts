import { Router } from 'express';
import { newsController } from '../controllers/news.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: News feed and article retrieval
 */

router.get('/search', newsController.searchArticles);
router.get('/feed', newsController.getFeed);
router.get('/trending', newsController.getTrendingFeed);
router.get('/unlimited', newsController.getUnlimitedFeed); // ✨ UNLIMITED FEED - NO RATE LIMITS!
router.get('/sources', newsController.getSources);

router.post('/sync', protect, authorize(['admin']), newsController.syncNews);

router.get('/:id', newsController.getArticle);
router.post('/:id/view', newsController.trackView);

export default router;

