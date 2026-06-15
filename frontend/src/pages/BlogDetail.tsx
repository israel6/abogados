import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import blogService, { Article } from '@services/blogService'
import { PageShell } from '@components/layout/PageShell'
import { PageHero } from '@components/layout/PageHero'
import { MotionButton } from '@components/ui/MotionButton'
import '../styles/blog.css'

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        const data = await blogService.getArticleBySlug(slug)
        setArticle(data.article)
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
        setError(msg || 'Artículo no encontrado')
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  if (isLoading) {
    return (
      <PageShell>
        <div className="page-content loading">Cargando artículo...</div>
      </PageShell>
    )
  }

  if (error || !article) {
    return (
      <PageShell>
        <div className="page-content error-message">{error || 'Artículo no encontrado'}</div>
      </PageShell>
    )
  }

  const date = new Date(article.PublishedAt || article.CreatedAt).toLocaleDateString('es-ES')

  return (
    <PageShell>
      <PageHero
        eyebrow={article.Category}
        title={article.Title}
        subtitle={`${date} · ${article.ViewCount} vistas`}
      />

      <div className="page-content">
        <motion.article
          className="blog-detail"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {article.FeaturedImageUrl && (
            <motion.div
              className="blog-featured-image"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <img src={article.FeaturedImageUrl} alt={article.Title} />
            </motion.div>
          )}

          <div className="blog-content">
            {article.Content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <footer className="blog-footer">
            <Link to="/blog">
              <MotionButton variant="secondary">← Volver al Blog</MotionButton>
            </Link>
          </footer>
        </motion.article>
      </div>
    </PageShell>
  )
}
