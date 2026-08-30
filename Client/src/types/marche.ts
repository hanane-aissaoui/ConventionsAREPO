// Doit rester synchronisé avec Enums.TypeAction côté serveur.
export const TYPE_ACTION_OPTIONS = [
  { value: "TRAVAUX", label: "Travaux" },
  { value: "ETUDES", label: "Études" },
  { value: "EQUIPEMENT", label: "Équipement" },
  { value: "SUIVI_CONTROLE", label: "Suivi & contrôle" },
  { value: "AUTRE", label: "Autre" },
] as const

export type TypeAction = (typeof TYPE_ACTION_OPTIONS)[number]["value"]

export interface Marche {
  idMarche: string
  typeAction: TypeAction
  attributaireRealisateur: string | null
  montantEngage: number | null
  avancementPhysique: number | null
  avancementFinancier: number | null
  estimation: number | null
  dateDebut: string | null
  dateFin: string | null
  idProjet: string
}

export interface MarcheCreateRequest {
  idProjet: string
  typeAction: TypeAction
  attributaireRealisateur: string
  montantEngage: number | null
  avancementPhysique: number | null
  avancementFinancier: number | null
  estimation: number | null
  dateDebut: string | null
  dateFin: string | null
}
