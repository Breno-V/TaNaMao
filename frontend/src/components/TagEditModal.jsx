import { useState } from 'react'
import ColorPicker from './ColorPicker'
import { useToast } from './Toast'

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="4" x2="14" y2="14" />
      <line x1="14" y1="4" x2="4" y2="14" />
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

export default function TagEditModal({ categories = [], onCategoryChange, onClose, tasks = [] }) {
  const tagCounts = computeTagCounts(tasks)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#2B5F5F')
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [createError, setCreateError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()

  async function handleAddTag(e) {
    e.preventDefault()
    if (!newTagName.trim()) return
    setTagSubmitting(true)
    setCreateError('')
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
      onCategoryChange()
      toast('Tag criada')
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setTagSubmitting(false)
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setEditName(cat.nome)
    setEditColor(cat.cor)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  async function handleSaveEdit(id) {
    if (!editName.trim()) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome: editName.trim(), cor: editColor }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }
      cancelEdit()
      onCategoryChange()
      toast('Tag salva')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setEditSubmitting(false)
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

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal tag-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="tag-edit-header">
          <h2 className="tag-edit-title">Tags</h2>
          <button className="tag-edit-close" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>

        <div className="tag-edit-body">
          {categories.length === 0 ? (
            <p className="tag-edit-empty">Nenhuma tag ainda.</p>
          ) : (
            <div className="tag-edit-list">
              {categories.map(cat => (
                <div key={cat.id} className="tag-edit-item" style={{ borderLeftColor: cat.cor }}>
                  {editingId === cat.id ? (
                    <div className="tag-edit-item-edit">
                      <div className="tag-edit-item-edit-row">
                        <span className="tag-edit-item-edit-swatch" style={{ backgroundColor: editColor }} />
                        <input
                          className="tag-edit-item-edit-input"
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          maxLength={30}
                          autoFocus
                        />
                        <button
                          className="tag-edit-item-save-btn"
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={editSubmitting || !editName.trim()}
                        >
                          {editSubmitting ? '…' : 'Salvar'}
                        </button>
                        <button
                          className="tag-edit-item-cancel-btn"
                          onClick={cancelEdit}
                          aria-label="Cancelar"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>
                  ) : (
                    <>
                      <span className="tag-edit-item-color" style={{ backgroundColor: cat.cor }} />
                      <span className="tag-edit-item-name">{cat.nome}</span>
                      <span className="tag-edit-item-count">{tagCounts[cat.id] || 0}</span>
                      <button
                        className="tag-edit-item-edit-btn"
                        onClick={() => startEdit(cat)}
                        aria-label={`Editar tag ${cat.nome}`}
                        title="Editar"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.5 1.5l2 2L4 11H2V9l7.5-7.5z" />
                        </svg>
                      </button>
                      <button
                        className="tag-edit-item-del-btn"
                        onClick={() => setDeletingId(cat.id)}
                        aria-label={`Excluir tag ${cat.nome}`}
                        title="Excluir"
                      >
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="13" height="13">
                          <line x1="3" y1="3" x2="11" y2="11" />
                          <line x1="11" y1="3" x2="3" y2="11" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tag-edit-create">
          <div className="tag-edit-create-label">Nova tag</div>
          <form className="tag-edit-create-form" onSubmit={handleAddTag}>
            <div className="tag-edit-create-row">
              <input
                className="tag-edit-create-input"
                type="text"
                placeholder="Nome"
                value={newTagName}
                onChange={e => { setNewTagName(e.target.value); setCreateError('') }}
                maxLength={30}
              />
              <button
                type="submit"
                className="tag-edit-create-btn"
                disabled={tagSubmitting || !newTagName.trim()}
              >
                {tagSubmitting ? '…' : 'Criar'}
              </button>
            </div>
            <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            {createError && <p className="tag-edit-create-error">{createError}</p>}
          </form>
        </div>

        {deletingId && (
          <div className="modal-overlay" onClick={() => setDeletingId(null)}>
            <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
              <p className="confirm-text">Excluir tag?</p>
              <p className="confirm-subtext">
                "{categories.find(c => c.id === deletingId)?.nome || ''}"
              </p>
              <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleDeleteTag(deletingId)}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
