import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Calendar, DollarSign, MapPin, FolderOpen, Users, Building2, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadProjetDetail } from '../store/projetsSlice'
import './FicheProjet.css'

function formatBudget(v: number | null) {
  if (v == null) return '—'
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(v) + ' DH'
}

// Un donut réutilisable pour Physique ET Financier, seule la couleur change.
function AvancementDonut({ value, color, label }: { value: number; color: string; label: string }) {
  const data = [
    { name: 'Réalisé', value },
    { name: 'Restant', value: 100 - value },
  ]
  return (
    <div className="fiche-avancement-item">
      <div className="fiche-donut-wrapper">
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={38}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} />
              <Cell fill="#E3E2E2" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="fiche-donut-label">
          <span className="fiche-donut-value" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="fiche-avancement-text">
        <p className="fiche-donut-caption">{label}</p>
        <p className="fiche-donut-sub">Moyenne sur l'ensemble des marchés du projet</p>
      </div>
    </div>
  )
}

export default function FicheProjet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selected, detailLoading, detailError } = useAppSelector((state) => state.projets)

  useEffect(() => {
    if (id) dispatch(loadProjetDetail(id))
  }, [dispatch, id])

  if (detailLoading) return <p className="fiche-loading">Chargement...</p>
  if (detailError) return <p className="fiche-error">{detailError}</p>
  if (!selected) return null

  const hasAvancement = selected.avancementPhysiqueMoyen != null || selected.avancementFinancierMoyen != null

  return (
    <div className="fiche-container">
      <button className="fiche-back-btn" onClick={() => navigate('/projets')}>
        <ArrowLeft size={14} /> Retour aux Projets
      </button>

      <div className="fiche-header-card">
        <span className="fiche-badge-orange">{selected.statut}</span>
        <h1 className="fiche-title">{selected.nom}</h1>

        <div className="fiche-info-grid">
          <button
            className="fiche-info-item fiche-info-clickable"
            onClick={() => navigate(`/programmes/${selected.idProgramme}`)}
          >
            <FolderOpen size={16} className="fiche-icon" />
            <div className="fiche-info-text">
              <p className="fiche-label">Programme</p>
              <p className="fiche-value">{selected.nomProgramme}</p>
            </div>
            <ChevronRight size={16} className="fiche-chevron" />
          </button>

          <div className="fiche-info-item">
            <MapPin size={16} className="fiche-icon" />
            <div>
              <p className="fiche-label">Commune</p>
              <p className="fiche-value">{selected.nomCommune}</p>
            </div>
          </div>

          <div className="fiche-info-item">
            <Calendar size={16} className="fiche-icon" />
            <div>
              <p className="fiche-label">Période</p>
              <p className="fiche-value">{selected.dateDebut ?? '—'} → {selected.dateFin ?? '—'}</p>
            </div>
          </div>

          <div className="fiche-info-item fiche-info-highlight">
            <DollarSign size={16} className="fiche-icon-highlight" />
            <div>
              <p className="fiche-label-highlight">Budget estimé</p>
              <p className="fiche-value-highlight">{formatBudget(selected.budgetEstime)}</p>
            </div>
          </div>
        </div>

        {hasAvancement && (
          <div className="fiche-avancement-section">
            <p className="fiche-avancement-title">Avancement global (moyenne des marchés)</p>
            <div className="fiche-avancement-row">
              {selected.avancementPhysiqueMoyen != null && (
                <AvancementDonut value={selected.avancementPhysiqueMoyen} color="#22C55E" label="Avancement Physique" />
              )}
              {selected.avancementFinancierMoyen != null && (
                <AvancementDonut value={selected.avancementFinancierMoyen} color="#145A8D" label="Avancement Financier" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fiche-lists-row">
        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <Users size={16} className="fiche-icon-highlight" />
            <h2>Partenaires ({selected.partenaires?.length ?? 0})</h2>
          </div>
          {(!selected.partenaires || selected.partenaires.length === 0) ? (
            <p className="fiche-list-empty">Aucun partenaire lié.</p>
          ) : (
            <ul className="fiche-list">
              {selected.partenaires.map((nom, i) => <li key={i}>{nom}</li>)}
            </ul>
          )}
        </div>

        <div className="fiche-list-card">
          <div className="fiche-list-header">
            <Building2 size={16} className="fiche-icon-highlight" />
            <h2>Sociétés des marchés ({selected.marches?.length ?? 0})</h2>
          </div>
          {(!selected.marches || selected.marches.length === 0) ? (
            <p className="fiche-list-empty">Aucun marché lié.</p>
          ) : (
            <ul className="fiche-list">
              {selected.marches.map((nom, i) => <li key={i}>{nom}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
