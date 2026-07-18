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
  const { showModal } = useAppUI()

  useEffect(() => {
    const params = {}
    if (activeCategory !== 'Все') params.category = activeCategory
    if (search.trim()) params.search = search.trim()
    getArticles(params).then(({ data }) => setArticles(data)).catch(() => {})
  }, [activeCategory, search])

  return (
    <section className="page page-knowledge">
      <SectionHead title="База знаний" />

      <div className="knowledge-search">
        <input
          type="search"
          placeholder="Поиск по статьям..."
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
          <p>{search ? `Ничего не найдено по запросу «${search}»` : 'Статьи не найдены'}</p>
          {search && (
            <button type="button" className="secondary" style={{ marginTop: 10 }} onClick={() => setSearch('')}>
              Сбросить поиск
            </button>
          )}
        </div>
      ) : (
        <KnowledgeArticles articles={articles} onArticleClick={(a) => navigate(`/article/${a.id}`)} />
      )}

      <KnowledgeActions
        onFaq={() =>
          showModal({
            title: 'Частые вопросы',
            message: '· Как начать тренировки?\n· Как считать КБЖУ?\n· Сколько раз в неделю тренироваться?\n· Что есть до и после тренировки?\n· Как не сорваться с диеты?',
            actions: [{ label: 'Понятно', variant: 'primary', onClick: () => {} }],
          })
        }
        onSupport={() =>
          showModal({
            title: 'Поддержка',
            message: 'Напишите нам:\nsupport@train.app\n\nОтвечаем в течение 24 часов.',
            actions: [
              { label: 'Закрыть', variant: 'secondary', onClick: () => {} },
              {
                label: 'Написать письмо',
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
