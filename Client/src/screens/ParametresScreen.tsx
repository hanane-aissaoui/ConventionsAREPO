import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, type UserProfile } from "../api/profileApi";
import { MapPin, Handshake, Plus, Pencil, Trash2 } from "lucide-react";
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

export default function ParametresScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { items, status, error: partenairesError, createStatus, editStatus, deleteStatus, deleteError } =
    useAppSelector((state) => state.partenaires);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partenaire | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setProfile)
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, []);

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

  const initials = profile
    ? `${profile.prenom?.[0] ?? ""}${profile.nom?.[0] ?? ""}`.toUpperCase()
    : "";

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
      <h1 className="parametres-title">Paramètres</h1>

      {loading && <p style={{ color: "#9CA3AF", fontSize: 13 }}>Chargement...</p>}
      {error && <p style={{ color: "#C64A11", fontSize: 13 }}>{error}</p>}

      {profile && (
        <>
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <p className="profile-name">
                {profile.prenom} {profile.nom}
                <span className="profile-badge actif">Actif</span>
              </p>
              <p className="profile-role">
                {profile.grade}
                <span className="profile-badge admin">{profile.role}</span>
              </p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-field">
              <div className="info-label">Email</div>
              <div className="info-value">{profile.email}</div>
            </div>
            <div className="info-field">
              <div className="info-label">CIN</div>
              <div className="info-value">{profile.cin}</div>
            </div>
            <div className="info-field">
              <div className="info-label">Téléphone</div>
              <div className="info-value">{profile.telephone}</div>
            </div>
            <div className="info-field">
              <div className="info-label">Grade</div>
              <div className="info-value">{profile.grade}</div>
            </div>
          </div>
        </>
      )}

      <h2 className="section-title">Gestion</h2>
      <div className="actions-buttons">
        <button className="btn-gestion" onClick={() => navigate("/territoire")}>
          <MapPin className="btn-gestion-icon" />
          Gestion des Territoires
        </button>
      </div>

      <div className="section-block" style={{ marginTop: 28 }}>
        <div className="section-block__header">
          <p className="section-block__title">
            <Handshake size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
            Partenaires ({items.length})
          </p>
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
