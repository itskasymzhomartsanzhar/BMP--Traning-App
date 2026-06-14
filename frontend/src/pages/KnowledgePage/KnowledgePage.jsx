import { useMemo, useState } from 'react'
import SectionHead from '../../components/common/SectionHead'
import KnowledgeActions from './components/KnowledgeActions'
import KnowledgeArticles from './components/KnowledgeArticles'
import KnowledgeCategories from './components/KnowledgeCategories'
import './KnowledgePage.css'

function KnowledgePage({ categories, articles, onAction }) {
  const [activeCategory, setActiveCategory] = useState('Все')

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'Все') {
      return articles
    }

    return articles.filter((article) => article.category === activeCategory)
  }, [activeCategory, articles])

  return (
    <section className="page page-knowledge">
      <SectionHead
        title="База знаний"
        icon="knowledge"
        iconMessage="База знаний"
        onIconClick={() => onAction('Открыт поиск по базе знаний')}
      />

      <KnowledgeCategories
        categories={categories}
        activeCategory={activeCategory}
        onChange={(category) => {
          setActiveCategory(category)
          onAction(`Фильтр: ${category}`)
        }}
      />

      <KnowledgeArticles articles={filteredArticles} onAction={onAction} />
      <KnowledgeActions onAction={onAction} />
    </section>
  )
}

export default KnowledgePage
