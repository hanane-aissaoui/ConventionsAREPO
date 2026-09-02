import { statutKey, STATUT_LABELS } from "../utils/statut"
import "./StatutBadge.css"

interface StatutBadgeProps {
  statut: string | null | undefined
}

/** Badge du statut d'un projet : Créé / En cours / Terminé. */
export default function StatutBadge({ statut }: StatutBadgeProps) {
  const key = statutKey(statut)
  const label = key === "other" ? statut ?? "—" : STATUT_LABELS[key]
  return <span className={`status-pill status-pill--${key}`}>{label}</span>
}
