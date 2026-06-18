import { toLocalDate, toLocalDatetime, hasTimeComponent, formatTime } from '../utils/date'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = toLocalDate(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  let result = `${day}/${month}`
  const time = formatTime(dateStr)
  if (time) result += ` ${time}`
  return result
}

function isUrgent(dateStr) {
  if (!dateStr) return false
  if (hasTimeComponent(dateStr)) {
    const target = toLocalDatetime(dateStr)
    if (isNaN(target.getTime())) return false
    return target <= new Date()
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = toLocalDate(dateStr)
  target.setHours(0, 0, 0, 0)
  return target < today
}

function isUpcoming(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = toLocalDate(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = (target - today) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 3
}

function isToday(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = toLocalDate(dateStr)
  target.setHours(0, 0, 0, 0)
  return target.getTime() === today.getTime()
}

function daysOverdue(dateStr) {
  if (!dateStr) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = toLocalDate(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = today.getTime() - target.getTime()
  if (diff < 0) return 0
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const TAG_CLASSES = {
  tecnico: 'tag-tecnico',
  normal: 'tag-normal',
  eventos: 'tag-eventos',
  domestica: 'tag-domestica',
}

const TAG_LABELS = {
  tecnico: 'Matéria Técnica',
  normal: 'Matéria Normal',
  eventos: 'Eventos',
  domestica: 'Atividades Domésticas',
}

export default function CardTarefa({ tarefa, onToggle, onEdit, onDelete, compact, onDragStart, onDragOver, onDrop, isDragging }) {
  const urgent = isUrgent(tarefa.data_entrega)
  const upcoming = isUpcoming(tarefa.data_entrega)
  const today = isToday(tarefa.data_entrega)
  const overdue = daysOverdue(tarefa.data_entrega)

  let cardClass = 'card'
  if (urgent) cardClass += ' card-urgent'
  else if (upcoming && !compact) cardClass += ' card-upcoming'
  if (isDragging) cardClass += ' card-dragging'

  return (
    <div
      className={cardClass}
      draggable={!compact}
      onDragStart={() => onDragStart?.(tarefa.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop?.(tarefa.id)}
    >
      <div className="card-header">
        <span
          className={`card-title${tarefa.concluida ? ' done' : ''}`}
          onClick={() => onToggle?.(tarefa)}
          style={{ cursor: onToggle ? 'pointer' : 'default' }}
        >
          {tarefa.titulo}
        </span>
        <div className="card-header-right">
          {!compact && !tarefa.concluida && today && !urgent && (
            <span className="badge badge--today">Vence hoje</span>
          )}
          {!compact && !tarefa.concluida && (urgent || overdue > 0) && (
            <span className="badge badge--overdue">
              {overdue === 0 ? 'Atrasada' : overdue === 1 ? '1 dia' : `${overdue} dias`}
            </span>
          )}
          {tarefa.data_entrega && (
            <span className={`card-date${urgent ? ' urgent' : ''}`}>
              {formatDate(tarefa.data_entrega)}
            </span>
          )}
        </div>
      </div>

      {!compact && tarefa.descricao && (
        <div className="card-desc">{tarefa.descricao}</div>
      )}

      {!compact && tarefa.categorias?.length > 0 && (
        <div className="card-tags">
          {tarefa.categorias.map(cat => (
            <span key={cat} className={`tag ${TAG_CLASSES[cat] || ''}`}>
              {TAG_LABELS[cat] || cat}
            </span>
          ))}
        </div>
      )}

      {!compact && (
        <div className="card-actions">
          <button className="card-action-btn edit" onClick={() => onEdit?.(tarefa)}>
            Editar
          </button>
          <button className="card-action-btn danger" onClick={() => onDelete?.(tarefa.id)}>
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}
