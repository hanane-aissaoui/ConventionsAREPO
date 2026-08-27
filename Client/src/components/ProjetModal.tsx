import { useState, useEffect } from "react"
import { fetchHierarchieTerritoriale, type TerritoireNode } from "../api/territoireApi"
import "./Modal.css"

export interface ProjetFormValues {
  nom: string
  idCommune: string
  dateDebut: string
  dateFin: string
  budgetEstime: string
  statut: string
}

interface ProjetModalProps {
  isOpen: boolean
  isSubmitting: boolean
  mode: "create" | "edit"
  initialValues?: ProjetFormValues
  /** Nom de la commune actuelle (utile si elle n'est plus renvoyée par fetchHierarchieTerritoriale) */
  existingCommuneLabel?: string
  onClose: () => void
  onSubmit: (values: ProjetFormValues) => void
}

const STATUTS = ["Crée","En cours","Terminé"]

const emptyForm: ProjetFormValues = {
  nom: "",
  idCommune: "",
  dateDebut: "",
  dateFin: "",
  budgetEstime: "",
  statut: "En cours",
}

interface CommuneOption {
  id: string
  nom: string
  nomPrefecture: string
}

// Aplatit l'arbre Région > Préfecture/Province > Commune pour peupler le select
function flattenCommunes(nodes: TerritoireNode[]): CommuneOption[] {
  const options: CommuneOption[] = []
  for (const region of nodes) {
    for (const prefecture of region.enfants) {
      for (const commune of prefecture.enfants) {
        options.push({ id: commune.id, nom: commune.nom, nomPrefecture: prefecture.nom })
      }
    }
  }
  return options.sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
}

export default function ProjetModal({
  isOpen,
  isSubmitting,
  mode,
  initialValues,
  existingCommuneLabel,
  onClose,
  onSubmit,
}: ProjetModalProps) {
  const [form, setForm] = useState<ProjetFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProjetFormValues, string>>>({})

  const [communes, setCommunes] = useState<CommuneOption[]>([])
  const [communesLoading, setCommunesLoading] = useState(false)
  const [communesError, setCommunesError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues ?? emptyForm)
      setErrors({})
    }
  }, [isOpen, initialValues])

  useEffect(() => {
    if (!isOpen) return
    setCommunesLoading(true)
    setCommunesError(null)
    fetchHierarchieTerritoriale()
      .then((nodes) => setCommunes(flattenCommunes(nodes)))
      .catch(() => setCommunesError("Impossible de charger la liste des communes"))
      .finally(() => setCommunesLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const sf = (key: keyof ProjetFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ProjetFormValues, string>> = {}
    if (!form.nom.trim()) errs.nom = "Le nom du projet est requis"
    if (!form.idCommune) errs.idCommune = "Sélectionnez une commune"
    if (!form.dateDebut) errs.dateDebut = "La date de début est requise"
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
          <h2>{mode === "edit" ? "Modifier le Projet" : "Ajouter un Projet"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Nom du projet <span className="required">*</span></label>
            <input
              type="text"
              placeholder="ex: Réhabilitation du Souk Hebdomadaire"
              value={form.nom}
              onChange={(e) => sf("nom", e.target.value)}
            />
            {errors.nom && <span className="field-error">{errors.nom}</span>}
          </div>

          <div className="form-field">
            <label>Commune <span className="required">*</span></label>
            {communesLoading ? (
              <p className="modal-hint">Chargement des communes...</p>
            ) : communesError ? (
              <span className="field-error">{communesError}</span>
            ) : (
              <select
                value={form.idCommune}
                onChange={(e) => sf("idCommune", e.target.value)}
              >
                <option value="">-- Sélectionner --</option>

                {form.idCommune &&
                  !communes.some((c) => c.id === form.idCommune) && (
                    <option value={form.idCommune}>
                      {existingCommuneLabel ?? "Commune actuelle"}
                    </option>
                  )}

                {communes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} — {c.nomPrefecture}
                  </option>
                ))}
              </select>
            )}
            {errors.idCommune && <span className="field-error">{errors.idCommune}</span>}
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

          <div className="form-row">
            <div className="form-field">
              <label>Budget estimé (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={form.budgetEstime}
                onChange={(e) => sf("budgetEstime", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Statut</label>
              <select value={form.statut} onChange={(e) => sf("statut", e.target.value)}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : mode === "edit" ? "Enregistrer" : "Créer le projet"}
          </button>
        </div>
      </div>
    </div>
  )
}