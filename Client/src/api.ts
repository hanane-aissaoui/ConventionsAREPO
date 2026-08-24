import axios from "axios"
import axiosClient from "./api/axiosClient"

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function login(email: string, motDePasse: string) {
  try {
    const response = await axiosClient.post("/auth/login", { email, motDePasse })
    return response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0
      const data = err.response?.data
      const message =
        (typeof data === "string" && data) ||
        (data && typeof data === "object" && "message" in data && String((data as { message: unknown }).message)) ||
        "Échec de la connexion"
      throw new ApiError(status, message)
    }
    throw err
  }
}
