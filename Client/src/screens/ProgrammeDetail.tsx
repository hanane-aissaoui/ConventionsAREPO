import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, Pencil, Trash2, Calendar, DollarSign, Users,
  FolderOpen, Plus, ChevronDown, ChevronRight, MapPin,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  fetchProgrammeById, editProgrammeDetail, removeProgramme, clearProgrammeDetail, resetEditStatus,
  fetchPartenairesList,
  fetchConventionsCadre, addConventionCadre, editConventionCadre, removeConventionCadre,
  resetAddConventionStatus, resetEditConventionStatus, resetDeleteConventionStatus,
  fetchProjets, addProjet, editProjet, removeProjet,
  resetAddProjetStatus, resetEditProjetStatus, resetDeleteProjetStatus,
} from "../store/programmesDetailSlice"
import ProgrammeModal, { type ProgrammeFormValues } from "../components/ProgrammeModal"
import ConfirmDialog from "../components/ConfirmDialog"
import AssocierPartenaireModal, { type ConventionFormValues } from "../components/AssocierPartenaireModal"
import ProjetModal, { type ProjetFormValues } from "../components/ProjetModal"
import StatutBadge from "../components/StatutBadge"
import EtatBadge from "../components/EtatBadge"
import type { ConventionCadre } from "../types/conventionCadre"
import type { ProjetDto } from "../types/projet"
import "./ProgrammeDetail.css"

