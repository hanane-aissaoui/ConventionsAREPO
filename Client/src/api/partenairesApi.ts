import axiosClient from "./axiosClient"
import type { Partenaire, PartenaireCreateRequest } from "../types/partenaire"

export async function getAllPartenaires(): Promise<Partenaire[]> {
  const response = await axiosClient.get<Partenaire[]>("/partenaires")
  return response.data
}

export async function getPartenaireById(id: string): Promise<Partenaire> {
  const response = await axiosClient.get<Partenaire>(`/partenaires/${id}`)
  return response.data
}

export async function createPartenaire(payload: PartenaireCreateRequest): Promise<Partenaire> {
  const response = await axiosClient.post<Partenaire>("/partenaires", payload)
  return response.data
}

export async function updatePartenaire(id: string, payload: PartenaireCreateRequest): Promise<Partenaire> {
  const response = await axiosClient.put<Partenaire>(`/partenaires/${id}`, payload)
  return response.data
}

export async function deletePartenaire(id: string): Promise<void> {
  await axiosClient.delete(`/partenaires/${id}`)
}
