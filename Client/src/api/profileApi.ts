import axiosClient from "./axiosClient"
import type { UserProfile } from "../types/profile"

export async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await axiosClient.get<UserProfile>("/auth/me")
  return response.data
}

export type { UserProfile }