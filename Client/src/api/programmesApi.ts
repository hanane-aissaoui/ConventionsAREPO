import axiosClient from "./axiosClient"
import type { Programme,ProgrammeCreateRequest } from "../types/programme"
import type { PageResponse} from "../types/pageResponce"

export async function getProgrammes({
  page = 0,
  size = 10,
  objet = "",
}: { page?: number; size?: number; objet?: string } = {}): Promise<PageResponse<Programme>> {
  const params: Record<string, string | number> = { page, size }

  if (objet.trim() !== "") {
    params.objet = objet.trim()
  }

  const response = await axiosClient.get<PageResponse<Programme>>("/programmes", { params })
  return response.data
}

export async function getProgrammeById(id: string): Promise<Programme> {
  const response = await axiosClient.get<Programme>(`/programmes/${id}`)
  return response.data
}

export async function createProgramme(payload: ProgrammeCreateRequest): Promise<Programme> {
  const response = await axiosClient.post<Programme>("/programmes", payload)
  return response.data
}

export async function deleteProgramme(id: string): Promise<void> {
  await axiosClient.delete(`/programmes/${id}`)
}
export async function updateProgramme(id: string, payload: ProgrammeCreateRequest): Promise<Programme> {
  const response = await axiosClient.put<Programme>(`/programmes/${id}`, payload)
  return response.data
}

