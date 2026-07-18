function KnowledgeArticles({ articles, onArticleClick }) {
  return (
    <div className="knowledge-articles card animate-in delay-2">
      <h2>Статьи</h2>

      <div className="article-list">
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            className="article-row"
            onClick={() => onArticleClick?.(article)}
          >
            <div>
              <strong>{article.title}</strong>
              <p>{article.category}</p>
            </div>
            <div className="article-meta">
              <span>{article.readTime}</span>
              <small>{article.level}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default KnowledgeArticles
