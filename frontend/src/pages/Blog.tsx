import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { PageShell } from '@components/layout/PageShell'
import { PageHero } from '@components/layout/PageHero'
import { BlogList } from '@components/BlogList'
import blogService from '@services/blogService'
import '../styles/blog.css'

export function Blog() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await blogService.getCategories()
        setCategories(data.categories)
      } catch {
        console.error('Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  return (
    <PageShell>
      <PageHero
        index="02"
        eyebrow="Actualidad Legal"
        title="Blog Jurídico"
        subtitle="Análisis, jurisprudencia y artículos de interés para mantenerse informado."
      />
      <div className="page-content">
        <main className="blog-main">
          <aside className="blog-sidebar">
            <div className="categories-filter">
              <h3>Categorías</h3>
              {isLoading ? (
                <div className="loading-small">Cargando...</div>
              ) : (
                <div className="categories-list">
                  <motion.button
                    type="button"
                    className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(undefined)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Todos
                  </motion.button>
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      type="button"
                      className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </aside>
          <section className="blog-content-section">
            <BlogList category={selectedCategory} />
          </section>
        </main>
      </div>
    </PageShell>
  )
}
