import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Pencil, Download, Trash2, Calendar, DollarSign, Users, FolderOpen, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  fetchProgrammeById,
  editProgrammeDetail,
  removeProgramme,
  clearProgrammeDetail,
  resetEditStatus,
  fetchPartenairesList,
  fetchConventionsCadre,
  addConventionCadre,
  editConventionCadre,
  removeConventionCadre,
  resetAddConventionStatus,
  resetEditConventionStatus,
  resetDeleteConventionStatus,
} from "../store/programmesDetailSlice"
import ProgrammeModal, { type ProgrammeFormValues } from "../components/ProgrammeModal"
import ConfirmDialog from "../components/ConfirmDialog"
import AssocierPartenaireModal, { type ConventionFormValues } from "../components/AssocierPartenaireModal"
import type { ConventionCadre } from "../types/conventionCadre"
import "./ProgrammeDetail.css"

function formatMontant(montant: number | null): string {
  if (montant == null) return "—"
  return `${montant.toLocaleString("fr-FR")} MAD`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function ProgrammeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    current: programme,
    status,
    error,
    editStatus,
    deleteStatus,
    partenaires,
    conventionsCadre,
    addConventionStatus,
    editConventionStatus,
    deleteConventionStatus,
  } = useAppSelector((state) => state.programmeDetail)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [conventionModalOpen, setConventionModalOpen] = useState(false)
  const [conventionModalMode, setConventionModalMode] = useState<"create" | "edit">("create")
  const [editingConvention, setEditingConvention] = useState<ConventionCadre | null>(null)

  const [deleteConventionTarget, setDeleteConventionTarget] = useState<ConventionCadre | null>(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchProgrammeById(id))
      dispatch(fetchConventionsCadre(id))
      dispatch(fetchPartenairesList())
    }
    return () => {
      dispatch(clearProgrammeDetail())
    }
  }, [id, dispatch])

  useEffect(() => {
    if (editStatus === "succeeded") {
      setEditModalOpen(false)
      dispatch(resetEditStatus())
    }
  }, [editStatus, dispatch])

  useEffect(() => {
    if (deleteStatus === "succeeded") {
      navigate("/programmes")
    }
  }, [deleteStatus, navigate])

  useEffect(() => {
    if (addConventionStatus === "succeeded") {
      setConventionModalOpen(false)
      dispatch(resetAddConventionStatus())
    }
  }, [addConventionStatus, dispatch])

  useEffect(() => {
    if (editConventionStatus === "succeeded") {
      setConventionModalOpen(false)
      setEditingConvention(null)
      dispatch(resetEditConventionStatus())
    }
  }, [editConventionStatus, dispatch])

  useEffect(() => {
    if (deleteConventionStatus === "succeeded") {
      setDeleteConventionTarget(null)
      dispatch(resetDeleteConventionStatus())
    }
  }, [deleteConventionStatus, dispatch])

  const handleEditSubmit = (values: ProgrammeFormValues) => {
    if (!id) return
    dispatch(
      editProgrammeDetail({
        id,
        payload: {
          objet: values.objet.trim(),
          dateDebut: values.dateDebut,
          dateFin: values.dateFin || null,
          budgetEstime: Number(values.budgetEstime),
        },
      })
    )
  }

  const handleConfirmDelete = () => {
    if (id) dispatch(removeProgramme(id))
  }

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
      dispatch(
        editConventionCadre({
          id: editingConvention.idConventionCadre,
          idProgramme: id,
          payload,
        })
      )
    } else {
      dispatch(addConventionCadre(payload))
    }
  }

  const handleDeleteConventionClick = (convention: ConventionCadre) => {
    setDeleteConventionTarget(convention)
  }

  const handleConfirmDeleteConvention = () => {
    if (deleteConventionTarget && id) {
      dispatch(removeConventionCadre({ id: deleteConventionTarget.idConventionCadre, idProgramme: id }))
    }
  }

  // Convertit une ConventionCadre en valeurs de formulaire (strings) pour pré-remplir l'édition
  const toConventionFormValues = (c: ConventionCadre): ConventionFormValues => ({
    idPartenaire: c.idPartenaire,
    etatConvention: c.etatConvention,
    montantContribution: c.montantContribution != null ? String(c.montantContribution) : "",
    montantDebloque: c.montantDebloque != null ? String(c.montantDebloque) : "",
    dateParticipation: c.dateParticipation ?? "",
  })

  if (status === "loading") {
    return (
      <div className="programme-detail">
        <p className="programme-detail__state">Chargement...</p>
      </div>
    )
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

  return (
    <div className="programme-detail">
      <button className="back-link" onClick={() => navigate("/programmes")}>
        <ArrowLeft size={14} /> Retour aux Programmes
      </button>

      <div className="detail-card">
        <div className="detail-card__top">
          <div>
            <h1 className="detail-card__title">{programme.objet}</h1>
          </div>

          <div className="detail-card__actions">
            <button className="btn-outline" onClick={() => setEditModalOpen(true)}>
              <Pencil size={14} />
            </button>
           {/* <button className="btn-primary-solid">
              <Download size={14} /> Exporter
            </button>*/}
            <button
              className="btn-danger-outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteStatus === "loading"}
            >
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
              <tr>
                <th>Partenaire</th>
                <th>Contribution</th>
                <th>Débloqué</th>
                <th>Date de Participation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conventionsCadre.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">Aucune convention.</td>
                </tr>
              )}
              {conventionsCadre.map((c) => {
                const partenaireAssocie = partenaires.find((p) => p.idPartenaire === c.idPartenaire)
                return (
                  <tr key={c.idConventionCadre}>
                    <td>{partenaireAssocie?.nom ?? "—"}</td>
                    <td>{formatMontant(c.montantContribution)}</td>
                    <td>{formatMontant(c.montantDebloque)}</td>
                    <td>{formatDate(c.dateParticipation)}</td>
                    <td className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => openEditConventionModal(c)}
                        aria-label="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => handleDeleteConventionClick(c)}
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

      {/* Projets */}
      <div className="section-block">
        <div className="section-block__header">
          <p className="section-block__title">Projets ({programme.nbrProjet})</p>
        </div>
        <div className="table-container table-container--projets">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du Projet</th>
                <th>Période</th>
                <th>Budget</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="empty-state">
                  <FolderOpen size={16} style={{ marginBottom: 6 }} />
                  <br />
                  Aucun projet associé à ce programme.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Supprimer le programme"
        message={`Êtes-vous sûr de vouloir supprimer "${programme.objet}" ? Cette action est irréversible.`}
        isLoading={deleteStatus === "loading"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <AssocierPartenaireModal
        isOpen={conventionModalOpen}
        isSubmitting={conventionModalMode === "edit" ? editConventionStatus === "loading" : addConventionStatus === "loading"}
        mode={conventionModalMode}
        partenaires={partenaires}
        initialValues={editingConvention ? toConventionFormValues(editingConvention) : undefined}
        onClose={() => setConventionModalOpen(false)}
        onSubmit={handleConventionSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteConventionTarget}
        title="Supprimer la convention"
        message="Êtes-vous sûr de vouloir supprimer cette convention ? Cette action est irréversible."
        isLoading={deleteConventionStatus === "loading"}
        onConfirm={handleConfirmDeleteConvention}
        onCancel={() => setDeleteConventionTarget(null)}
      />
    </div>
  )
}