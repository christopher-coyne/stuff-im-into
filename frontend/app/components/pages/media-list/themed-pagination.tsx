import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import type { ResolvedTheme } from "~/lib/theme/themes";

interface ThemedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme: ResolvedTheme;
}

export function ThemedPagination({
  currentPage,
  totalPages,
  onPageChange,
  theme,
}: ThemedPaginationProps) {
  const { styles } = theme;

  if (totalPages <= 1) {
    return null;
  }

  // Build the page numbers array with ellipsis
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    pages.push(totalPages);
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={styles.mutedText}
          />
        </PaginationItem>

        {pages.map((page, idx) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis style={styles.mutedText} />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={page === currentPage}
                style={page === currentPage ? styles.button : styles.mutedText}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={styles.mutedText}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
