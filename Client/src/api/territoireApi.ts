import axiosClient from "./axiosClient"

export interface TerritoireNode {
  id: string
  nom: string
  enfants: TerritoireNode[]
}

export async function fetchHierarchieTerritoriale(): Promise<TerritoireNode[]> {
  const response = await axiosClient.get<TerritoireNode[]>("/territoire/hierarchie")
  return response.data
}

export async function createRegion(nom: string) {
  return (await axiosClient.post<TerritoireNode>("/territoire/regions", { nom })).data
}
export async function updateRegion(id: string, nom: string) {
  return (await axiosClient.put<TerritoireNode>(`/territoire/regions/${id}`, { nom })).data
}
export async function deleteRegion(id: string) {
  await axiosClient.delete(`/territoire/regions/${id}`)
}

export async function createPrefecture(regionId: string, nom: string) {
  return (await axiosClient.post<TerritoireNode>(`/territoire/regions/${regionId}/prefectures`, { nom })).data
}
export async function updatePrefecture(id: string, nom: string) {
  return (await axiosClient.put<TerritoireNode>(`/territoire/prefectures/${id}`, { nom })).data
}
export async function deletePrefecture(id: string) {
  await axiosClient.delete(`/territoire/prefectures/${id}`)
}

export async function createCommune(prefectureId: string, nom: string) {
  return (await axiosClient.post<TerritoireNode>(`/territoire/prefectures/${prefectureId}/communes`, { nom })).data
}
export async function updateCommune(id: string, nom: string) {
  return (await axiosClient.put<TerritoireNode>(`/territoire/communes/${id}`, { nom })).data
}
export async function deleteCommune(id: string) {
  await axiosClient.delete(`/territoire/communes/${id}`)
}