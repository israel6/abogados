import client from './api'

export interface Article {
  ArticleId: string
  AuthorId: string
  Title: string
  Slug: string
  Content: string
  Summary: string
  Category: string
  FeaturedImageUrl: string | null
  IsPublished: boolean
  ViewCount: number
  PublishedAt: string | null
  CreatedAt: string
  UpdatedAt: string
}

export interface CreateArticleData {
  title: string
  content: string
  summary: string
  category: string
  featuredImageUrl?: string
  isPublished?: boolean
}

export const blogService = {
  getArticles: async (page?: number, limit?: number, category?: string) => {
    const params: Record<string, any> = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    if (category) params.category = category

    const response = await client.get('/blog/articles', { params })
    return response.data
  },

  getArticleBySlug: async (slug: string): Promise<{ article: Article }> => {
    const response = await client.get(`/blog/articles/${slug}`)
    return response.data
  },

  getMyArticles: async (): Promise<{ articles: Article[] }> => {
    const response = await client.get('/blog/my-articles')
    return response.data
  },

  createArticle: async (data: CreateArticleData): Promise<{ articleId: string }> => {
    const response = await client.post('/blog/articles', data)
    return response.data
  },

  updateArticle: async (
    articleId: string,
    data: Partial<CreateArticleData>
  ): Promise<{ message: string }> => {
    const response = await client.put(`/blog/articles/${articleId}`, data)
    return response.data
  },

  deleteArticle: async (articleId: string): Promise<{ message: string }> => {
    const response = await client.delete(`/blog/articles/${articleId}`)
    return response.data
  },

  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await client.get('/blog/categories')
    return response.data
  },
}

export default blogService
