import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import { getArticle } from '../../api/articles'
import './ArticlePage.scss'

function ArticlePage() {
  const { t } = useAppUI()
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getArticle(articleId)
      .then(({ data }) => setArticle(data))
      .catch(() => setNotFound(true))
  }, [articleId])

  if (notFound) {
    return (
      <section className="page">
        <BackHeader title={t('knowledge.articleNotFound')} onBack={() => navigate('/knowledge')} />
      </section>
    )
  }

  if (!article) {
    return (
      <section className="page page-article">
        <BackHeader title={t('common.loading')} onBack={() => navigate('/knowledge')} />
      </section>
    )
  }

  return (
    <section className="page page-article">
      <BackHeader
        title={article.title}
        subtitle={`${article.category} · ${article.read_time} · ${article.level}`}
        onBack={() => navigate('/knowledge')}
      />
      <article className="card article-body animate-in">
        {article.body.split('\n\n').map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </article>
    </section>
  )
}

export default ArticlePage
