import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadProjets, createProjetThunk, updateProjetThunk, deleteProjetThunk } from '../store/projetsSlice'
import type { ProjetDto, ProjetRequest } from '../types/projet'
import Pagination from '../components/Pagination'
import './ProjetsScreen.css'

// Doit rester synchronisé avec les statuts proposés dans ProjetModal (ajout de
// projet depuis la fiche Programme).
const STATUTS = ['Crée', 'En cours', 'Terminé']

const emptyForm = (): ProjetRequest => ({
  nom: '', dateDebut: '', dateFin: '', budgetEstime: null, statut: STATUTS[1],
  idProgramme: '', idCommune: '',
})

export default function ProjetsScreen() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading, error, page, totalPages, totalElements } = useAppSelector((state) => state.projets)

  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProjetDto | null>(null)
  const [form, setForm] = useState<ProjetRequest>(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    dispatch(loadProjets({ page: currentPage, size: 10, search: searchTerm }))
  }, [dispatch, currentPage, searchTerm])

  const refresh = () => dispatch(loadProjets({ page: currentPage, size: 10, search: searchTerm }))

  const handleSearch = () => {
    setCurrentPage(0)
    setSearchTerm(inputValue)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setModalOpen(true) }
  const openEdit = (p: ProjetDto) => {
    setEditing(p)
    setForm({
      nom: p.nom, dateDebut: p.dateDebut ?? '', dateFin: p.dateFin ?? '',
      budgetEstime: p.budgetEstime, statut: p.statut ?? '',
      idProgramme: p.idProgramme, idCommune: p.idCommune,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const result = await dispatch(updateProjetThunk({ id: editing.idProjet, data: form }))
      if (updateProjetThunk.fulfilled.match(result)) { setModalOpen(false); refresh() }
    } else {
      const result = await dispatch(createProjetThunk(form))
      if (createProjetThunk.fulfilled.match(result)) { setModalOpen(false); refresh() }
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const result = await dispatch(deleteProjetThunk(deleteTarget))
    if (deleteProjetThunk.fulfilled.match(result)) refresh()
    setDeleteTarget(null)
  }

  return (
    <div className="projets-page">
      <div className="projets-page__header">
        <div>
          <h1>Projets</h1>
          <p>{loading ? 'Chargement...' : `${totalElements} projet${totalElements !== 1 ? 's' : ''}`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nouveau Projet
        </button>
      </div>

      <div className="projets-page__filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Nom, programme, commune..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="btn-search" onClick={handleSearch}>
            Rechercher
          </button>
        </div>
      </div>

      {error && <p className="projets-page__state projets-page__state--error">{error}</p>}

      <div className="projets-table-wrapper">
        <table className="projets-table">
          <thead>
            <tr>
              <th>Nom</th><th>Programme</th><th>Commune</th>
              <th>Budget</th><th>Partenaires</th><th>Sociétés</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="projets-empty">Chargement...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={8} className="projets-empty">Aucun résultat trouvé.</td></tr>}
            {!loading && items.map((p) => (
  <tr key={p.idProjet} onClick={() => navigate(`/projets/${p.idProjet}`)} className="projets-row-clickable">
    <td>{p.nom}</td>
    <td>{p.nomProgramme}</td>
    <td>{p.nomCommune}</td>
    <td>{p.budgetEstime ?? '—'}</td>
    <td>{p.nbrPartenaire}</td>
    <td>{p.nbrSociete}</td>
    <td><span className="projets-badge">{p.statut}</span></td>
    <td className="projets-actions" onClick={(e) => e.stopPropagation()}>
      <button title="Voir" onClick={() => navigate(`/projets/${p.idProjet}`)}>
        <Eye size={15} />
      </button>
      <button title="Éditer" onClick={() => openEdit(p)}>
        <Edit2 size={14} />
      </button>
      <button title="Supprimer" onClick={() => setDeleteTarget(p.idProjet)} className="projets-delete-link">
        <Trash2 size={14} />
      </button>
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setCurrentPage} />

      {modalOpen && (
        <div className="projets-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="projets-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Modifier le Projet' : 'Nouveau Projet'}</h2>
            <form onSubmit={handleSubmit} className="projets-form">
              <label>Nom
                <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required />
              </label>
              <label>ID Programme (UUID — collé en attendant le menu déroulant)
                <input value={form.idProgramme} onChange={(e) => setForm((f) => ({ ...f, idProgramme: e.target.value }))} required />
              </label>
              <label>ID Commune (UUID — collé en attendant le menu déroulant)
                <input value={form.idCommune} onChange={(e) => setForm((f) => ({ ...f, idCommune: e.target.value }))} required />
              </label>
              <label>Statut
                <select value={form.statut ?? ''} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))}>
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>Budget estimé
                <input type="number" value={form.budgetEstime ?? ''} onChange={(e) => setForm((f) => ({ ...f, budgetEstime: e.target.value ? Number(e.target.value) : null }))} />
              </label>
              <label>Date début
                <input type="date" value={form.dateDebut ?? ''} onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))} />
              </label>
              <label>Date fin
                <input type="date" value={form.dateFin ?? ''} onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))} />
              </label>
              <div className="projets-modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>Annuler</button>
                <button type="submit">{editing ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="projets-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="projets-modal" onClick={(e) => e.stopPropagation()}>
            <p>Supprimer ce projet ?</p>
            <div className="projets-modal-actions">
              <button onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button onClick={confirmDelete} className="projets-delete-link">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
