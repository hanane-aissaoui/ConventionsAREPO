import axiosClient from "./axiosClient"
import type { ProjetDto, ProjetRequest, PageResponse } from "../types/projet"

export async function fetchProjetsPage(page: number, size: number, search: string): Promise<PageResponse<ProjetDto>> {
  const params: Record<string, string | number> = { page, size }
  if (search.trim() !== "") {
    params.search = search.trim()
  }

  const response = await axiosClient.get<PageResponse<ProjetDto>>("/projets", { params })
  return response.data
}

export async function fetchProjetById(id: string): Promise<ProjetDto> {
  const response = await axiosClient.get<ProjetDto>(`/projets/${id}`)
  return response.data
}

export async function fetchProjetsByProgramme(idProgramme: string): Promise<ProjetDto[]> {
  const response = await axiosClient.get<ProjetDto[]>(`/projets/programme/${idProgramme}`)
  return response.data
}

export async function createProjet(data: ProjetRequest): Promise<ProjetDto> {
  const response = await axiosClient.post<ProjetDto>("/projets", data)
  return response.data
}

export async function updateProjet(id: string, data: ProjetRequest): Promise<ProjetDto> {
  const response = await axiosClient.put<ProjetDto>(`/projets/${id}`, data)
  return response.data
}

export async function deleteProjet(id: string): Promise<void> {
  await axiosClient.delete(`/projets/${id}`)
}

export type { ProjetDto, ProjetRequest }