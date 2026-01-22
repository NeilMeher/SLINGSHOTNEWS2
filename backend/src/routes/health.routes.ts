import { Router } from 'express'
import { healthController } from '../controllers/health.controller'

const router = Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check system health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 */
router.get('/health', healthController.checkHealth)

export default router
