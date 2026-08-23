import { Navigate } from "react-router-dom"
import { isTokenValid } from "../utils/auth"

interface PublicOnlyRouteProps {
  children: React.ReactNode
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  if (isTokenValid()) {
    return <Navigate to="/programmes" replace />
  }
  return <>{children}</>
}