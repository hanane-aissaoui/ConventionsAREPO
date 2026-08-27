import axios from "axios"
import { logout } from "../utils/auth"

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8081"}/api`,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  // Seules les routes publiques (login, register) ne doivent pas porter le token :
  // un token expiré/invalide traînant dans le localStorage ferait rejeter la requête
  // par le JwtAuthenticationFilter côté serveur avant même d'atteindre ces routes.
  // "/auth/me" a besoin du token, donc on ne peut pas exclure tout "/auth/".
  const isPublicAuthRoute = /\/auth\/(login|register)(\/|$)/.test(config.url ?? "")
  if (token && !isPublicAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && window.location.pathname !== "/") {
      logout()
      window.location.assign("/")
    }
    return Promise.reject(error)
  }
)

export default axiosClient