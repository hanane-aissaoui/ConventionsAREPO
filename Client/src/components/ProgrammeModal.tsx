import { useState, useEffect } from "react"
import "./Modal.css"

export interface ProgrammeFormValues {
  objet: string
  dateDebut: string
  dateFin: string
  budgetEstime: string
}

interface ProgrammeModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  initialValues?: ProgrammeFormValues
  onClose: () => void
  onSubmit: (values: ProgrammeFormValues) => void
}

const emptyForm: ProgrammeFormValues = {
  objet: "",
  dateDebut: "",
  dateFin: "",
  budgetEstime: "",
}

export default function ProgrammeModal({
  isOpen,
  isSubmitting,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: ProgrammeModalProps) {
  const [form, setForm] = useState<ProgrammeFormValues>(initialValues ?? emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProgrammeFormValues, string>>>({})

  // Recharge le formulaire à chaque ouverture (utile en mode édition, quand on change de programme)
  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const sf = (key: keyof ProgrammeFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ProgrammeFormValues, string>> = {}
    if (!form.objet.trim()) errs.objet = "Requis"
    if (!form.dateDebut) errs.dateDebut = "Requis"
    if (!form.budgetEstime || isNaN(Number(form.budgetEstime))) errs.budgetEstime = "Invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === "edit" ? "Modifier le Programme" : "Nouveau Programme"}</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Objet du programme <span className="required">*</span></label>
            <textarea
              rows={3}
              placeholder="Description de l'objet..."
              value={form.objet}
              onChange={(e) => sf("objet", e.target.value)}
            />
            {errors.objet && <span className="field-error">{errors.objet}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Date de début <span className="required">*</span></label>
              <input
                type="date"
                value={form.dateDebut}
                onChange={(e) => sf("dateDebut", e.target.value)}
              />
              {errors.dateDebut && <span className="field-error">{errors.dateDebut}</span>}
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

          <div className="form-field">
            <label>Budget estimé (MAD) <span className="required">*</span></label>
            <input
              type="number"
              placeholder="0"
              value={form.budgetEstime}
              onChange={(e) => sf("budgetEstime", e.target.value)}
            />
            {errors.budgetEstime && <span className="field-error">{errors.budgetEstime}</span>}
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose} disabled={isSubmitting}>
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