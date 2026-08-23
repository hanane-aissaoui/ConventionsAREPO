import axiosClient from "./axiosClient"
import type { ConventionCadre, ConventionCadreCreateRequest } from "../types/conventionCadre"

export async function getConventionsCadreByProgramme(idProgramme: string): Promise<ConventionCadre[]> {
  const response = await axiosClient.get<ConventionCadre[]>(`/conventions-cadre/programme/${idProgramme}`)
  return response.data
}

export async function createConventionCadre(payload: ConventionCadreCreateRequest): Promise<ConventionCadre> {
  const response = await axiosClient.post<ConventionCadre>("/conventions-cadre", payload)
  return response.data
}

export async function updateConventionCadre(
  id: string,
  payload: ConventionCadreCreateRequest
): Promise<ConventionCadre> {
  const response = await axiosClient.put<ConventionCadre>(`/conventions-cadre/${id}`, payload)
  return response.data
}

export async function deleteConventionCadre(id: string): Promise<void> {
  await axiosClient.delete(`/conventions-cadre/${id}`)
}