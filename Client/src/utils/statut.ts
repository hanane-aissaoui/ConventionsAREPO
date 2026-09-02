// Source de vérité unique pour le STATUT d'un projet (Projet.statut côté back,
// chaîne libre). Utilisé par <StatutBadge> et par les graphiques du tableau de bord.

export type StatutKey = "cree" | "encours" | "termine" | "other"

/** Libellé canonique en français (accord au masculin singulier). */
export const STATUT_LABELS: Record<Exclude<StatutKey, "other">, string> = {
  cree: "Créé",
  encours: "En cours",
  termine: "Terminé",
}

/** Couleur associée à chaque statut (badges + parts de camembert). */
export const STATUT_COLORS: Record<StatutKey, string> = {
  cree: "#145A8D",
  encours: "#C64A11",
  termine: "#16803C",
  other: "#9CA3AF",
}

/**
 * Ramène une valeur brute vers une clé stable, en tolérant les accents, la
 * casse et les variantes historiques ("Crée" sans 2e accent, "En cours de...", etc.).
 */
export function statutKey(statut: string | null | undefined): StatutKey {
  if (!statut) return "other"
  const v = statut
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
  if (v.startsWith("cre")) return "cree"
  if (v.startsWith("en cours") || v === "encours") return "encours"
  if (v.startsWith("termin")) return "termine"
  return "other"
}
