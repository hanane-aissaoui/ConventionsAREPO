import "./StatutBadge.css"

interface EtatBadgeProps {
  etat: string | null | undefined
}

// Tolère accents / casse. « Non signée » contient « sign » → on teste « non » d'abord.
function etatKey(etat: string | null | undefined): "signe" | "nonsigne" {
  const v = (etat ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
  if (v.includes("non")) return "nonsigne"
  if (v.includes("sign")) return "signe"
  return "nonsigne"
}

/** Badge de l'état d'une convention (cadre ou spécifique) : Signée / Non signée. */
export default function EtatBadge({ etat }: EtatBadgeProps) {
  const key = etatKey(etat)
  return <span className={`status-pill status-pill--${key}`}>{etat ?? "—"}</span>
}
