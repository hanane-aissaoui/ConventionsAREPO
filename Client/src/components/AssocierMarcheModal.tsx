import { useState, useEffect } from "react"
import { TYPE_ACTION_OPTIONS, type TypeAction } from "../types/marche"
import "./Modal.css"

export interface MarcheFormValues {
  typeAction: TypeAction | ""
  attributaireRealisateur: string
  montantEngage: string
  estimation: string
  avancementPhysique: string
  avancementFinancier: string
  dateDebut: string
  dateFin: string
}

interface AssocierMarcheModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  initialValues?: MarcheFormValues
  /** Message d'erreur renvoyé par le serveur (ex. 403 droits insuffisants). */
  serverError?: string | null
  onClose: () => void
  onSubmit: (values: MarcheFormValues) => void
}

const emptyForm: MarcheFormValues = {
  typeAction: "",
  attributaireRealisateur: "",
  montantEngage: "",
  estimation: "",
  avancementPhysique: "",
  avancementFinancier: "",
  dateDebut: "",
  dateFin: "",
}

export default function AssocierMarcheModal({
  isOpen,
  isSubmitting,
  mode,
  initialValues,
  serverError,
  onClose,
  onSubmit,
}: AssocierMarcheModalProps) {
  const [form, setForm] = useState<MarcheFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof MarcheFormValues, string>>>({})

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const sf = (key: keyof MarcheFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof MarcheFormValues, string>> = {}
    if (!form.typeAction) errs.typeAction = "Sélectionnez un type"
    if (!form.attributaireRealisateur.trim()) errs.attributaireRealisateur = "Requis"
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
          <h2>{mode === "edit" ? "Modifier le Marché" : "Ajouter une Société / un Marché"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>Société / attributaire <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Nom de la société..."
                value={form.attributaireRealisateur}
                onChange={(e) => sf("attributaireRealisateur", e.target.value)}
              />
              {errors.attributaireRealisateur && <span className="field-error">{errors.attributaireRealisateur}</span>}
            </div>
            <div className="form-field">
              <label>Type <span className="required">*</span></label>
              <select value={form.typeAction} onChange={(e) => sf("typeAction", e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {TYPE_ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.typeAction && <span className="field-error">{errors.typeAction}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Montant engagé (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.montantEngage}
                onChange={(e) => sf("montantEngage", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Estimation (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.estimation}
                onChange={(e) => sf("estimation", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Avancement physique (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={form.avancementPhysique}
                onChange={(e) => sf("avancementPhysique", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Avancement financier (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={form.avancementFinancier}
                onChange={(e) => sf("avancementFinancier", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Date de début</label>
              <input
                type="date"
                value={form.dateDebut}
                onChange={(e) => sf("dateDebut", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Date de fin</label>
              <input
                type="date"
                value={form.dateFin}
                onChange={(e) => sf("dateFin", e.target.value)}
              />
            </div>
          </div>
        </form>

        {serverError && <p className="modal-server-error">{serverError}</p>}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : mode === "edit" ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  )
}
