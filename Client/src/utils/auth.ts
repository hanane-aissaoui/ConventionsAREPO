function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payloadBase64 = token.split(".")[1]
    const decoded = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isTokenValid(): boolean {
  const token = localStorage.getItem("token")
  if (!token) return false

  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false

  const isExpired = Date.now() >= payload.exp * 1000
  return !isExpired
}

export function logout(): void {
  localStorage.removeItem("token")
}