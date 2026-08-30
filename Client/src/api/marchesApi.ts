import axiosClient from "./axiosClient"
import type { Marche, MarcheCreateRequest } from "../types/marche"

// Tous les marchés, tous projets confondus : pour le dashboard.
export async function getAllMarches(): Promise<Marche[]> {
  const response = await axiosClient.get<Marche[]>("/marches")
  return response.data
}

export async function getMarchesByProjet(idProjet: string): Promise<Marche[]> {
  const response = await axiosClient.get<Marche[]>(`/marches/projet/${idProjet}`)
  return response.data
}

export async function createMarche(payload: MarcheCreateRequest): Promise<Marche> {
  const response = await axiosClient.post<Marche>("/marches", payload)
  return response.data
}

export async function updateMarche(id: string, payload: MarcheCreateRequest): Promise<Marche> {
  const response = await axiosClient.put<Marche>(`/marches/${id}`, payload)
  return response.data
}

export async function deleteMarche(id: string): Promise<void> {
  await axiosClient.delete(`/marches/${id}`)
}
