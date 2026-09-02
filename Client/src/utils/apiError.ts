import axios from "axios"

/**
 * Message d'erreur à présenter à l'utilisateur.
 *
 * Priorité :
 *  1. le corps texte renvoyé par le backend (ex. 403
 *     « Vous n'avez pas les droits necessaires pour cette action. », 404, 409…) ;
 *  2. un champ `message` si le corps est un objet JSON ;
 *  3. un libellé dédié pour le 403 si le corps est vide ;
 *  4. le `fallback` fourni par l'appelant (erreur réseau, cas non prévu…).
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === "string" && data.trim()) return data.trim()
    if (data && typeof data === "object") {
      const msg = (data as { message?: unknown }).message
      if (typeof msg === "string" && msg.trim()) return msg.trim()
    }
    if (err.response?.status === 403) {
      return "Vous n'avez pas les droits nécessaires pour cette action."
    }
  }
  return fallback
}
