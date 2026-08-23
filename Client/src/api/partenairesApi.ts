import axiosClient from "./axiosClient"
import type { Partenaire } from "../types/partenaire"

export async function getAllPartenaires(): Promise<Partenaire[]> {
  const response = await axiosClient.get<Partenaire[]>("/partenaires")
  return response.data
}