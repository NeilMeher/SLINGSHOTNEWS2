import { Router } from 'express'
import healthRoutes from './health.routes'
import newsRoutes from './news.routes'
import authRoutes from './auth.routes'
import interactionRoutes from './interaction.routes'
import userRoutes from './user.routes'
import onboardingRoutes from './onboarding.routes'
import settingsRoutes from './settings.routes'
import translationRoutes from './translation.routes'
import feedRoutes from './feed.routes'
import reactionRoutes from './reaction.routes'
import bookmarkRoutes from './bookmark.routes'
import manualSyncRoutes from './manual-sync.routes'

const router = Router()

// API Versioning
const API_VERSION = '/v1'

// Register routes
router.use(`${API_VERSION}`, healthRoutes)
router.use(`${API_VERSION}/news`, newsRoutes)
router.use(`${API_VERSION}/auth`, authRoutes)
router.use(`${API_VERSION}/interactions`, interactionRoutes)
router.use(`${API_VERSION}/users`, userRoutes)
router.use(`${API_VERSION}/onboarding`, onboardingRoutes)
router.use(`${API_VERSION}/settings`, settingsRoutes)
router.use(`${API_VERSION}/translate`, translationRoutes)
router.use(`${API_VERSION}/feed`, feedRoutes)
router.use(`${API_VERSION}/articles`, reactionRoutes)
router.use(`${API_VERSION}/bookmarks`, bookmarkRoutes)
router.use(`${API_VERSION}/manual`, manualSyncRoutes)

// Legacy endpoints (backward compatibility)
router.use(`${API_VERSION}/reactions`, interactionRoutes)

export default router


