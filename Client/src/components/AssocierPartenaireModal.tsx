import { useState, useEffect } from "react"
import type { Partenaire } from "../types/partenaire"
import "./Modal.css"

export interface ConventionFormValues {
  idPartenaire: string
  etatConvention: string
  montantContribution: string
  montantDebloque: string
  dateParticipation: string
}

interface AssocierPartenaireModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  partenaires: Partenaire[]
  initialValues?: ConventionFormValues
  onClose: () => void
  onSubmit: (values: ConventionFormValues) => void
}

const emptyForm: ConventionFormValues = {
  idPartenaire: "",
  etatConvention: "Non signée",
  montantContribution: "",
  montantDebloque: "",
  dateParticipation: "",
}

export default function AssocierPartenaireModal({
  isOpen,
  isSubmitting,
  mode,
  partenaires,
  initialValues,
  onClose,
  onSubmit,
}: AssocierPartenaireModalProps) {
  const [form, setForm] = useState<ConventionFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ConventionFormValues, string>>>({})

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const sf = (key: keyof ConventionFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ConventionFormValues, string>> = {}
    if (!form.idPartenaire) errs.idPartenaire = "Sélectionnez un partenaire"
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
          <h2>{mode === "edit" ? "Modifier la Convention" : "Associer un Partenaire"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Partenaire <span className="required">*</span></label>
            <select
              value={form.idPartenaire}
              onChange={(e) => sf("idPartenaire", e.target.value)}
              disabled={mode === "edit"}
            >
              <option value="">-- Sélectionner --</option>
              {[...partenaires]
                .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
                .map((p) => (
                  <option key={p.idPartenaire} value={p.idPartenaire}>
                    {p.nom}
                  </option>
                ))}
            </select>
            {errors.idPartenaire && <span className="field-error">{errors.idPartenaire}</span>}
          </div>

          <div className="form-field">
            <label>État</label>
            <select value={form.etatConvention} onChange={(e) => sf("etatConvention", e.target.value)}>
              <option value="Non signée">Non signée</option>
              <option value="Signée">Signée</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Contribution (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.montantContribution}
                onChange={(e) => sf("montantContribution", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Débloqué (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.montantDebloque}
                onChange={(e) => sf("montantDebloque", e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Date participation</label>
            <input
              type="date"
              value={form.dateParticipation}
              onChange={(e) => sf("dateParticipation", e.target.value)}
            />
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : mode === "edit" ? "Enregistrer" : "Créer la convention"}
          </button>
        </div>
      </div>
    </div>
  )
}