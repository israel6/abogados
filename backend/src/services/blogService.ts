import { executeQuery } from '@config/database'

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

export const createArticle = async (
  authorId: string,
  title: string,
  content: string,
  summary: string,
  category: string,
  featuredImageUrl?: string,
  isPublished?: boolean
): Promise<string> => {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

  const query = `
    DECLARE @ArticleId UNIQUEIDENTIFIER;
    EXEC [blog].[sp_CreateArticle]
      @AuthorId = @authorId,
      @Title = @title,
      @Slug = @slug,
      @Content = @content,
      @Summary = @summary,
      @Category = @category,
      @FeaturedImageUrl = @featuredImageUrl,
      @IsPublished = @isPublished,
      @ArticleId = @ArticleId OUTPUT;
    
    SELECT @ArticleId as ArticleId;
  `

  const result = await executeQuery(query, {
    authorId,
    title,
    slug,
    content,
    summary,
    category,
    featuredImageUrl: featuredImageUrl || null,
    isPublished: isPublished || false,
  })

  return result.recordset[0].ArticleId
}

export const getPublishedArticles = async (
  page?: number,
  limit?: number,
  category?: string
): Promise<{ articles: Article[]; total: number }> => {
  const pageNum = page || 1
  const pageLimit = limit || 10
  const offset = (pageNum - 1) * pageLimit

  let query = `
    SELECT 
      [ArticleId], [AuthorId], [Title], [Slug], [Content], [Summary],
      [Category], [FeaturedImageUrl], [IsPublished], [ViewCount],
      [PublishedAt], [CreatedAt], [UpdatedAt]
    FROM [blog].[Articles]
    WHERE [IsPublished] = 1
  `

  if (category) {
    query += ` AND [Category] = @category`
  }

  query += ` ORDER BY [PublishedAt] DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;

    SELECT COUNT(*) as total FROM [blog].[Articles] WHERE [IsPublished] = 1 ${
      category ? 'AND [Category] = @category' : ''
    }`

  const result = await executeQuery(query, {
    offset,
    limit: pageLimit,
    category: category || null,
  })

  const articles = Array.isArray(result.recordset) ? result.recordset : []
  const totalResult = (result.recordsets as any)?.[1]?.[0] || { total: 0 }

  return {
    articles,
    total: totalResult.total || 0,
  }
}

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  const query = `
    UPDATE [blog].[Articles]
    SET [ViewCount] = [ViewCount] + 1
    WHERE [Slug] = @slug AND [IsPublished] = 1

    SELECT 
      [ArticleId], [AuthorId], [Title], [Slug], [Content], [Summary],
      [Category], [FeaturedImageUrl], [IsPublished], [ViewCount],
      [PublishedAt], [CreatedAt], [UpdatedAt]
    FROM [blog].[Articles]
    WHERE [Slug] = @slug AND [IsPublished] = 1
  `

  const result = await executeQuery(query, { slug })
  const articles = (result.recordsets as any)?.[1] || []
  
  if (articles.length === 0) {
    return null
  }
  return articles[0]
}

export const getArticlesByAuthor = async (
  authorId: string,
  includeUnpublished?: boolean
): Promise<Article[]> => {
  const query = `
    SELECT 
      [ArticleId], [AuthorId], [Title], [Slug], [Content], [Summary],
      [Category], [FeaturedImageUrl], [IsPublished], [ViewCount],
      [PublishedAt], [CreatedAt], [UpdatedAt]
    FROM [blog].[Articles]
    WHERE [AuthorId] = @authorId
    ${includeUnpublished ? '' : 'AND [IsPublished] = 1'}
    ORDER BY [PublishedAt] DESC
  `

  const result = await executeQuery(query, { authorId })
  return result.recordset
}

export const updateArticle = async (
  articleId: string,
  title?: string,
  content?: string,
  summary?: string,
  category?: string,
  featuredImageUrl?: string,
  isPublished?: boolean
): Promise<void> => {
  let query = 'UPDATE [blog].[Articles] SET [UpdatedAt] = GETUTCDATE()'

  if (title) query += ', [Title] = @title, [Slug] = @slug'
  if (content) query += ', [Content] = @content'
  if (summary) query += ', [Summary] = @summary'
  if (category) query += ', [Category] = @category'
  if (featuredImageUrl !== undefined) query += ', [FeaturedImageUrl] = @featuredImageUrl'
  if (isPublished !== undefined) query += ', [IsPublished] = @isPublished'

  query += ' WHERE [ArticleId] = @articleId'

  const slug = title ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : null

  await executeQuery(query, {
    articleId,
    title: title || null,
    slug: slug || null,
    content: content || null,
    summary: summary || null,
    category: category || null,
    featuredImageUrl: featuredImageUrl ?? null,
    isPublished: isPublished ?? null,
  })
}

export const deleteArticle = async (articleId: string): Promise<void> => {
  const query = 'DELETE FROM [blog].[Articles] WHERE [ArticleId] = @articleId'
  await executeQuery(query, { articleId })
}

export const getArticleCategories = async (): Promise<string[]> => {
  const query = `
    SELECT DISTINCT [Category]
    FROM [blog].[Articles]
    WHERE [IsPublished] = 1
    ORDER BY [Category]
  `

  const result = await executeQuery(query, {})
  return result.recordset.map((row: any) => row.Category)
}

export default {
  createArticle,
  getPublishedArticles,
  getArticleBySlug,
  getArticlesByAuthor,
  updateArticle,
  deleteArticle,
  getArticleCategories,
}
