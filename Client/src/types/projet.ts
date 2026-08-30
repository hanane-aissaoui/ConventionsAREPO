export interface ProjetDto {
  idProjet: string
  nom: string
  dateDebut: string | null
  dateFin: string | null
  budgetEstime: number | null
  statut: string | null
  nomProgramme: string
  nomCommune: string
  nomPrefecture: string 
  nbrPartenaire: number
  nbrSociete: number
  idProgramme: string
  idCommune: string
  dateCreation?: string | null
  dateModification?: string | null
  marches?: string[]
  partenaires?: string[]
  avancementPhysiqueMoyen?: number | null
  avancementFinancierMoyen?: number | null
}

export type ProjetRequest = Omit<
  ProjetDto,
  | "idProjet"
  | "nomProgramme"
  | "nomCommune"
  | "nomPrefecture"
  | "nbrPartenaire"
  | "nbrSociete"
  | "marches"
  | "partenaires"
  | "dateCreation"
  | "dateModification"
>

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
