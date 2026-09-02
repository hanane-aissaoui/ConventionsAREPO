import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Calendar, DollarSign, MapPin, FolderOpen, Users, Building2, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  loadProjetDetail,
  updateProjetThunk,
  deleteProjetThunk,
  clearProjetsError,
  fetchConventionsSpecifiques,
  addConventionSpecifique,
  editConventionSpecifique,
  removeConventionSpecifique,
  resetAddConventionSpecifiqueStatus,
  resetEditConventionSpecifiqueStatus,
  resetDeleteConventionSpecifiqueStatus,
  fetchMarches,
  addMarche,
  editMarche,
  removeMarche,
  resetAddMarcheStatus,
  resetEditMarcheStatus,
  resetDeleteMarcheStatus,
} from '../store/projetsSlice'
import { getAllPartenaires } from '../api/partenairesApi'
import { getAllProgrammes } from '../api/programmesApi'
import type { Partenaire } from '../types/partenaire'
import type { Programme } from '../types/programme'
import type { ProjetRequest } from '../types/projet'
import type { ConventionSpecifique } from '../types/conventionSpecifique'
import type { Marche, TypeAction } from '../types/marche'
import { TYPE_ACTION_OPTIONS } from '../types/marche'
import ConfirmDialog from '../components/ConfirmDialog'
import ProjetModal, { type ProjetFormValues } from '../components/ProjetModal'
import AssocierPartenaireModal, { type ConventionFormValues } from '../components/AssocierPartenaireModal'
import AssocierMarcheModal, { type MarcheFormValues } from '../components/AssocierMarcheModal'
import StatutBadge from '../components/StatutBadge'
import './FicheProjet.css'
import './ProgrammeDetail.css'

function formatBudget(v: number | null) {
  if (v == null) return '—'
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(v) + ' DH'
}

