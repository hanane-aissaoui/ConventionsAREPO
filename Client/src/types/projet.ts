export interface ProjetDto {
  idProjet: string
  nom: string
  dateDebut: string | null
  dateFin: string | null
  budgetEstime: number | null
  statut: string | null
  nomProgramme: string
  nomCommune: string
  nbrPartenaire: number
  nbrSociete: number
  idProgramme: string
  idCommune: string
  marches?: string[]
  partenaires?: string[]
  avancementPhysiqueMoyen?: number | null
  avancementFinancierMoyen?: number | null
}

export type ProjetRequest = Omit<
  ProjetDto,
  "idProjet" | "nomProgramme" | "nomCommune" | "nbrPartenaire" | "nbrSociete" | "marches" | "partenaires"
>

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
