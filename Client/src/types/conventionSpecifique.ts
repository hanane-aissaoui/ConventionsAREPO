export interface ConventionSpecifique {
  idConventionSpecifique: string
  montantContribution: number | null
  montantDebloque: number | null
  etatConvention: string
  dateParticipation: string | null
  idPartenaire: string
  idProjet: string
}

export interface ConventionSpecifiqueCreateRequest {
  idPartenaire: string
  idProjet: string
  montantContribution: number
  montantDebloque: number
  etatConvention: string
  dateParticipation: string | null
}
