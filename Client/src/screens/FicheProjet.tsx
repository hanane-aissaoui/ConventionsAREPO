import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Calendar, DollarSign, MapPin, FolderOpen, Users, Building2, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadProjetDetail, updateProjetThunk, deleteProjetThunk } from '../store/projetsSlice'
import { getProgrammes } from '../api/programmesApi'
import { getAllCommunes } from '../api/communesApi'
import type { ProjetDto, ProjetRequest } from '../types/projet'
import type { Programme } from '../types/programme'
import type { Commune } from '../types/commune'
import ConfirmDialog from '../components/ConfirmDialog'
import ProjetModal, { type ProjetFormValues } from '../components/ProjetModal'
import './FicheProjet.css'

function formatBudget(v: number | null) {
  if (v == null) return '—'
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(v) + ' DH'
}

// Un donut réutilisable pour Physique ET Financier, seule la couleur change.
function AvancementDonut({ value, color, label }: { value: number; color: string; label: string }) {
  const data = [
    { name: 'Réalisé', value },
    { name: 'Restant', value: 100 - value },
  ]
  return (
    <div className="fiche-avancement-item">
      <div className="fiche-donut-wrapper">
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={38}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} />
              <Cell fill="#E3E2E2" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="fiche-donut-label">
          <span className="fiche-donut-value" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="fiche-avancement-text">
        <p className="fiche-donut-caption">{label}</p>
        <p className="fiche-donut-sub">Moyenne sur l'ensemble des marchés du projet</p>
      </div>
    </div>
  )
}

export default function FicheProjet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selected, detailLoading, detailError } = useAppSelector((state) => state.projets)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])

  useEffect(() => {
    if (id) dispatch(loadProjetDetail(id))
  }, [dispatch, id])

  useEffect(() => {
    getProgrammes({ size: 1000 }).then((res) => setProgrammes(res.content)).catch(() => {})
    getAllCommunes().then(setCommunes).catch(() => {})
  }, [])

  if (detailLoading) return <p className="fiche-loading">Chargement...</p>
  if (detailError) return <p className="fiche-error">{detailError}</p>
  if (!selected) return null

  const hasAvancement = selected.avancementPhysiqueMoyen != null || selected.avancementFinancierMoyen != null

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

  const openEdit = () => setEditModalOpen(true)

  const handleEditSubmit = async (values: ProjetFormValues) => {
    if (!id) return
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
    const result = await dispatch(updateProjetThunk({ id, data: payload }))
    setIsSubmitting(false)
    if (updateProjetThunk.fulfilled.match(result)) {
      setEditModalOpen(false)
      dispatch(loadProjetDetail(id))
    }
  }

  const handleConfirmDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    const result = await dispatch(deleteProjetThunk(id))
    setIsDeleting(false)
    if (deleteProjetThunk.fulfilled.match(result)) {
      navigate('/projets')
    }
  }

  return (
    <div className="fiche-container">
      <button className="fiche-back-btn" onClick={() => navigate('/projets')}>
        <ArrowLeft size={14} /> Retour aux Projets
      </button>

      <div className="fiche-header-card">
        <div className="fiche-header-top">
          <div>
            <span className="fiche-badge-orange">{selected.statut}</span>
            <h1 className="fiche-title">{selected.nom}</h1>
          </div>
          <div className="fiche-header-actions">
            <button className="btn-outline" onClick={openEdit} aria-label="Modifier">
              <Pencil size={14} />
            </button>
            <button
              className="btn-danger-outline"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="fiche-info-grid">
          <button
            className="fiche-info-item fiche-info-clickable"
            onClick={() => navigate(`/programmes/${selected.idProgramme}`)}
          >
            <FolderOpen size={16} className="fiche-icon" style={{ color: '#145A8D' }} />
            <div className="fiche-info-text">
              <p className="fiche-label">Programme</p>
              <p className="fiche-value">{selected.nomProgramme}</p>
            </div>
            <ChevronRight size={16} className="fiche-chevron" />
          </button>

          <div className="fiche-info-item">
            <MapPin size={16} className="fiche-icon" style={{ color: '#C64A11' }} />
            <div>
              <p className="fiche-label">Commune</p>
              <p className="fiche-value">{selected.nomCommune}</p>
            </div>
          </div>

          <div className="fiche-info-item">
            <Calendar size={16} className="fiche-icon" style={{ color: '#0E630E' }} />
            <div>
              <p className="fiche-label">Période</p>
              <p className="fiche-value">{selected.dateDebut ?? '—'} → {selected.dateFin ?? '—'}</p>
            </div>
          </div>

          <div className="fiche-info-item fiche-info-highlight">
            <DollarSign size={16} className="fiche-icon-highlight" />
            <div>
              <p className="fiche-label-highlight">Budget estimé</p>
              <p className="fiche-value-highlight">{formatBudget(selected.budgetEstime)}</p>
            </div>
          </div>
        </div>

        {hasAvancement && (
          <div className="fiche-avancement-section">
            <p className="fiche-avancement-title">Avancement global (moyenne des marchés)</p>
            <div className="fiche-avancement-row">
              {selected.avancementPhysiqueMoyen != null && (
                <AvancementDonut value={selected.avancementPhysiqueMoyen} color="#22C55E" label="Avancement Physique" />
              )}
              {selected.avancementFinancierMoyen != null && (
                <AvancementDonut value={selected.avancementFinancierMoyen} color="#145A8D" label="Avancement Financier" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fiche-lists-row">
        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <Users size={16} className="fiche-icon-highlight" style={{ color: '#145A8D' }} />
            <h2>Partenaires ({selected.partenaires?.length ?? 0})</h2>
          </div>
          {(!selected.partenaires || selected.partenaires.length === 0) ? (
            <p className="fiche-list-empty">Aucun partenaire lié.</p>
          ) : (
            <ul className="fiche-list">
              {selected.partenaires.map((nom, i) => <li key={i}>{nom}</li>)}
            </ul>
          )}
        </div>

        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <Building2 size={16} className="fiche-icon-highlight" style={{ color: '#C64A11' }} />
            <h2>Sociétés des marchés ({selected.marches?.length ?? 0})</h2>
          </div>
          {(!selected.marches || selected.marches.length === 0) ? (
            <p className="fiche-list-empty">Aucun marché lié.</p>
          ) : (
            <ul className="fiche-list">
              {selected.marches.map((nom, i) => <li key={i}>{nom}</li>)}
            </ul>
          )}
        </div>
      </div>

      <ProjetModal
        isOpen={editModalOpen}
        isSubmitting={isSubmitting}
        mode="edit"
        initialValues={toFormValues(selected)}
        programmes={programmes}
        communes={communes}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${selected.nom}" ? Cette action est irréversible.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  )
}