function formatMontant(montant: number | null): string {
  if (montant == null) return "—"
  return `${montant.toLocaleString("fr-FR")} MAD`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

// Regroupe les projets par nomPrefecture (province/préfecture)
function groupProjetsByPrefecture(projets: ProjetDto[]) {
  const map = new Map<string, ProjetDto[]>()
  for (const p of projets) {
    const key = p.nomPrefecture?.trim() || "Non renseignée"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).map(([nomPrefecture, items]) => ({ nomPrefecture, projets: items }))
}

function ProvinceProjetsGroup({
  nomPrefecture, projets, onAddProjet, onEditProjet, onDeleteProjet, onRowClick,
}: {
  nomPrefecture: string
  projets: ProjetDto[]
  onAddProjet: () => void
  onEditProjet: (p: ProjetDto) => void
  onDeleteProjet: (p: ProjetDto) => void
  onRowClick: (p: ProjetDto) => void
}) {
  const [open, setOpen] = useState(false) // fermé par défaut à l'ouverture de la page

  return (
    <div className="province-group">
      <div className="province-group__header">
        <button className="province-group__toggle" onClick={() => setOpen((o) => !o)} aria-label={open ? "Fermer la province" : "Ouvrir la province"}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <MapPin size={15} className="province-group__pin" />
        <span className="province-group__title">{nomPrefecture}</span>
        <span className="province-group__count">{projets.length} projet{projets.length > 1 ? "s" : ""}</span>
      </div>

      {open && (
        <div className="table-container table-container--projets">
          <table className="projets-table">
            <thead>
              <tr><th>Nom du Projet</th><th>Période</th><th>Budget</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {projets.map((p) => (
                <tr key={p.idProjet} className="row-clickable" onClick={() => onRowClick(p)}>
                  <td className="cell-nom">{p.nom}</td>
                  <td className="projet-periode">{formatDate(p.dateDebut)} → {formatDate(p.dateFin)}</td>
                  <td className="projet-budget">{formatMontant(p.budgetEstime)}</td>
                  <td><StatutBadge statut={p.statut} /></td>
                  <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn" onClick={() => onEditProjet(p)} aria-label="Modifier"><Pencil size={14} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => onDeleteProjet(p)} aria-label="Supprimer"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ProgrammeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    current: programme, status, error, editStatus, editError, deleteStatus, deleteError,
    partenaires, conventionsCadre,
    addConventionStatus, addConventionError, editConventionStatus, editConventionError,
    deleteConventionStatus, deleteConventionError,
    projets,
    addProjetStatus, addProjetError, editProjetStatus, editProjetError,
    deleteProjetStatus, deleteProjetError,
  } = useAppSelector((state) => state.programmeDetail)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [conventionModalOpen, setConventionModalOpen] = useState(false)
  const [conventionModalMode, setConventionModalMode] = useState<"create" | "edit">("create")
  const [editingConvention, setEditingConvention] = useState<ConventionCadre | null>(null)
  const [deleteConventionTarget, setDeleteConventionTarget] = useState<ConventionCadre | null>(null)

  const [projetModalOpen, setProjetModalOpen] = useState(false)
  const [editingProjet, setEditingProjet] = useState<ProjetDto | null>(null)
  const [deleteProjetTarget, setDeleteProjetTarget] = useState<ProjetDto | null>(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchProgrammeById(id))
      dispatch(fetchConventionsCadre(id))
      dispatch(fetchPartenairesList())
      dispatch(fetchProjets(id))
    }
    return () => { dispatch(clearProgrammeDetail()) }
  }, [id, dispatch])

  useEffect(() => {
    if (editStatus === "succeeded") { setEditModalOpen(false); dispatch(resetEditStatus()) }
  }, [editStatus, dispatch])

  useEffect(() => {
    if (deleteStatus === "succeeded") navigate("/programmes")
  }, [deleteStatus, navigate])

  useEffect(() => {
    if (addConventionStatus === "succeeded") { setConventionModalOpen(false); dispatch(resetAddConventionStatus()) }
  }, [addConventionStatus, dispatch])

  useEffect(() => {
    if (editConventionStatus === "succeeded") {
      setConventionModalOpen(false)
      setEditingConvention(null)
      dispatch(resetEditConventionStatus())
    }
  }, [editConventionStatus, dispatch])

  useEffect(() => {
    if (deleteConventionStatus === "succeeded") { setDeleteConventionTarget(null); dispatch(resetDeleteConventionStatus()) }
  }, [deleteConventionStatus, dispatch])

  useEffect(() => {
    if (addProjetStatus === "succeeded") {
      setProjetModalOpen(false)
      setEditingProjet(null)
      dispatch(resetAddProjetStatus())
    }
  }, [addProjetStatus, dispatch])

  useEffect(() => {
    if (editProjetStatus === "succeeded") {
      setProjetModalOpen(false)
      setEditingProjet(null)
      dispatch(resetEditProjetStatus())
    }
  }, [editProjetStatus, dispatch])

  useEffect(() => {
    if (deleteProjetStatus === "succeeded") { setDeleteProjetTarget(null); dispatch(resetDeleteProjetStatus()) }
  }, [deleteProjetStatus, dispatch])

  const handleEditSubmit = (values: ProgrammeFormValues) => {
    if (!id) return
    dispatch(editProgrammeDetail({
      id,
      payload: {
        objet: values.objet.trim(),
        dateDebut: values.dateDebut,
        dateFin: values.dateFin || null,
        budgetEstime: Number(values.budgetEstime),
      },
    }))
  }

  const handleConfirmDelete = () => { if (id) dispatch(removeProgramme(id)) }

  const openCreateConventionModal = () => {
    setConventionModalMode("create")
    setEditingConvention(null)
    setConventionModalOpen(true)
  }

  const openEditConventionModal = (convention: ConventionCadre) => {
    setConventionModalMode("edit")
    setEditingConvention(convention)
    setConventionModalOpen(true)
  }

  const handleConventionSubmit = (values: ConventionFormValues) => {
    if (!id) return
    const payload = {
      idPartenaire: values.idPartenaire,
      idProgramme: id,
      montantContribution: Number(values.montantContribution) || 0,
      montantDebloque: Number(values.montantDebloque) || 0,
      etatConvention: values.etatConvention,
      dateParticipation: values.dateParticipation || null,
    }
    if (conventionModalMode === "edit" && editingConvention) {
      dispatch(editConventionCadre({ id: editingConvention.idConventionCadre, idProgramme: id, payload }))
    } else {
      dispatch(addConventionCadre(payload))
    }
  }

  const handleDeleteConventionClick = (convention: ConventionCadre) => setDeleteConventionTarget(convention)

  const handleConfirmDeleteConvention = () => {
    if (deleteConventionTarget && id) {
      dispatch(removeConventionCadre({ id: deleteConventionTarget.idConventionCadre, idProgramme: id }))
    }
  }

  const toConventionFormValues = (c: ConventionCadre): ConventionFormValues => ({
    idPartenaire: c.idPartenaire,
    etatConvention: c.etatConvention,
    montantContribution: c.montantContribution != null ? String(c.montantContribution) : "",
    montantDebloque: c.montantDebloque != null ? String(c.montantDebloque) : "",
    dateParticipation: c.dateParticipation ?? "",
  })

  // ---- Projets ----

  const openCreateProjetModal = () => { setEditingProjet(null); setProjetModalOpen(true) }
  const openEditProjetModal = (p: ProjetDto) => { setEditingProjet(p); setProjetModalOpen(true) }

  const handleProjetSubmit = (values: ProjetFormValues) => {
    if (!id) return
    const payload = {
      nom: values.nom.trim(),
      idProgramme: id,
      idCommune: values.idCommune,
      dateDebut: values.dateDebut,
      dateFin: values.dateFin || null,
      budgetEstime: values.budgetEstime ? Number(values.budgetEstime) : null,
      statut: values.statut,
      nomPrefecture: "",
    }
    if (editingProjet) {
      dispatch(editProjet({ id: editingProjet.idProjet, idProgramme: id, payload }))
    } else {
      dispatch(addProjet(payload))
    }
  }

  const handleDeleteProjetClick = (p: ProjetDto) => setDeleteProjetTarget(p)

  const handleConfirmDeleteProjet = () => {
    if (deleteProjetTarget && id) dispatch(removeProjet({ id: deleteProjetTarget.idProjet, idProgramme: id }))
  }

  const toProjetFormValues = (p: ProjetDto): ProjetFormValues => ({
    nom: p.nom,
    idProgramme: p.idProgramme,
    idCommune: p.idCommune,
    dateDebut: p.dateDebut ?? "",
    dateFin: p.dateFin ?? "",
    budgetEstime: p.budgetEstime != null ? String(p.budgetEstime) : "",
    statut: p.statut ?? "",
  })

  if (status === "loading") {
    return <div className="programme-detail"><p className="programme-detail__state">Chargement...</p></div>
  }

  if (status === "failed" || !programme) {
    return (
      <div className="programme-detail">
        <p className="programme-detail__state programme-detail__state--error">
          {error ?? "Programme introuvable."}
        </p>
      </div>
    )
  }

  const groupesProjets = groupProjetsByPrefecture(projets)

  return (
    <div className="programme-detail">
      <button className="back-link" onClick={() => navigate("/programmes")}>
        <ArrowLeft size={14} /> Retour aux Programmes
      </button>

      <div className="detail-card">
        <div className="detail-card__top">
          <h1 className="detail-card__title">{programme.objet}</h1>
          <div className="detail-card__actions">
            <button className="btn-outline" onClick={() => setEditModalOpen(true)}><Pencil size={14} /></button>
            <button className="btn-danger-outline" onClick={() => setDeleteDialogOpen(true)} disabled={deleteStatus === "loading"}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="detail-card__stats">
          <div className="stat-box">
            <Calendar size={16} className="stat-box__icon" style={{ color: "#145A8D" }} />
            <p className="stat-box__label">Date de début</p>
            <p className="stat-box__value">{formatDate(programme.dateDebut)}</p>
          </div>
          <div className="stat-box">
            <Calendar size={16} className="stat-box__icon" style={{ color: "#C64A11" }} />
            <p className="stat-box__label">Date de fin</p>
            <p className="stat-box__value">{formatDate(programme.dateFin)}</p>
          </div>
          <div className="stat-box">
            <DollarSign size={16} className="stat-box__icon" style={{ color: "#0E630E" }} />
            <p className="stat-box__label">Budget estimé</p>
            <p className="stat-box__value">{formatMontant(programme.budgetEstime)}</p>
          </div>
          <div className="stat-box">
            <Users size={16} className="stat-box__icon" style={{ color: "#145A8D" }} />
            <p className="stat-box__label">Partenaires</p>
            <p className="stat-box__value">{programme.nbrPartenaire}</p>
          </div>
        </div>
      </div>

      {/* Partenaires / Conventions Cadre */}
      <div className="section-block">
        <div className="section-block__header">
          <p className="section-block__title">Partenaires ({conventionsCadre.length})</p>
          <button className="btn-primary-solid btn-sm" onClick={openCreateConventionModal}>
            <Plus size={14} /> Associer un Partenaire
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Partenaire</th><th>Contribution</th><th>Débloqué</th><th>Date de Participation</th><th>État</th><th></th></tr>
            </thead>
            <tbody>
              {conventionsCadre.length === 0 && (
                <tr><td colSpan={6} className="empty-state">Aucune convention.</td></tr>
              )}
              {conventionsCadre.map((c) => {
                const partenaireAssocie = partenaires.find((p) => p.idPartenaire === c.idPartenaire)
                return (
                  <tr key={c.idConventionCadre}>
                    <td>{partenaireAssocie?.nom ?? "—"}</td>
                    <td>{formatMontant(c.montantContribution)}</td>
                    <td>{formatMontant(c.montantDebloque)}</td>
                    <td>{formatDate(c.dateParticipation)}</td>
                    <td><EtatBadge etat={c.etatConvention} /></td>
                    <td className="row-actions">
                      <button className="icon-btn" onClick={() => openEditConventionModal(c)} aria-label="Modifier"><Pencil size={14} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDeleteConventionClick(c)} aria-label="Supprimer"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projets par Province */}
      <div className="section-block">
        <div className="section-block__header">
          <div className="section-block__title-group">
            <p className="section-block__title">Projets ({projets.length})</p>
            <p className="section-block__subtitle">
              {groupesProjets.length} province{groupesProjets.length > 1 ? "s" : ""} concernée{groupesProjets.length > 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn-primary-solid btn-sm" onClick={openCreateProjetModal}>
            <Plus size={14} /> Ajouter un Projet
          </button>
        </div>

        {groupesProjets.length === 0 ? (
          <div className="table-container">
            <table>
              <tbody>
                <tr>
                  <td className="empty-state">
                    <FolderOpen size={16} style={{ marginBottom: 6 }} /><br />
                    Aucun projet associé à ce programme.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          groupesProjets.map((groupe) => (
            <ProvinceProjetsGroup
              key={groupe.nomPrefecture}
              nomPrefecture={groupe.nomPrefecture}
              projets={groupe.projets}
              onAddProjet={openCreateProjetModal}
              onEditProjet={openEditProjetModal}
              onDeleteProjet={handleDeleteProjetClick}
              onRowClick={(p) => navigate(`/projets/${p.idProjet}`)}
            />
          ))
        )}
      </div>

      <ProgrammeModal
        isOpen={editModalOpen}
        isSubmitting={editStatus === "loading"}
        mode="edit"
        initialValues={{
          objet: programme.objet,
          dateDebut: programme.dateDebut ?? "",
          dateFin: programme.dateFin ?? "",
          budgetEstime: programme.budgetEstime != null ? String(programme.budgetEstime) : "",
        }}
        serverError={editError}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Supprimer le programme"
        message={`Êtes-vous sûr de vouloir supprimer "${programme.objet}" ? Cette action est irréversible.`}
        isLoading={deleteStatus === "loading"}
        error={deleteStatus === "failed" ? deleteError : null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <AssocierPartenaireModal
        isOpen={conventionModalOpen}
        isSubmitting={conventionModalMode === "edit" ? editConventionStatus === "loading" : addConventionStatus === "loading"}
        mode={conventionModalMode}
        partenaires={partenaires}
        initialValues={editingConvention ? toConventionFormValues(editingConvention) : undefined}
        serverError={conventionModalMode === "edit" ? editConventionError : addConventionError}
        onClose={() => setConventionModalOpen(false)}
        onSubmit={handleConventionSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteConventionTarget}
        title="Supprimer la convention"
        message="Êtes-vous sûr de vouloir supprimer cette convention ? Cette action est irréversible."
        isLoading={deleteConventionStatus === "loading"}
        error={deleteConventionStatus === "failed" ? deleteConventionError : null}
        onConfirm={handleConfirmDeleteConvention}
        onCancel={() => setDeleteConventionTarget(null)}
      />

      <ProjetModal
        isOpen={projetModalOpen}
        isSubmitting={editingProjet ? editProjetStatus === "loading" : addProjetStatus === "loading"}
        mode={editingProjet ? "edit" : "create"}
        initialValues={editingProjet ? toProjetFormValues(editingProjet) : undefined}
        existingCommuneLabel={editingProjet ? `${editingProjet.nomCommune} — ${editingProjet.nomPrefecture}` : undefined}
        serverError={editingProjet ? editProjetError : addProjetError}
        onClose={() => { setProjetModalOpen(false); setEditingProjet(null) }}
        onSubmit={handleProjetSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteProjetTarget}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteProjetTarget?.nom}" ? Cette action est irréversible.`}
        isLoading={deleteProjetStatus === "loading"}
        error={deleteProjetStatus === "failed" ? deleteProjetError : null}
        onConfirm={handleConfirmDeleteProjet}
        onCancel={() => setDeleteProjetTarget(null)}
      />
    </div>
  )
}