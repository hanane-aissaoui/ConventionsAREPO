import { Navigate } from "react-router-dom"
import { isTokenValid } from "../utils/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}