function KnowledgeActions({ onAction }) {
  return (
    <div className="knowledge-actions card animate-in delay-3">
      <h2>Быстрый доступ</h2>

      <button type="button" className="secondary" onClick={() => onAction('Открыт FAQ')}>
        FAQ
      </button>

      <button type="button" className="secondary" onClick={() => onAction('Открыт словарь терминов')}>
        Словарь терминов
      </button>

      <button type="button" className="primary" onClick={() => onAction('Поиск по базе знаний')}>
        Поиск статьи
      </button>
    </div>
  )
}

export default KnowledgeActions
