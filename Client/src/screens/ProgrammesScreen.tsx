import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  fetchProgrammes,
  setSearchTerm,
  addProgramme,
  editProgramme,
  removeProgramme,
  resetCreateStatus,
  resetEditStatus,
  resetDeleteStatus,
} from "../store/programmesSlice"
import ProgrammeCard from "../components/ProgrammeCard"
import Pagination from "../components/Pagination"
import ProgrammeModal, { type ProgrammeFormValues } from "../components/ProgrammeModal"
import ConfirmDialog from "../components/ConfirmDialog"
import type { Programme } from "../types/programme"
import "./ProgrammesScreen.css"

export default function ProgrammesScreen() {
  const dispatch = useAppDispatch()
  const { items, page, totalPages, totalElements, searchTerm, status, error, createStatus, editStatus, deleteStatus } =
    useAppSelector((state) => state.programmes)

  const [inputValue, setInputValue] = useState(searchTerm)
  // Modal création/édition
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null)

  // Dialogue de confirmation de suppression
  const [deleteTarget, setDeleteTarget] = useState<Programme | null>(null)

  useEffect(() => {
    dispatch(fetchProgrammes({ page: 0, objet: searchTerm }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ferme le modal quand la création réussit
  useEffect(() => {
    if (createStatus === "succeeded") {
      setModalOpen(false)
      dispatch(resetCreateStatus())
    }
  }, [createStatus, dispatch])

  // Ferme le modal quand l'édition réussit
  useEffect(() => {
    if (editStatus === "succeeded") {
      setModalOpen(false)
      setEditingProgramme(null)
      dispatch(resetEditStatus())
    }
  }, [editStatus, dispatch])

  // Ferme le dialogue de confirmation quand la suppression réussit
  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setDeleteTarget(null)
      dispatch(resetDeleteStatus())
    }
  }, [deleteStatus, dispatch])

  const handlePageChange = (newPage: number) => {
    dispatch(fetchProgrammes({ page: newPage, objet: searchTerm }))
  }

  const handleSearch = () => {
    dispatch(setSearchTerm(inputValue))
    dispatch(fetchProgrammes({ page: 0, objet: inputValue }))
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  const openCreateModal = () => {
    setModalMode("create")
    setEditingProgramme(null)
    setModalOpen(true)
  }

  const openEditModal = (programme: Programme) => {
    setModalMode("edit")
    setEditingProgramme(programme)
    setModalOpen(true)
  }

  const handleModalSubmit = (values: ProgrammeFormValues) => {
    const payload = {
      objet: values.objet.trim(),
      dateDebut: values.dateDebut,
      dateFin: values.dateFin || null,
      budgetEstime: Number(values.budgetEstime),
    }

    if (modalMode === "edit" && editingProgramme) {
      dispatch(editProgramme({ id: editingProgramme.idProgramme, payload }))
    } else {
      dispatch(addProgramme(payload))
    }
  }

  const handleDeleteClick = (programme: Programme) => {
    setDeleteTarget(programme)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      dispatch(removeProgramme(deleteTarget.idProgramme))
    }
  }

  // Convertit un Programme (venant du backend) en valeurs de formulaire (strings)
  const toFormValues = (programme: Programme): ProgrammeFormValues => ({
    objet: programme.objet,
    dateDebut: programme.dateDebut ?? "",
    dateFin: programme.dateFin ?? "",
    budgetEstime: programme.budgetEstime != null ? String(programme.budgetEstime) : "",
  })

  return (
    <div className="programmes-page">
      <div className="programmes-page__header">
        <div>
          <h1>Programmes</h1>
          <p>{totalElements} programme{totalElements !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          + Nouveau Programme
        </button>
      </div>

      <div className="programmes-page__filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Objet du programme..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="btn-search" onClick={handleSearch}>
            Rechercher
          </button>
        </div>
      </div>

      {status === "loading" && <p className="programmes-page__state">Chargement...</p>}
      {status === "failed" && <p className="programmes-page__state programmes-page__state--error">Erreur : {error}</p>}
      {status === "succeeded" && items.length === 0 && (
        <p className="programmes-page__state">Aucun programme trouvé.</p>
      )}

      <div className="programmes-page__grid">
        {items.map((programme) => (
          <ProgrammeCard
            key={programme.idProgramme}
            programme={programme}
            onEdit={openEditModal}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      <ProgrammeModal
        isOpen={modalOpen}
        isSubmitting={modalMode === "edit" ? editStatus === "loading" : createStatus === "loading"}
        mode={modalMode}
        initialValues={editingProgramme ? toFormValues(editingProgramme) : undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer le programme"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.objet ?? ""}" ? Cette action est irréversible.`}
        isLoading={deleteStatus === "loading"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}