function formatMontant(montant: number | null): string {
  if (montant == null) return '—'
  return `${montant.toLocaleString('fr-FR')} MAD`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function typeActionLabel(typeAction: string): string {
  return TYPE_ACTION_OPTIONS.find((o) => o.value === typeAction)?.label ?? typeAction
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
  const { selected, detailLoading, detailError, error: projetError } = useAppSelector((state) => state.projets)

  const {
    conventionsSpecifiques,
    addConventionSpecifiqueStatus,
    addConventionSpecifiqueError,
    editConventionSpecifiqueStatus,
    editConventionSpecifiqueError,
    deleteConventionSpecifiqueStatus,
    deleteConventionSpecifiqueError,
    marches,
    addMarcheStatus,
    addMarcheError,
    editMarcheStatus,
    editMarcheError,
    deleteMarcheStatus,
    deleteMarcheError,
  } = useAppSelector((state) => state.projets)

  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])

  // Modifier / supprimer le projet lui-même
  const [projetEditOpen, setProjetEditOpen] = useState(false)
  const [projetDeleteOpen, setProjetDeleteOpen] = useState(false)
  const [projetSubmitting, setProjetSubmitting] = useState(false)
  const [projetDeleting, setProjetDeleting] = useState(false)

  // Associer un partenaire (ConventionSpecifique)
  const [conventionModalOpen, setConventionModalOpen] = useState(false)
  const [conventionModalMode, setConventionModalMode] = useState<'create' | 'edit'>('create')
  const [editingConvention, setEditingConvention] = useState<ConventionSpecifique | null>(null)
  const [deleteConventionTarget, setDeleteConventionTarget] = useState<ConventionSpecifique | null>(null)

  // Ajouter une société / un marché
  const [marcheModalOpen, setMarcheModalOpen] = useState(false)
  const [marcheModalMode, setMarcheModalMode] = useState<'create' | 'edit'>('create')
  const [editingMarche, setEditingMarche] = useState<Marche | null>(null)
  const [deleteMarcheTarget, setDeleteMarcheTarget] = useState<Marche | null>(null)

  useEffect(() => {
    if (id) {
      dispatch(loadProjetDetail(id))
      dispatch(fetchConventionsSpecifiques(id))
      dispatch(fetchMarches(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    getAllPartenaires().then(setPartenaires).catch(() => {})
    getAllProgrammes().then(setProgrammes).catch(() => {})
  }, [])

  useEffect(() => {
    if (addConventionSpecifiqueStatus === 'succeeded') {
      setConventionModalOpen(false)
      dispatch(resetAddConventionSpecifiqueStatus())
    }
  }, [addConventionSpecifiqueStatus, dispatch])

  useEffect(() => {
    if (editConventionSpecifiqueStatus === 'succeeded') {
      setConventionModalOpen(false)
      setEditingConvention(null)
      dispatch(resetEditConventionSpecifiqueStatus())
    }
  }, [editConventionSpecifiqueStatus, dispatch])

  useEffect(() => {
    if (deleteConventionSpecifiqueStatus === 'succeeded') {
      setDeleteConventionTarget(null)
      dispatch(resetDeleteConventionSpecifiqueStatus())
    }
  }, [deleteConventionSpecifiqueStatus, dispatch])

  useEffect(() => {
    if (addMarcheStatus === 'succeeded') {
      setMarcheModalOpen(false)
      dispatch(resetAddMarcheStatus())
    }
  }, [addMarcheStatus, dispatch])

  useEffect(() => {
    if (editMarcheStatus === 'succeeded') {
      setMarcheModalOpen(false)
      setEditingMarche(null)
      dispatch(resetEditMarcheStatus())
    }
  }, [editMarcheStatus, dispatch])

  useEffect(() => {
    if (deleteMarcheStatus === 'succeeded') {
      setDeleteMarcheTarget(null)
      dispatch(resetDeleteMarcheStatus())
    }
  }, [deleteMarcheStatus, dispatch])

  if (detailLoading) return <p className="fiche-loading">Chargement...</p>
  if (detailError) return <p className="fiche-error">{detailError}</p>
  if (!selected) return null

  const hasAvancement = selected.avancementPhysiqueMoyen != null || selected.avancementFinancierMoyen != null

  // ─── Projet lui-même (modification / suppression) ────────────────────
  const toProjetFormValues = (): ProjetFormValues => ({
    nom: selected.nom,
    idProgramme: selected.idProgramme,
    idCommune: selected.idCommune,
    statut: selected.statut ?? 'En cours',
    budgetEstime: selected.budgetEstime != null ? String(selected.budgetEstime) : '',
    dateDebut: selected.dateDebut ?? '',
    dateFin: selected.dateFin ?? '',
  })

  const handleProjetEditSubmit = async (values: ProjetFormValues) => {
    if (!id) return
    const payload: ProjetRequest = {
      nom: values.nom.trim(),
      idProgramme: values.idProgramme,
      idCommune: values.idCommune,
      statut: values.statut.trim(),
      budgetEstime: values.budgetEstime ? Number(values.budgetEstime) : null,
      dateDebut: values.dateDebut || null,
      dateFin: values.dateFin || null,
    }
    setProjetSubmitting(true)
    const result = await dispatch(updateProjetThunk({ id, data: payload }))
    setProjetSubmitting(false)
    if (updateProjetThunk.fulfilled.match(result)) {
      setProjetEditOpen(false)
      dispatch(loadProjetDetail(id))
    }
  }

  const handleProjetDelete = async () => {
    if (!id) return
    setProjetDeleting(true)
    const result = await dispatch(deleteProjetThunk(id))
    setProjetDeleting(false)
    if (deleteProjetThunk.fulfilled.match(result)) navigate('/projets')
  }

  // ─── Partenaires associés ────────────────────────────────────────────
  const openCreateConventionModal = () => {
    setConventionModalMode('create')
    setEditingConvention(null)
    setConventionModalOpen(true)
  }

  const openEditConventionModal = (convention: ConventionSpecifique) => {
    setConventionModalMode('edit')
    setEditingConvention(convention)
    setConventionModalOpen(true)
  }

  const toConventionFormValues = (c: ConventionSpecifique): ConventionFormValues => ({
    idPartenaire: c.idPartenaire,
    etatConvention: c.etatConvention,
    montantContribution: c.montantContribution != null ? String(c.montantContribution) : '',
    montantDebloque: c.montantDebloque != null ? String(c.montantDebloque) : '',
    dateParticipation: c.dateParticipation ?? '',
  })

  const handleConventionSubmit = (values: ConventionFormValues) => {
    if (!id) return
    const payload = {
      idPartenaire: values.idPartenaire,
      idProjet: id,
      montantContribution: Number(values.montantContribution) || 0,
      montantDebloque: Number(values.montantDebloque) || 0,
      etatConvention: values.etatConvention,
      dateParticipation: values.dateParticipation || null,
    }

    if (conventionModalMode === 'edit' && editingConvention) {
      dispatch(
        editConventionSpecifique({
          id: editingConvention.idConventionSpecifique,
          idProjet: id,
          payload,
        })
      )
    } else {
      dispatch(addConventionSpecifique(payload))
    }
  }

  const handleConfirmDeleteConvention = () => {
    if (deleteConventionTarget && id) {
      dispatch(removeConventionSpecifique({ id: deleteConventionTarget.idConventionSpecifique, idProjet: id }))
    }
  }

  // ─── Sociétés / marchés ───────────────────────────────────────────────
  const openCreateMarcheModal = () => {
    setMarcheModalMode('create')
    setEditingMarche(null)
    setMarcheModalOpen(true)
  }

  const openEditMarcheModal = (marche: Marche) => {
    setMarcheModalMode('edit')
    setEditingMarche(marche)
    setMarcheModalOpen(true)
  }

  const toMarcheFormValues = (m: Marche): MarcheFormValues => ({
    typeAction: m.typeAction,
    attributaireRealisateur: m.attributaireRealisateur ?? '',
    montantEngage: m.montantEngage != null ? String(m.montantEngage) : '',
    estimation: m.estimation != null ? String(m.estimation) : '',
    avancementPhysique: m.avancementPhysique != null ? String(m.avancementPhysique) : '',
    avancementFinancier: m.avancementFinancier != null ? String(m.avancementFinancier) : '',
    dateDebut: m.dateDebut ?? '',
    dateFin: m.dateFin ?? '',
  })

  const handleMarcheSubmit = (values: MarcheFormValues) => {
    if (!id || !values.typeAction) return
    const payload = {
      idProjet: id,
      typeAction: values.typeAction as TypeAction,
      attributaireRealisateur: values.attributaireRealisateur.trim(),
      montantEngage: values.montantEngage ? Number(values.montantEngage) : null,
      estimation: values.estimation ? Number(values.estimation) : null,
      avancementPhysique: values.avancementPhysique ? Number(values.avancementPhysique) : null,
      avancementFinancier: values.avancementFinancier ? Number(values.avancementFinancier) : null,
      dateDebut: values.dateDebut || null,
      dateFin: values.dateFin || null,
    }

    if (marcheModalMode === 'edit' && editingMarche) {
      dispatch(editMarche({ id: editingMarche.idMarche, idProjet: id, payload }))
    } else {
      dispatch(addMarche(payload))
    }
  }

  const handleConfirmDeleteMarche = () => {
    if (deleteMarcheTarget && id) {
      dispatch(removeMarche({ id: deleteMarcheTarget.idMarche, idProjet: id }))
    }
  }

  return (
    <div className="fiche-container">
      <button className="fiche-back-btn" onClick={() => navigate('/projets')}>
        <ArrowLeft size={14} /> Retour aux Projets
      </button>

      <div className="fiche-header-card">
        <div className="fiche-header-actions">
          <button className="btn-outline" onClick={() => { dispatch(clearProjetsError()); setProjetEditOpen(true) }} aria-label="Modifier le projet">
            <Pencil size={14} />
          </button>
          <button
            className="btn-danger-outline"
            onClick={() => { dispatch(clearProjetsError()); setProjetDeleteOpen(true) }}
            disabled={projetDeleting}
            aria-label="Supprimer le projet"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="fiche-badge-row"><StatutBadge statut={selected.statut} /></div>
        <h1 className="fiche-title">{selected.nom}</h1>

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

      {/* Partenaires associés (Convention Spécifique) */}
      <div className="section-block">
        <div className="section-block__header">
          <p className="section-block__title">
            <Users size={16} style={{ verticalAlign: '-3px', marginRight: 6, color: '#145A8D' }} />
            Partenaires ({conventionsSpecifiques.length})
          </p>
          <button className="btn-primary-solid btn-sm" onClick={openCreateConventionModal}>
            <Plus size={14} /> Associer un Partenaire
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Contribution</th>
                <th>Débloqué</th>
                <th>Date de Participation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conventionsSpecifiques.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">Aucun partenaire associé.</td>
                </tr>
              )}
              {conventionsSpecifiques.map((c) => {
                const partenaireAssocie = partenaires.find((p) => p.idPartenaire === c.idPartenaire)
                return (
                  <tr key={c.idConventionSpecifique}>
                    <td>{partenaireAssocie?.nom ?? '—'}</td>
                    <td>{formatMontant(c.montantContribution)}</td>
                    <td>{formatMontant(c.montantDebloque)}</td>
                    <td>{formatDate(c.dateParticipation)}</td>
                    <td className="row-actions">
                      <button className="icon-btn" onClick={() => openEditConventionModal(c)} aria-label="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => setDeleteConventionTarget(c)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sociétés des marchés */}
      <div className="section-block">
        <div className="section-block__header">
          <p className="section-block__title">
            <Building2 size={16} style={{ verticalAlign: '-3px', marginRight: 6, color: '#C64A11' }} />
            Sociétés des marchés ({marches.length})
          </p>
          <button className="btn-primary-solid btn-sm" onClick={openCreateMarcheModal}>
            <Plus size={14} /> Ajouter une Société
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Société</th>
                <th>Type</th>
                <th>Montant engagé</th>
                <th>Avanc. physique</th>
                <th>Avanc. financier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {marches.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">Aucun marché lié.</td>
                </tr>
              )}
              {marches.map((m) => (
                <tr key={m.idMarche}>
                  <td>{m.attributaireRealisateur ?? '—'}</td>
                  <td><span className="type-tag">{typeActionLabel(m.typeAction)}</span></td>
                  <td>{formatMontant(m.montantEngage)}</td>
                  <td>{m.avancementPhysique != null ? `${m.avancementPhysique}%` : '—'}</td>
                  <td>{m.avancementFinancier != null ? `${m.avancementFinancier}%` : '—'}</td>
                  <td className="row-actions">
                    <button className="icon-btn" onClick={() => openEditMarcheModal(m)} aria-label="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => setDeleteMarcheTarget(m)}
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssocierPartenaireModal
        isOpen={conventionModalOpen}
        isSubmitting={
          conventionModalMode === 'edit'
            ? editConventionSpecifiqueStatus === 'loading'
            : addConventionSpecifiqueStatus === 'loading'
        }
        mode={conventionModalMode}
        partenaires={partenaires}
        initialValues={editingConvention ? toConventionFormValues(editingConvention) : undefined}
        serverError={conventionModalMode === 'edit' ? editConventionSpecifiqueError : addConventionSpecifiqueError}
        onClose={() => setConventionModalOpen(false)}
        onSubmit={handleConventionSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteConventionTarget}
        title="Supprimer l'association"
        message="Êtes-vous sûr de vouloir retirer ce partenaire du projet ? Cette action est irréversible."
        isLoading={deleteConventionSpecifiqueStatus === 'loading'}
        error={deleteConventionSpecifiqueStatus === 'failed' ? deleteConventionSpecifiqueError : null}
        onConfirm={handleConfirmDeleteConvention}
        onCancel={() => setDeleteConventionTarget(null)}
      />

      <AssocierMarcheModal
        isOpen={marcheModalOpen}
        isSubmitting={marcheModalMode === 'edit' ? editMarcheStatus === 'loading' : addMarcheStatus === 'loading'}
        mode={marcheModalMode}
        initialValues={editingMarche ? toMarcheFormValues(editingMarche) : undefined}
        serverError={marcheModalMode === 'edit' ? editMarcheError : addMarcheError}
        onClose={() => setMarcheModalOpen(false)}
        onSubmit={handleMarcheSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteMarcheTarget}
        title="Supprimer le marché"
        message="Êtes-vous sûr de vouloir supprimer ce marché ? Cette action est irréversible."
        isLoading={deleteMarcheStatus === 'loading'}
        error={deleteMarcheStatus === 'failed' ? deleteMarcheError : null}
        onConfirm={handleConfirmDeleteMarche}
        onCancel={() => setDeleteMarcheTarget(null)}
      />

      <ProjetModal
        isOpen={projetEditOpen}
        isSubmitting={projetSubmitting}
        mode="edit"
        initialValues={toProjetFormValues()}
        existingCommuneLabel={`${selected.nomCommune}${selected.nomPrefecture ? ` — ${selected.nomPrefecture}` : ''}`}
        programmes={programmes}
        serverError={projetError}
        onClose={() => setProjetEditOpen(false)}
        onSubmit={handleProjetEditSubmit}
      />

      <ConfirmDialog
        isOpen={projetDeleteOpen}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${selected.nom}" ? Cette action est irréversible.`}
        isLoading={projetDeleting}
        error={projetError}
        onConfirm={handleProjetDelete}
        onCancel={() => setProjetDeleteOpen(false)}
      />
    </div>
  )
}
