import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadProjets, createProjetThunk, updateProjetThunk, deleteProjetThunk } from '../store/projetsSlice'
import { getProgrammes } from '../api/programmesApi'
import { getAllCommunes } from '../api/communesApi'
import type { ProjetDto, ProjetRequest } from '../types/projet'
import type { Programme } from '../types/programme'
import type { Commune } from '../types/commune'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import ProjetModal, { type ProjetFormValues } from '../components/ProjetModal'
import './ProjetsScreen.css'

export default function ProjetsScreen() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading, error, page, totalPages, totalElements } = useAppSelector((state) => state.projets)

  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProjetDto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjetDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])

  useEffect(() => {
    dispatch(loadProjets({ page: currentPage, size: 10, search: searchTerm }))
  }, [dispatch, currentPage, searchTerm])

  useEffect(() => {
    getProgrammes({ size: 1000 }).then((res) => setProgrammes(res.content)).catch(() => {})
    getAllCommunes().then(setCommunes).catch(() => {})
  }, [])

  const refresh = () => dispatch(loadProjets({ page: currentPage, size: 10, search: searchTerm }))

  const handleSearch = () => {
    setCurrentPage(0)
    setSearchTerm(inputValue)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: ProjetDto) => { setEditing(p); setModalOpen(true) }

  // Convertit un ProjetDto (venant du backend) en valeurs de formulaire (strings)
  const toFormValues = (p: ProjetDto): ProjetFormValues => ({
    nom: p.nom,
    idProgramme: p.idProgramme,
    idCommune: p.idCommune,
    statut: p.statut ?? '',
    budgetEstime: p.budgetEstime != null ? String(p.budgetEstime) : '',
    dateDebut: p.dateDebut ?? '',
    dateFin: p.dateFin ?? '',
  })

  const handleModalSubmit = async (values: ProjetFormValues) => {
    const payload: ProjetRequest = {
      nom: values.nom.trim(),
      idProgramme: values.idProgramme,
      idCommune: values.idCommune,
      statut: values.statut.trim(),
      budgetEstime: values.budgetEstime ? Number(values.budgetEstime) : null,
      dateDebut: values.dateDebut,
      dateFin: values.dateFin,
    }

    setIsSubmitting(true)
    if (editing) {
      const result = await dispatch(updateProjetThunk({ id: editing.idProjet, data: payload }))
      setIsSubmitting(false)
      if (updateProjetThunk.fulfilled.match(result)) { setModalOpen(false); refresh() }
    } else {
      const result = await dispatch(createProjetThunk(payload))
      setIsSubmitting(false)
      if (createProjetThunk.fulfilled.match(result)) { setModalOpen(false); refresh() }
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await dispatch(deleteProjetThunk(deleteTarget.idProjet))
    setIsDeleting(false)
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
      <button title="Supprimer" onClick={() => setDeleteTarget(p)} className="projets-delete-link">
        <Trash2 size={14} />
      </button>
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ProjetModal
        isOpen={modalOpen}
        isSubmitting={isSubmitting}
        mode={editing ? 'edit' : 'create'}
        initialValues={editing ? toFormValues(editing) : undefined}
        programmes={programmes}
        communes={communes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom ?? ''}" ? Cette action est irréversible.`}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
