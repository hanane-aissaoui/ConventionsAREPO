import { useLocation, useNavigate, Link } from "react-router-dom"
import { Menu, LogOut } from "lucide-react"
import { logout } from "../utils/auth"
import "./Topbar.css"

// Traduction des segments d'URL vers un libellé lisible dans le fil d'Ariane
const LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  programmes: "Programmes",
  projets: "Projets",
  marches: "Marchés",
  partenaires: "Partenaires",
  conventions: "Conventions",
  territoire: "Territoire",
  agents: "Agents",
  comptes: "Comptes",
  parametres: "Paramètres",
}

interface TopbarProps {
  onMenuClick: () => void
  userName?: string
  userRole?: string
}

export default function Topbar({ onMenuClick, userName = "Utilisateur", userRole = "ADMIN" }: TopbarProps) {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)
  const navigate = useNavigate()

  // Construit le fil d'Ariane : [{ label, path }, ...]
  const crumbs = segments.map((seg, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/")
    const label = LABELS[seg] ?? seg
    return { label, path }
  })

  const handleLogout = () => {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu size={18} />
        </button>

        <nav className="breadcrumb">
          <Link to="/dashboard" className="breadcrumb__item">Accueil</Link>
          {crumbs.map((crumb, i) => (
            <span key={crumb.path} className="breadcrumb__segment">
              <span className="breadcrumb__sep">›</span>
              {i === crumbs.length - 1 ? (
                <span className="breadcrumb__item breadcrumb__item--current">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb__item">{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="topbar__right">
        <div className="topbar__dropdown">
          <button className="topbar__dropdown-item topbar__dropdown-item--danger" onClick={handleLogout}>
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </div>
    </header>
  )
}
