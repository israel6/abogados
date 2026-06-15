import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  createArticleHandler,
  getPublishedArticlesHandler,
  getArticleBySlugHandler,
  getMyArticles,
  updateArticleHandler,
  deleteArticleHandler,
  getCategoriesHandler,
  validateCreateArticle,
} from '@controllers/blogController'

const router = Router()

// Public routes
router.get('/categories', getCategoriesHandler)
router.get('/articles', getPublishedArticlesHandler)
router.get('/articles/:slug', getArticleBySlugHandler)

// Protected routes
router.post('/articles', authMiddleware, validateCreateArticle, createArticleHandler)
router.get('/my-articles', authMiddleware, getMyArticles)
router.put('/articles/:id', authMiddleware, updateArticleHandler)
router.delete('/articles/:id', authMiddleware, deleteArticleHandler)

export default router
