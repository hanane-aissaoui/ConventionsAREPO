export interface Partenaire {
  idPartenaire: string
  nom: string
  telephone: string | null
  email: string | null
}

export interface PartenaireCreateRequest {
  nom: string
  telephone: string
  email: string
}
