import { Navigate } from "react-router-dom"
import { isTokenValid } from "../utils/auth"

interface PublicOnlyRouteProps {
  children: React.ReactNode
}

// Empêche d'accéder à la page de login si un JWT valide existe déjà
export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  if (isTokenValid()) {
    return <Navigate to="/programmes" replace />
  }
  return <>{children}</>
}