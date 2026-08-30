import axiosClient from "./axiosClient"
import type { ConventionSpecifique, ConventionSpecifiqueCreateRequest } from "../types/conventionSpecifique"

// Toutes les conventions spécifiques, tous projets confondus : pour le dashboard.
export async function getAllConventionsSpecifiques(): Promise<ConventionSpecifique[]> {
  const response = await axiosClient.get<ConventionSpecifique[]>("/conventions-specifiques")
  return response.data
}

export async function getConventionsSpecifiquesByProjet(idProjet: string): Promise<ConventionSpecifique[]> {
  const response = await axiosClient.get<ConventionSpecifique[]>(`/conventions-specifiques/projet/${idProjet}`)
  return response.data
}

export async function createConventionSpecifique(
  payload: ConventionSpecifiqueCreateRequest
): Promise<ConventionSpecifique> {
  const response = await axiosClient.post<ConventionSpecifique>("/conventions-specifiques", payload)
  return response.data
}

export async function updateConventionSpecifique(
  id: string,
  payload: ConventionSpecifiqueCreateRequest
): Promise<ConventionSpecifique> {
  const response = await axiosClient.put<ConventionSpecifique>(`/conventions-specifiques/${id}`, payload)
  return response.data
}

export async function deleteConventionSpecifique(id: string): Promise<void> {
  await axiosClient.delete(`/conventions-specifiques/${id}`)
}
