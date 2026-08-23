export interface Programme {
  idProgramme: string
  objet: string
  dateDebut: string | null
  dateFin: string | null
  budgetEstime: number | null
  nbrPartenaire: number
  nbrProjet: number
}
export interface ProgrammeCreateRequest {
  objet: string
  dateDebut: string
  dateFin: string | null
  budgetEstime: number
}


