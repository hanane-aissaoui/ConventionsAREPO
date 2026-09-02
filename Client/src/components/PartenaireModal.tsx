import { useState, useEffect } from "react"
import "./Modal.css"

export interface PartenaireFormValues {
  nom: string
  telephone: string
  email: string
}

interface PartenaireModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  initialValues?: PartenaireFormValues
  /** Message d'erreur renvoyé par le serveur (ex. 403 droits insuffisants). */
  serverError?: string | null
  onClose: () => void
  onSubmit: (values: PartenaireFormValues) => void
}

const emptyForm: PartenaireFormValues = {
  nom: "",
  telephone: "",
  email: "",
}

export default function PartenaireModal({
  isOpen,
  isSubmitting,
  mode,
  initialValues,
  serverError,
  onClose,
  onSubmit,
}: PartenaireModalProps) {
  const [form, setForm] = useState<PartenaireFormValues>(initialValues ?? emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof PartenaireFormValues, string>>>({})

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const sf = (key: keyof PartenaireFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PartenaireFormValues, string>> = {}
    if (!form.nom.trim()) errs.nom = "Requis"
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Adresse email invalide"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === "edit" ? "Modifier le Partenaire" : "Nouveau Partenaire"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Nom du partenaire <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nom du partenaire..."
              value={form.nom}
              onChange={(e) => sf("nom", e.target.value)}
            />
            {errors.nom && <span className="field-error">{errors.nom}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Téléphone</label>
              <input
                type="tel"
                placeholder="Téléphone (optionnel)..."
                value={form.telephone}
                onChange={(e) => sf("telephone", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email (optionnel)..."
                value={form.email}
                onChange={(e) => sf("email", e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>
        </form>

        {serverError && <p className="modal-server-error">{serverError}</p>}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : mode === "edit" ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  )
}
