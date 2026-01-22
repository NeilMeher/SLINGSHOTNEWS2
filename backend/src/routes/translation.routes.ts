import { Router } from 'express';
import { translationController } from '../controllers/translation.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only admins can trigger manual AI translations
router.use(protect, authorize(['admin']));

/**
 * @swagger
 * /translate/article:
 *   post:
 *     summary: Translate single article to Gen Z style
 *     tags: [Translation]
 */
router.post('/article', translationController.translateArticle);

/**
 * @swagger
 * /translate/batch:
 *   post:
 *     summary: Batch translate multiple articles
 *     tags: [Translation]
 */
router.post('/batch', translationController.batchTranslate);

export default router;
