import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logoSrc from "../assets/logo.png"
import bgSrc from "../assets/background.jpg"
import { login, ApiError } from "../api/loginApi"
import Button from "../components/Button"
import FormField from "../components/FormField"
import ErrorBanner from "../components/ErrorBanner"
import "./LoginScreen.css"

export default function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      localStorage.setItem("token", result.token)
      navigate("/programmes")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Impossible de contacter le serveur. Vérifie qu'il tourne bien sur le port 8081.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Panneau gauche - image */}
      <div className="login-image-panel" style={{ backgroundImage: `url(${bgSrc})` }}>
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-accent-bar" />
          <h2 className="login-brand-title">AREPO</h2>
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="login-form-panel">
        <div className="login-form-content">
          <div className="login-header">
            <img src={logoSrc} alt="Armoiries Région de l'Oriental" className="login-logo" />
            <div>
              <div className="login-org-name">Région de l'Oriental</div>
              <div className="login-org-subtitle">Système de Gestion des Conventions</div>
            </div>
          </div>

          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Accédez à votre espace de gestion</p>

          <form onSubmit={handleSubmit} className="login-form">
            <FormField
              label="Adresse Email"
              type="email"
              placeholder="votre.nom@arepo.ma"
              value={email}
              onChange={setEmail}
              required
            />
            <FormField
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            {error && <ErrorBanner message={error} />}

            <Button type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Accès réservé aux agents autorisés de la Région de l'Oriental.
              <br />© {new Date().getFullYear()} — Conseil Régional de l'Oriental
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}