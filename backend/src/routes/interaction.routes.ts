import { Router } from 'express';
import { reactionController } from '../controllers/reaction.controller';
import { bookmarkController } from '../controllers/bookmark.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Legacy reaction endpoint (for backward compatibility)
router.post('/react', protect, reactionController.toggleReaction);

// Bookmark endpoints
router.post('/bookmark', protect, bookmarkController.toggleBookmark);
router.get('/bookmarks', protect, bookmarkController.getMyBookmarks);

export default router;

