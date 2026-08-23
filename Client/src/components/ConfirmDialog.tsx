import { AlertTriangle } from "lucide-react"
import "./ConfirmDialog.css"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Supprimer",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={20} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            Annuler
          </button>
          <button className="btn-confirm-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}