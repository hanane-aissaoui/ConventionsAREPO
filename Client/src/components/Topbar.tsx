import { useLocation, useNavigate, Link } from "react-router-dom"
import { Menu, LogOut } from "lucide-react"
import { logout } from "../utils/auth"
import { useAppSelector } from "../store/hooks"
import "./Topbar.css"

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface TopbarProps {
  onMenuClick: () => void
  userName?: string
  userRole?: string
}

export default function Topbar({ onMenuClick, userName = "Utilisateur", userRole = "ADMIN" }: TopbarProps) {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)
  const navigate = useNavigate()

  const programmeDetail = useAppSelector((state) => state.programmeDetail.current)
  const projetDetail = useAppSelector((state) => state.projets.selected)

  const crumbs = segments
    .map((seg, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/")
      const isId = UUID_REGEX.test(seg)

      let label = LABELS[seg] ?? seg

      if (isId) {
        const parentSegment = segments[index - 1]
        if (parentSegment === "programmes" && programmeDetail?.idProgramme === seg) {
          label = programmeDetail.objet
        } else if (parentSegment === "projets" && projetDetail?.idProjet === seg) {
          label = projetDetail.nom
        } else {
          return null // UUID pas encore chargé en mémoire -> segment masqué
        }
      }

      return { label, path }
    })
    .filter((crumb): crumb is { label: string; path: string } => crumb !== null)

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