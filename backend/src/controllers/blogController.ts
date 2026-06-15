import { Response } from 'express'
import { CustomRequest } from '../types/express'
import {
  createArticle,
  getPublishedArticles,
  getArticleBySlug,
  getArticlesByAuthor,
  updateArticle,
  deleteArticle,
  getArticleCategories,
} from '@services/blogService'
import { body, validationResult } from 'express-validator'

export const validateCreateArticle = [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('summary').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('featuredImageUrl').optional().trim(),
  body('isPublished').optional().isBoolean(),
]

export const createArticleHandler = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { title, content, summary, category, featuredImageUrl, isPublished } = req.body

    const articleId = await createArticle(
      req.user.userId,
      title,
      content,
      summary,
      category,
      featuredImageUrl,
      isPublished
    )

    res.status(201).json({
      message: 'Article created successfully',
      articleId,
    })
  } catch (error) {
    console.error('Create article error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPublishedArticlesHandler = async (_req: CustomRequest, res: Response) => {
  try {
    const { page, limit, category } = _req.query

    const data = await getPublishedArticles(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      category as string | undefined
    )

    res.json(data)
  } catch (error) {
    console.error('Get articles error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getArticleBySlugHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { slug } = req.params

    const article = await getArticleBySlug(slug)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json({ article })
  } catch (error) {
    console.error('Get article error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMyArticles = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const articles = await getArticlesByAuthor(req.user.userId, true)

    res.json({ articles })
  } catch (error) {
    console.error('Get my articles error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateArticleHandler = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { title, content, summary, category, featuredImageUrl, isPublished } = req.body

    await updateArticle(id, title, content, summary, category, featuredImageUrl, isPublished)

    res.json({ message: 'Article updated successfully' })
  } catch (error) {
    console.error('Update article error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteArticleHandler = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    await deleteArticle(id)

    res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Delete article error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCategoriesHandler = async (_req: CustomRequest, res: Response) => {
  try {
    const categories = await getArticleCategories()

    res.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  createArticleHandler,
  getPublishedArticlesHandler,
  getArticleBySlugHandler,
  getMyArticles,
  updateArticleHandler,
  deleteArticleHandler,
  getCategoriesHandler,
}
