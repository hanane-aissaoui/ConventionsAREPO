import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FolderOpen, Briefcase, TrendingUp, CheckCircle, Handshake, Users } from "lucide-react"
import { getAllProgrammes } from "../api/programmesApi"
import { fetchProjetsPage } from "../api/projetApi"
import { getAllMarches } from "../api/marchesApi"
import { getAllConventionsCadre } from "../api/conventionsCadreApi"
import { getAllConventionsSpecifiques } from "../api/conventionsSpecifiquesApi"
import { getAllPartenaires } from "../api/partenairesApi"
import type { Programme } from "../types/programme"
import type { ProjetDto } from "../types/projet"
import type { Marche } from "../types/marche"
import type { ConventionCadre } from "../types/conventionCadre"
import type { ConventionSpecifique } from "../types/conventionSpecifique"
import type { Partenaire } from "../types/partenaire"
import KpiCard from "../components/KpiCard"
import { statutKey, STATUT_COLORS, STATUT_LABELS } from "../utils/statut"
import "./DashboardScreen.css"

function formatMd(v: number) {
  return `${(v / 1e6).toFixed(2)} M DH`
}

export default function DashboardScreen() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [projets, setProjets] = useState<ProjetDto[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [conventionsCadre, setConventionsCadre] = useState<ConventionCadre[]>([])
  const [conventionsSpecifiques, setConventionsSpecifiques] = useState<ConventionSpecifique[]>([])
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])

  useEffect(() => {
    Promise.all([
      getAllProgrammes(),
      fetchProjetsPage(0, 1000, ""),
      getAllMarches(),
      getAllConventionsCadre(),
      getAllConventionsSpecifiques(),
      getAllPartenaires(),
    ])
      .then(([progs, projetsPage, mch, cadre, specifiques, partn]) => {
        setProgrammes(progs)
        setProjets(projetsPage.content)
        setMarches(mch)
        setConventionsCadre(cadre)
        setConventionsSpecifiques(specifiques)
        setPartenaires(partn)
      })
      .finally(() => setLoading(false))
  }, [])

  const projetsEnCours = projets.filter((p) => statutKey(p.statut) === "encours").length
  const budgetTotal = marches.reduce((s, m) => s + (m.montantEngage ?? 0), 0)
  const tauxMoyen = marches.length > 0
    ? Math.round(marches.reduce((s, m) => s + (m.avancementPhysique ?? 0), 0) / marches.length)
    : 0
  const totalConventions = conventionsCadre.length + conventionsSpecifiques.length
  const conventionsSignees = [...conventionsCadre, ...conventionsSpecifiques].filter((c) =>
    c.etatConvention?.toUpperCase().includes("SIGN")
  ).length

  const TOP_PARTENAIRES = 5

  // Contribution (montant engagé) vs Débloqué, agrégés par partenaire sur
  // l'ensemble de ses conventions (cadre + spécifiques).
  const contribToutes = partenaires
    .map((p) => {
      const conventions = [
        ...conventionsCadre.filter((c) => c.idPartenaire === p.idPartenaire),
        ...conventionsSpecifiques.filter((c) => c.idPartenaire === p.idPartenaire),
      ]
      return {
        name: p.nom.length > 12 ? `${p.nom.slice(0, 12)}…` : p.nom,
        contribution: conventions.reduce((s, c) => s + (c.montantContribution ?? 0), 0),
        debloque: conventions.reduce((s, c) => s + (c.montantDebloque ?? 0), 0),
      }
    })
    .filter((d) => d.contribution > 0 || d.debloque > 0)
    .sort((a, b) => b.contribution - a.contribution)

  // On n'affiche que les plus gros contributeurs ; au-delà, le reste est
  // regroupé dans une barre "Autres" pour garder une largeur maîtrisée.
  const contribParPartenaire =
    contribToutes.length > TOP_PARTENAIRES + 1
      ? [
          ...contribToutes.slice(0, TOP_PARTENAIRES),
          contribToutes.slice(TOP_PARTENAIRES).reduce(
            (acc, d) => ({
              name: "Autres",
              contribution: acc.contribution + d.contribution,
              debloque: acc.debloque + d.debloque,
            }),
            { name: "Autres", contribution: 0, debloque: 0 }
          ),
        ]
      : contribToutes

  // Regroupé par libellé canonique : « Crée » et « Créé » comptent ensemble.
  const statutsCount: Record<string, number> = {}
  projets.forEach((p) => {
    const key = statutKey(p.statut)
    const label = key === "other" ? p.statut || "Non défini" : STATUT_LABELS[key]
    statutsCount[label] = (statutsCount[label] || 0) + 1
  })
  const pieData = Object.entries(statutsCount).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-page__state">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de l'activité</p>
      </div>

      <div className="dashboard-kpi-grid">
        <KpiCard
          label="Programmes"
          value={programmes.length}
          icon={FolderOpen}
          color="#145A8D"
          sub="total"
          onClick={() => navigate("/programmes")}
        />
        <KpiCard
          label="Projets en cours"
          value={projetsEnCours}
          icon={Briefcase}
          color="#C64A11"
          sub={`sur ${projets.length} projets`}
          onClick={() => navigate("/projets")}
        />
        <KpiCard
          label="Budget engagé"
          value={formatMd(budgetTotal)}
          icon={TrendingUp}
          color="#0E630E"
          sub="total marchés"
          onClick={() => navigate("/projets")}
        />
        <KpiCard
          label="Avancement moyen"
          value={`${tauxMoyen}%`}
          icon={CheckCircle}
          color="#4CAF50"
          sub="physique / marchés"
          onClick={() => navigate("/projets")}
        />
        <KpiCard
          label="Conventions signées"
          value={conventionsSignees}
          icon={Handshake}
          color="#145A8D"
          sub={`sur ${totalConventions} conventions`}
        />
        <KpiCard
          label="Partenaires"
          value={partenaires.length}
          icon={Users}
          color="#6B7280"
          sub="total"
          onClick={() => navigate("/partenaires")}
        />
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card dashboard-chart-card--wide">
          <p className="dashboard-chart-card__title">Contribution par Partenaire</p>
          {contribParPartenaire.length === 0 ? (
            <p className="dashboard-chart-card__empty">Aucune donnée pour l'instant.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={contribParPartenaire} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(v, name) => [formatMd(Number(v)), name === "contribution" ? "Contribution" : "Débloqué"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #E3E2E2", fontSize: 12 }}
                />
                <Legend
                  formatter={(v: string) => (v === "contribution" ? "Contribution" : "Débloqué")}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="contribution" fill="#145A8D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debloque" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dashboard-chart-card">
          <p className="dashboard-chart-card__title">Répartition Projets</p>
          {pieData.length === 0 ? (
            <p className="dashboard-chart-card__empty">Aucune donnée pour l'instant.</p>
          ) : (
            <div className="dashboard-pie-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={STATUT_COLORS[statutKey(d.name)]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E3E2E2", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dashboard-pie-legend">
                {pieData.map((d) => (
                  <div key={d.name} className="dashboard-pie-legend__item">
                    <span className="dashboard-pie-legend__dot" style={{ background: STATUT_COLORS[statutKey(d.name)] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
