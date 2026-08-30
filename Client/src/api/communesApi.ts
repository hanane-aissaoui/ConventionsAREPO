import axiosClient from "./axiosClient"
import type { Commune } from "../types/commune"

export async function getAllCommunes(): Promise<Commune[]> {
  const response = await axiosClient.get<Commune[]>("/communes")
  return response.data
}
