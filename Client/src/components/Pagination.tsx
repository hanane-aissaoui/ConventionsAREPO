import { ChevronLeft, ChevronRight } from "lucide-react"
import "./Pagination.css"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const currentPage = page + 1 // conversion 0-indexé (backend) → 1-indexé (affichage)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="pagination">
      <button
        className="pagination__nav"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft size={15} />
      </button>

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="pagination__dots">…</span>
        ) : (
          <button
            key={p}
            className={`pagination__page ${p === currentPage ? "pagination__page--active" : ""}`}
            onClick={() => onPageChange((p as number) - 1)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pagination__nav"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push("...")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push("...")
  pages.push(total)
  return pages
}