import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import blogService, { Article } from '@services/blogService'
import { SpotlightCard } from '@components/motion/SpotlightCard'
import { MotionButton } from '@components/ui/MotionButton'
import '../styles/blog.css'

interface BlogListProps {
  category?: string
}

export function BlogList({ category }: BlogListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [category])

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true)
        const data = await blogService.getArticles(page, 10, category)
        setArticles(data.articles)
        setTotal(data.total)
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
        setError(msg || 'Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }
    loadArticles()
  }, [page, category])

  if (isLoading) return <div className="loading">Cargando artículos...</div>
  if (error) return <div className="error-message">{error}</div>
  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay artículos disponibles</p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="blog-list">
      <div className="articles-grid">
        {articles.map((article, i) => (
          <SpotlightCard key={article.ArticleId} className="article-card-wrap">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link to={`/blog/${article.Slug}`} className="article-card">
                {article.FeaturedImageUrl && (
                  <div className="article-image">
                    <img src={article.FeaturedImageUrl} alt={article.Title} />
                  </div>
                )}
                <div className="article-content">
                  <span className="article-category">{article.Category}</span>
                  <h3>{article.Title}</h3>
                  <p className="article-summary">{article.Summary}</p>
                  <div className="article-meta">
                    <span>
                      {new Date(article.PublishedAt || article.CreatedAt).toLocaleDateString('es-ES')}
                    </span>
                    <span>{article.ViewCount} vistas</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </SpotlightCard>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <MotionButton variant="secondary" className="btn-pagination" onClick={() => setPage(page - 1)}>
              Anterior
            </MotionButton>
          )}
          <span className="page-info">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <MotionButton variant="secondary" className="btn-pagination" onClick={() => setPage(page + 1)}>
              Siguiente
            </MotionButton>
          )}
        </div>
      )}
    </div>
  )
}
