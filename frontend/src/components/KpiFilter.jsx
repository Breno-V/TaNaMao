const CATEGORIES = [
  { key: null, label: 'Todas' },
  { key: 'tecnico', label: 'Matéria Técnica' },
  { key: 'normal', label: 'Matéria Normal' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'domestica', label: 'Atividades Domésticas' },
]

export default function KpiFilter({ tasks, active, onChange }) {
  const counts = {}
  for (const cat of CATEGORIES) {
    if (cat.key === null) {
      counts[null] = tasks.length
    } else {
      counts[cat.key] = tasks.filter(t => t.categorias?.includes(cat.key)).length
    }
  }

  return (
    <div className="kpi-bar">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key ?? '__all'}
          className={`kpi-btn${(active === cat.key || (!active && cat.key === null)) ? ' active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          {cat.label}
          <span className="kpi-count">{counts[cat.key]}</span>
        </button>
      ))}
    </div>
  )
}
