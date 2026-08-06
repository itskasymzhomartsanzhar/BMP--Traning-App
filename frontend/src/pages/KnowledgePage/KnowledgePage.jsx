import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import { getArticles } from '../../api/articles'
import SectionHead from '../../components/common/SectionHead'
import KnowledgeActions from './components/KnowledgeActions'
import KnowledgeArticles from './components/KnowledgeArticles'
import KnowledgeCategories from './components/KnowledgeCategories'
import './KnowledgePage.scss'

const ALL_CATEGORIES = ['Тренировки', 'Питание', 'Восстановление', 'Мотивация']

function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState([])
  const navigate = useNavigate()
  const { showModal, t } = useAppUI()

  useEffect(() => {
    const params = {}
    if (activeCategory !== 'Все') params.category = activeCategory
    if (search.trim()) params.search = search.trim()
    getArticles(params).then(({ data }) => setArticles(data)).catch(() => {})
  }, [activeCategory, search])

  return (
    <section className="page page-knowledge">
      <SectionHead title={t('knowledge.title')} />

      <div className="knowledge-search">
        <input
          type="search"
          placeholder={t('knowledge.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="knowledge-search__input"
        />
      </div>

      <KnowledgeCategories
        categories={ALL_CATEGORIES}
        activeCategory={activeCategory}
        onChange={(cat) => {
          setActiveCategory(cat)
          setSearch('')
        }}
      />

      {articles.length === 0 ? (
        <div className="card knowledge-empty animate-in">
          <p>{search ? t('knowledge.nothingFound', { search }) : t('knowledge.noArticles')}</p>
          {search && (
            <button type="button" className="secondary" style={{ marginTop: 10 }} onClick={() => setSearch('')}>
              {t('knowledge.resetSearch')}
            </button>
          )}
        </div>
      ) : (
        <KnowledgeArticles articles={articles} onArticleClick={(a) => navigate(`/article/${a.id}`)} />
      )}

      <KnowledgeActions
        onFaq={() =>
          showModal({
            title: t('knowledge.faqTitle'),
            message: t('knowledge.faqBody'),
            actions: [{ label: t('knowledge.gotIt'), variant: 'primary', onClick: () => {} }],
          })
        }
        onSupport={() =>
          showModal({
            title: t('knowledge.supportTitle'),
            message: t('knowledge.supportBody'),
            actions: [
              { label: t('common.close'), variant: 'secondary', onClick: () => {} },
              {
                label: t('knowledge.writeEmail'),
                variant: 'primary',
                // Открываем почтовый клиент — своей отправки писем на бэкенде нет.
                onClick: () => { window.location.href = 'mailto:support@train.app' },
              },
            ],
          })
        }
      />
    </section>
  )
}

export default KnowledgePage
