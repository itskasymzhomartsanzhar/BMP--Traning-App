function KnowledgeCategories({ categories, activeCategory, onChange }) {
  return (
    <div className="knowledge-categories card animate-in delay-1">
      <h2>Категории</h2>

      <div className="chip-row">
        <button
          type="button"
          className={activeCategory === 'Все' ? 'chip is-active' : 'chip'}
          onClick={() => onChange('Все')}
        >
          Все
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'chip is-active' : 'chip'}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default KnowledgeCategories
