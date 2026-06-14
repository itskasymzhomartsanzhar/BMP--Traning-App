function ProgramTypeChips({ categories, onAction }) {
  return (
    <div className="training-categories animate-in delay-2">
      {categories.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`training-category ${item.tone}`}
          onClick={() => onAction(`Категория: ${item.label}`)}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ProgramTypeChips
