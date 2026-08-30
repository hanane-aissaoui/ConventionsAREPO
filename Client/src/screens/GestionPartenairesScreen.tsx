import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Handshake, Plus, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPartenaires,
  addPartenaire,
  editPartenaire,
  removePartenaire,
  resetCreateStatus,
  resetEditStatus,
  resetDeleteStatus,
} from "../store/partenairesSlice";
import PartenaireModal, { type PartenaireFormValues } from "../components/PartenaireModal";
import ConfirmDialog from "../components/ConfirmDialog";
import type { Partenaire } from "../types/partenaire";

import "./ParametresScreen.css";
import "./ProgrammeDetail.css";

export default function GestionPartenairesScreen() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, status, error: partenairesError, createStatus, editStatus, deleteStatus, deleteError } =
    useAppSelector((state) => state.partenaires);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partenaire | null>(null);

  useEffect(() => {
    dispatch(fetchPartenaires());
  }, [dispatch]);

  useEffect(() => {
    if (createStatus === "succeeded") {
      setModalOpen(false);
      dispatch(resetCreateStatus());
    }
  }, [createStatus, dispatch]);

  useEffect(() => {
    if (editStatus === "succeeded") {
      setModalOpen(false);
      setEditingPartenaire(null);
      dispatch(resetEditStatus());
    }
  }, [editStatus, dispatch]);

  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setDeleteTarget(null);
      dispatch(resetDeleteStatus());
    }
  }, [deleteStatus, dispatch]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingPartenaire(null);
    setModalOpen(true);
  };

  const openEditModal = (partenaire: Partenaire) => {
    setModalMode("edit");
    setEditingPartenaire(partenaire);
    setModalOpen(true);
  };

  const handleModalSubmit = (values: PartenaireFormValues) => {
    const payload = {
      nom: values.nom.trim(),
      telephone: values.telephone.trim(),
      email: values.email.trim(),
    };

    if (modalMode === "edit" && editingPartenaire) {
      dispatch(editPartenaire({ id: editingPartenaire.idPartenaire, payload }));
    } else {
      dispatch(addPartenaire(payload));
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      dispatch(removePartenaire(deleteTarget.idPartenaire));
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    dispatch(resetDeleteStatus());
  };

  const toFormValues = (partenaire: Partenaire): PartenaireFormValues => ({
    nom: partenaire.nom,
    telephone: partenaire.telephone ?? "",
    email: partenaire.email ?? "",
  });

  return (
    <div className="parametres-container">
      <button className="btn-back" onClick={() => navigate("/parametres")}>
        <ArrowLeft size={14} /> Retour aux Paramètres
      </button>

      <h1 className="parametres-title">
        <Handshake size={20} style={{ verticalAlign: "-4px", marginRight: 8 }} />
        Gestion des Partenaires
      </h1>

      <div className="section-block" style={{ marginTop: 20 }}>
        <div className="section-block__header">
          <p className="section-block__title">Partenaires ({items.length})</p>
          <button className="btn-primary-solid btn-sm" onClick={openCreateModal}>
            <Plus size={14} /> Nouveau Partenaire
          </button>
        </div>

        {status === "loading" && <p className="parametres-page__state">Chargement...</p>}
        {status === "failed" && (
          <p className="parametres-page__state parametres-page__state--error">Erreur : {partenairesError}</p>
        )}

        {status !== "loading" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">Aucun partenaire enregistré.</td>
                  </tr>
                )}
                {items.map((p) => (
                  <tr
                    key={p.idPartenaire}
                    className="row-clickable"
                    onClick={() => navigate(`/partenaires/${p.idPartenaire}`)}
                  >
                    <td>{p.nom}</td>
                    <td>{p.telephone || "—"}</td>
                    <td>{p.email || "—"}</td>
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => openEditModal(p)} aria-label="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => setDeleteTarget(p)}
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
        )}
      </div>

      <PartenaireModal
        isOpen={modalOpen}
        isSubmitting={modalMode === "edit" ? editStatus === "loading" : createStatus === "loading"}
        mode={modalMode}
        initialValues={editingPartenaire ? toFormValues(editingPartenaire) : undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer le partenaire"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom ?? ""}" ? Cette action est irréversible.`}
        isLoading={deleteStatus === "loading"}
        error={deleteStatus === "failed" ? deleteError : null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
