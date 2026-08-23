import { NavLink } from "react-router-dom"
import {
  LayoutGrid, FolderOpen, Briefcase, ShoppingCart, Handshake,
  FileText, MapPin, Users, CreditCard, Settings, X,
} from "lucide-react"
import logoSrc from "../assets/logo.png"
import "./Sidebar.css"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutGrid },
  { to: "/programmes", label: "Programmes", icon: FolderOpen },
  { to: "/projets", label: "Projets", icon: Briefcase },
  { to: "/parametres", label: "Paramètres", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">
  <img src={logoSrc} alt="Logo" className="sidebar__brand-logo-img" />
</span>
        <div>
          <p className="sidebar__brand-title">Région de l'Oriental</p>
          <p className="sidebar__brand-subtitle">Système de Gestion</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar__close" onClick={onClose} aria-label="Fermer le menu">
        <X size={16} />
      </button>
    </aside>
  )
}