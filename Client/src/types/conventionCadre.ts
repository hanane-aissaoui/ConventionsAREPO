export interface ConventionCadre {
  idConventionCadre: string
  montantContribution: number | null
  montantDebloque: number | null
  etatConvention: string
  dateParticipation: string | null
  idPartenaire: string   // ← juste l'UUID, plus d'objet imbriqué
  idProgramme: string
}

export interface ConventionCadreCreateRequest {
  idPartenaire: string
  idProgramme: string
  montantContribution: number
  montantDebloque: number
  etatConvention: string
  dateParticipation: string | null
}