import axios from "axios"
import axiosClient from "./axiosClient"

export interface TerritoireNode {
  id: string
  nom: string
  enfants: TerritoireNode[]
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0
    const data = err.response?.data
    const message =
      (typeof data === "string" && data) ||
      (data && typeof data === "object" && "message" in data && String((data as { message: unknown }).message)) ||
      "Une erreur est survenue."
    return new ApiError(status, message)
  }
  return new ApiError(0, "Impossible de contacter le serveur.")
}

export async function fetchHierarchieTerritoriale(): Promise<TerritoireNode[]> {
  try {
    const response = await axiosClient.get<TerritoireNode[]>("/territoire/hierarchie")
    return response.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createRegion(nom: string) {
  try {
    return (await axiosClient.post<TerritoireNode>("/territoire/regions", { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateRegion(id: string, nom: string) {
  try {
    return (await axiosClient.put<TerritoireNode>(`/territoire/regions/${id}`, { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deleteRegion(id: string) {
  try {
    await axiosClient.delete(`/territoire/regions/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createPrefecture(regionId: string, nom: string) {
  try {
    return (await axiosClient.post<TerritoireNode>(`/territoire/regions/${regionId}/prefectures`, { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updatePrefecture(id: string, nom: string) {
  try {
    return (await axiosClient.put<TerritoireNode>(`/territoire/prefectures/${id}`, { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deletePrefecture(id: string) {
  try {
    await axiosClient.delete(`/territoire/prefectures/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createCommune(prefectureId: string, nom: string) {
  try {
    return (await axiosClient.post<TerritoireNode>(`/territoire/prefectures/${prefectureId}/communes`, { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateCommune(id: string, nom: string) {
  try {
    return (await axiosClient.put<TerritoireNode>(`/territoire/communes/${id}`, { nom })).data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deleteCommune(id: string) {
  try {
    await axiosClient.delete(`/territoire/communes/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}