import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, FolderOpen, Briefcase } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPartenaireDetail } from '../store/partenairesSlice'
import { getAllConventionsCadre } from '../api/conventionsCadreApi'
import { getAllConventionsSpecifiques } from '../api/conventionsSpecifiquesApi'
import { getAllProgrammes } from '../api/programmesApi'
import { fetchProjetsPage } from '../api/projetApi'
import type { ConventionCadre } from '../types/conventionCadre'
import type { ConventionSpecifique } from '../types/conventionSpecifique'
import type { Programme } from '../types/programme'
import type { ProjetDto } from '../types/projet'
import './FicheProjet.css'

function formatMontant(montant: number | null): string {
  if (montant == null) return '—'
  return `${montant.toLocaleString('fr-FR')} MAD`
}

export default function FichePartenaire() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selected, detailLoading, detailError } = useAppSelector((state) => state.partenaires)

  const [conventionsCadre, setConventionsCadre] = useState<ConventionCadre[]>([])
  const [conventionsSpecifiques, setConventionsSpecifiques] = useState<ConventionSpecifique[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [projets, setProjets] = useState<ProjetDto[]>([])

  useEffect(() => {
    if (id) dispatch(fetchPartenaireDetail(id))
  }, [dispatch, id])

  useEffect(() => {
    getAllConventionsCadre().then(setConventionsCadre).catch(() => {})
    getAllConventionsSpecifiques().then(setConventionsSpecifiques).catch(() => {})
    getAllProgrammes().then(setProgrammes).catch(() => {})
    fetchProjetsPage(0, 1000, '').then((page) => setProjets(page.content)).catch(() => {})
  }, [])

  if (detailLoading) return <p className="fiche-loading">Chargement...</p>
  if (detailError) return <p className="fiche-error">{detailError}</p>
  if (!selected) return null

  const conventionsDuPartenaire = conventionsCadre.filter((c) => c.idPartenaire === selected.idPartenaire)
  const projetsDuPartenaire = conventionsSpecifiques.filter((c) => c.idPartenaire === selected.idPartenaire)

  return (
    <div className="fiche-container">
      <button className="fiche-back-btn" onClick={() => navigate('/partenaires')}>
        <ArrowLeft size={14} /> Retour aux Partenaires
      </button>

      <div className="fiche-header-card">
        <h1 className="fiche-title">{selected.nom}</h1>

        <div className="fiche-info-grid">
          <div className="fiche-info-item">
            <Phone size={16} className="fiche-icon" />
            <div>
              <p className="fiche-label">Téléphone</p>
              <p className="fiche-value">{selected.telephone || '—'}</p>
            </div>
          </div>

          <div className="fiche-info-item">
            <Mail size={16} className="fiche-icon" />
            <div>
              <p className="fiche-label">Email</p>
              <p className="fiche-value">{selected.email || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fiche-lists-row">
        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <FolderOpen size={16} className="fiche-icon-highlight" />
            <h2>Programmes associés ({conventionsDuPartenaire.length})</h2>
          </div>
          {conventionsDuPartenaire.length === 0 ? (
            <p className="fiche-list-empty">Aucun programme lié.</p>
          ) : (
            <ul className="fiche-list">
              {conventionsDuPartenaire.map((c) => {
                const programme = programmes.find((p) => p.idProgramme === c.idProgramme)
                return (
                  <li key={c.idConventionCadre}>
                    {programme?.objet ?? 'Programme inconnu'} — {c.etatConvention} — {formatMontant(c.montantContribution)}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <Briefcase size={16} className="fiche-icon-highlight" />
            <h2>Projets associés ({projetsDuPartenaire.length})</h2>
          </div>
          {projetsDuPartenaire.length === 0 ? (
            <p className="fiche-list-empty">Aucun projet lié.</p>
          ) : (
            <ul className="fiche-list">
              {projetsDuPartenaire.map((c) => {
                const projet = projets.find((p) => p.idProjet === c.idProjet)
                return (
                  <li key={c.idConventionSpecifique}>
                    {projet?.nom ?? 'Projet inconnu'} — {c.etatConvention} — {formatMontant(c.montantContribution)}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
