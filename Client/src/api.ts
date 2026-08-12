const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081"



export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
  
}

export async function login(email: string, motDePasse: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new ApiError(response.status, message || "Échec de la connexion")
  }

  return response.json()
}