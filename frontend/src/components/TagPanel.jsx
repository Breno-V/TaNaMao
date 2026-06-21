import { useState } from 'react'
import ColorPicker from './ColorPicker'
import { useToast } from './Toast'
import TagEditModal from './TagEditModal'

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="7" y1="2" x2="7" y2="12" />
      <line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="2.5" />
      <path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.5 3.5l.5.5M10 10l.5.5M3.5 10.5l.5-.5M10 4l.5-.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="3" x2="11" y2="11" />
      <line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3.5h10" />
      <path d="M4.5 3.5V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" />
      <path d="M3 3.5l.5 8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1l.5-8" />
    </svg>
  )
}

function PillCloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="2" y1="2" x2="8" y2="8" />
      <line x1="8" y1="2" x2="2" y2="8" />
    </svg>
  )
}

function computeTagCounts(tasks) {
  const counts = {}
  for (const t of tasks) {
    if (!t.categorias) continue
    for (const c of t.categorias) {
      counts[c.id] = (counts[c.id] || 0) + 1
    }
  }
  return counts
}

export default function TagPanel({ categories = [], onCategoryChange, tasks = [], variant = 'aside' }) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#2B5F5F')
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [tagError, setTagError] = useState('')
  const [showPillForm, setShowPillForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()
  const tagCounts = computeTagCounts(tasks)

  async function handleAddTag(e) {
    e.preventDefault()
    if (!newTagName.trim()) return
    setTagSubmitting(true)
    setTagError('')
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome: newTagName.trim(), cor: newTagColor }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar tag')
      }
      setNewTagName('')
      setNewTagColor('#2B5F5F')
      setShowPillForm(false)
      onCategoryChange()
      toast('Tag criada')
    } catch (err) {
      setTagError(err.message)
    } finally {
      setTagSubmitting(false)
    }
  }

  async function handleDeleteTag(id) {
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir tag')
      }
      setDeletingId(null)
      onCategoryChange()
      toast('Tag excluída')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function confirmDelete(id) {
    setDeletingId(id)
  }

  function cancelDelete() {
    setDeletingId(null)
  }

  if (variant === 'pills') {
    return (
      <>
        <div className="tag-pills-bar">
          <span className="tag-pills-label">Tags</span>
          <button
            className="tag-pill tag-pill--gear"
            onClick={() => setShowEditModal(true)}
            aria-label="Gerenciar tags"
            title="Gerenciar tags"
          >
            <GearIcon />
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className="tag-pill"
              onClick={() => {}} // filter handled by KPI
              aria-label={cat.nome}
            >
              <span className="tag-pill-dot" style={{ backgroundColor: cat.cor }} />
              <span className="tag-pill-name">{cat.nome}</span>
              <span className="tag-pill-count">{tagCounts[cat.id] || 0}</span>
            </button>
          ))}
          <button
            className={`tag-pill tag-pill--add ${showPillForm ? 'tag-pill--active' : ''}`}
            onClick={() => { setShowPillForm(!showPillForm); setTagError('') }}
            aria-label="Nova tag"
          >
            <PlusIcon />
          </button>
        </div>

        {showPillForm && (
          <form className="tag-pill-form" onSubmit={handleAddTag}>
            <div className="tag-pill-form-row">
              <input
                className="tag-pill-input"
                type="text"
                placeholder="Nome da tag"
                value={newTagName}
                onChange={e => { setNewTagName(e.target.value); setTagError('') }}
                maxLength={30}
                autoFocus
              />
              <button
                type="submit"
                className="tag-pill-form-btn"
                disabled={tagSubmitting || !newTagName.trim()}
              >
                {tagSubmitting ? '…' : 'Criar'}
              </button>
              <button
                type="button"
                className="tag-pill-form-cancel"
                onClick={() => { setShowPillForm(false); setNewTagName(''); setTagError('') }}
                aria-label="Cancelar"
              >
                <CloseIcon />
              </button>
            </div>
            <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            {tagError && <p className="tag-pill-error">{tagError}</p>}
          </form>
        )}

        {showEditModal && (
          <TagEditModal
            categories={categories}
            onCategoryChange={onCategoryChange}
            onClose={() => setShowEditModal(false)}
            tasks={tasks}
          />
        )}
      </>
    )
  }

  return (
    <div className="tag-aside-inner">
      <h3 className="tag-aside-title">Tags</h3>

      <div className="tag-aside-list">
        {categories.map(cat => (
          <div key={cat.id} className="tag-aside-item" style={{ borderLeftColor: cat.cor }}>
            <span className="tag-aside-item-color" style={{ backgroundColor: cat.cor }} />
            <span className="tag-aside-item-name">{cat.nome}</span>
            <span className="tag-aside-item-count">{tagCounts[cat.id] || 0}</span>
            <button
              className="tag-aside-item-delete"
              onClick={() => confirmDelete(cat.id)}
              aria-label={`Excluir tag ${cat.nome}`}
              title="Excluir"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="tag-aside-empty">Nenhuma tag ainda.</p>
        )}
      </div>

      <form className="tag-aside-form" onSubmit={handleAddTag}>
        <div className="tag-aside-form-row">
          <input
            className="tag-aside-input"
            type="text"
            placeholder="Nome da tag"
            value={newTagName}
            onChange={e => { setNewTagName(e.target.value); setTagError('') }}
            maxLength={30}
          />
          <button
            type="submit"
            className="tag-aside-add-btn"
            disabled={tagSubmitting || !newTagName.trim()}
          >
            {tagSubmitting ? '…' : '+ Nova'}
          </button>
        </div>
        <ColorPicker value={newTagColor} onChange={setNewTagColor} />
        {tagError && <p className="tag-aside-error">{tagError}</p>}
      </form>

      {deletingId && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <p className="confirm-text">Excluir tag?</p>
            <p className="confirm-subtext">
              "{categories.find(c => c.id === deletingId)?.nome || ''}"
            </p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDeleteTag(deletingId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
