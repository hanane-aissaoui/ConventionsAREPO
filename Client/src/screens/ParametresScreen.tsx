import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, type UserProfile } from "../api/profileApi";
import { MapPin, Handshake } from "lucide-react";

import "./ParametresScreen.css";
import "./ProgrammeDetail.css";

export default function ParametresScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser()
      .then(setProfile)
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, []);

  const initials = profile
    ? `${profile.prenom?.[0] ?? ""}${profile.nom?.[0] ?? ""}`.toUpperCase()
    : "";

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
        <button className="btn-gestion" onClick={() => navigate("/partenaires")}>
          <Handshake className="btn-gestion-icon" />
          Gestion des Partenaires
        </button>
      </div>
    </div>
  );
}
