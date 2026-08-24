import axios from "axios"
import { logout } from "../utils/auth"

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8081"}/api`,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  // On n'attache jamais le token sur les routes d'authentification (login, etc.) :
  // un token expiré/invalide traînant dans le localStorage ferait rejeter la requête
  // par le JwtAuthenticationFilter côté serveur avant même d'atteindre /api/auth/**.
  const isAuthRoute = config.url?.includes("/auth/")
  if (token && !isAuthRoute) {
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
