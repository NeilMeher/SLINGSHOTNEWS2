import { Router, Request, Response } from 'express';
import { manualSyncController } from '../controllers/manual-sync.controller';

const router = Router();

// Manual sync endpoint (no auth required for testing)
router.post('/sync', (req: Request, res: Response) => manualSyncController.triggerSync(req, res));

export default router;
