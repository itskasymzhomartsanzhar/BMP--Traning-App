function CalculatorCard({ type, form, result, onTypeChange, onFieldChange, onCalculate }) {
  return (
    <div className="card calculator-card animate-in delay-3">
      <h2>Калькулятор</h2>

      <div className="tab-row compact">
        <button type="button" className={type === 'tdee' ? 'tab is-active' : 'tab'} onClick={() => onTypeChange('tdee')}>
          TDEE
        </button>
        <button type="button" className={type === 'bmi' ? 'tab is-active' : 'tab'} onClick={() => onTypeChange('bmi')}>
          BMI
        </button>
        <button type="button" className={type === 'macros' ? 'tab is-active' : 'tab'} onClick={() => onTypeChange('macros')}>
          Макросы
        </button>
      </div>

      <div className="calc-grid">
        <label>
          Вес (кг)
          <input value={form.weight} onChange={(event) => onFieldChange('weight', event.target.value)} />
        </label>

        <label>
          Рост (см)
          <input value={form.height} onChange={(event) => onFieldChange('height', event.target.value)} />
        </label>

        <label>
          Возраст
          <input value={form.age} onChange={(event) => onFieldChange('age', event.target.value)} />
        </label>

        <label>
          Активность
          <select value={form.activity} onChange={(event) => onFieldChange('activity', event.target.value)}>
            <option value="1.2">Низкая</option>
            <option value="1.375">Легкая</option>
            <option value="1.55">Средняя</option>
            <option value="1.725">Высокая</option>
          </select>
        </label>

        <label>
          Пол
          <select value={form.gender} onChange={(event) => onFieldChange('gender', event.target.value)}>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </label>

        <label>
          Цель
          <select value={form.goal} onChange={(event) => onFieldChange('goal', event.target.value)}>
            <option value="cut">Сушка</option>
            <option value="maintain">Поддержание</option>
            <option value="bulk">Набор</option>
          </select>
        </label>
      </div>

      <button type="button" className="primary" onClick={onCalculate}>
        Рассчитать
      </button>

      <p className="calc-result">{result || 'Результат появится после расчета.'}</p>
    </div>
  )
}

export default CalculatorCard
