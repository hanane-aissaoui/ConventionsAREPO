import { useState, useEffect } from "react"
import type { Programme } from "../types/programme"
import type { Commune } from "../types/commune"
import "./Modal.css"

export interface ProjetFormValues {
  nom: string
  idProgramme: string
  idCommune: string
  statut: string
  budgetEstime: string
  dateDebut: string
  dateFin: string
}

interface ProjetModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  initialValues?: ProjetFormValues
  programmes: Programme[]
  communes: Commune[]
  onClose: () => void
  onSubmit: (values: ProjetFormValues) => void
}

const emptyForm: ProjetFormValues = {
  nom: "",
  idProgramme: "",
  idCommune: "",
  statut: "",
  budgetEstime: "",
  dateDebut: "",
  dateFin: "",
}

export default function ProjetModal({
  isOpen,
  isSubmitting,
  mode,
  initialValues,
  programmes,
  communes,
  onClose,
  onSubmit,
}: ProjetModalProps) {
  const [form, setForm] = useState<ProjetFormValues>(initialValues ?? emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProjetFormValues, string>>>({})

  // Recharge le formulaire à chaque ouverture (utile en mode édition, quand on change de projet)
  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const sf = (key: keyof ProjetFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ProjetFormValues, string>> = {}
    if (!form.nom.trim()) errs.nom = "Requis"
    if (!form.idProgramme) errs.idProgramme = "Requis"
    if (!form.idCommune) errs.idCommune = "Requis"
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
          <h2>{mode === "edit" ? "Modifier le Projet" : "Nouveau Projet"}</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Nom du projet <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nom du projet..."
              value={form.nom}
              onChange={(e) => sf("nom", e.target.value)}
            />
            {errors.nom && <span className="field-error">{errors.nom}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Programme <span className="required">*</span></label>
              <select value={form.idProgramme} onChange={(e) => sf("idProgramme", e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {[...programmes]
                  .sort((a, b) => a.objet.localeCompare(b.objet, "fr"))
                  .map((p) => (
                    <option key={p.idProgramme} value={p.idProgramme}>{p.objet}</option>
                  ))}
              </select>
              {errors.idProgramme && <span className="field-error">{errors.idProgramme}</span>}
            </div>
            <div className="form-field">
              <label>Commune <span className="required">*</span></label>
              <select value={form.idCommune} onChange={(e) => sf("idCommune", e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {[...communes]
                  .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
                  .map((c) => (
                    <option key={c.idCommune} value={c.idCommune}>{c.nom}</option>
                  ))}
              </select>
              {errors.idCommune && <span className="field-error">{errors.idCommune}</span>}
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

          <div className="form-row">
            <div className="form-field">
              <label>Statut</label>
              <input
                type="text"
                placeholder="Statut..."
                value={form.statut}
                onChange={(e) => sf("statut", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Budget estimé (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.budgetEstime}
                onChange={(e) => sf("budgetEstime", e.target.value)}
              />
            </div>
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
