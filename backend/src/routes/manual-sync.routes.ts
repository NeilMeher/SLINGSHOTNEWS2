import { Router } from 'express';
import { manualSyncController } from '../controllers/manual-sync.controller';

const router = Router();

// Manual sync endpoint (no auth required for testing)
router.post('/sync', (req, res) => manualSyncController.triggerSync(req, res));

export default router;
