import { Button } from "./Button";
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = "registro(s)",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
      aria-label="Paginação"
    >
      <span>
        {total} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="px-2">
          Página {page} de {pages}
        </span>
        <Button
          variant="secondary"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}
