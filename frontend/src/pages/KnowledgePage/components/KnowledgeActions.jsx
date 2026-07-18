function KnowledgeActions({ onFaq, onSupport }) {
  return (
    <div className="knowledge-actions card animate-in delay-3">
      <h2>Быстрый доступ</h2>

      <button type="button" className="secondary" onClick={onFaq}>
        FAQ
      </button>

      <button type="button" className="primary" onClick={onSupport}>
        Поддержка
      </button>
    </div>
  )
}

export default KnowledgeActions
