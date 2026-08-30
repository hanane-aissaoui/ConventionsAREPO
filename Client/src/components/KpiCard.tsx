import type { LucideIcon } from "lucide-react"
import "./KpiCard.css"

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  sub?: string
  onClick?: () => void
}

export default function KpiCard({ label, value, icon: Icon, color, sub, onClick }: KpiCardProps) {
  return (
    <div
      className={`kpi-card ${onClick ? "kpi-card--clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="kpi-card__icon" style={{ background: `${color}18`, color }}>
        <Icon size={22} />
      </div>
      <div className="kpi-card__body">
        <p className="kpi-card__value">{value}</p>
        <p className="kpi-card__label">{label}</p>
        {sub && <p className="kpi-card__sub">{sub}</p>}
      </div>
    </div>
  )
}
