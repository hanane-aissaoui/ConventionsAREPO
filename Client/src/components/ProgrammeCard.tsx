import { useNavigate } from "react-router-dom"
import { Pencil, Trash2, FolderOpen, ChevronRight,Users } from "lucide-react"
import type { Programme } from "../types/programme"
import "./ProgrammeCard.css"

function formatMontant(montant: number | null): string {
  if (montant == null) return "—"
  return `${montant.toLocaleString("fr-FR")} MAD`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

interface ProgrammeCardProps {
  programme: Programme
  onEdit?: (programme: Programme) => void
  onDelete?: (programme: Programme) => void
}

export default function ProgrammeCard({ programme, onEdit, onDelete }: ProgrammeCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/programmes/${programme.idProgramme}`)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(programme)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(programme)
  }

  return (
    <div className="programme-card" onClick={handleCardClick}>
      <div className="programme-card__strip" />

      <div className="programme-card__body">
        <div className="programme-card__actions">
          <button className="icon-btn" onClick={handleEditClick} aria-label="Modifier">
            <Pencil size={15} />
          </button>
          <button className="icon-btn icon-btn--danger" onClick={handleDeleteClick} aria-label="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>

        <h3 className="programme-card__objet">{programme.objet}</h3>

        <div className="programme-card__meta-row">
          <span className="programme-card__montant">{formatMontant(programme.budgetEstime)}</span>
          <span className="programme-card__dates">
            {formatDate(programme.dateDebut)} → {formatDate(programme.dateFin)}
          </span>
        </div>

        <div className="programme-card__footer">
          <span className="programme-card__stat">
            <FolderOpen size={14} /> {programme.nbrProjet} projet{programme.nbrProjet !== 1 ? "s" : ""}
           <Users size={14}/>{programme.nbrPartenaire} partenaire{programme.nbrPartenaire !== 1 ? "s" : ""}
           
          </span>

          <span className="programme-card__link">
            Voir détail <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  )
}