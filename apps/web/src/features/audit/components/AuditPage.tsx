import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/http";
import {
  FilterPanel,
  PageHeader,
  Pagination,
  controlClass,
} from "../../../components/ui";
import { useAuth } from "../../auth/context/useAuth";
import { listAuditLogs, type AuditLog } from "../api/auditApi";
const labels: Record<string, string> = {
  POST: "Criação",
  PUT: "Alteração",
  PATCH: "Alteração",
  DELETE: "Exclusão",
};
export function AuditPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    resource: "",
    from: "",
    to: "",
  });
  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page: String(page), limit: "20" }).filter(
          ([, value]) => value,
        ),
      );
      const result = await listAuditLogs(accessToken, params);
      setItems(result.items);
      setTotal(result.total);
      setError(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters, page]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <section>
      <PageHeader
        title="Auditoria"
        description="Histórico das alterações realizadas no sistema."
      />
      <FilterPanel className="lg:grid-cols-5">
        <input
          className={controlClass}
          placeholder="Usuário, recurso ou registro"
          value={filters.search}
          onChange={(event) => {
            setPage(1);
            setFilters({ ...filters, search: event.target.value });
          }}
        />
        <select
          className={controlClass}
          value={filters.action}
          onChange={(event) => {
            setPage(1);
            setFilters({ ...filters, action: event.target.value });
          }}
        >
          <option value="">Todas as ações</option>
          <option value="POST">Criação</option>
          <option value="PATCH">Alteração</option>
          <option value="DELETE">Exclusão</option>
        </select>
        <input
          className={controlClass}
          placeholder="Recurso"
          value={filters.resource}
          onChange={(event) =>
            setFilters({ ...filters, resource: event.target.value })
          }
        />
        <input
          aria-label="Data inicial"
          className={controlClass}
          type="date"
          value={filters.from}
          onChange={(event) =>
            setFilters({ ...filters, from: event.target.value })
          }
        />
        <input
          aria-label="Data final"
          className={controlClass}
          type="date"
          value={filters.to}
          onChange={(event) =>
            setFilters({ ...filters, to: event.target.value })
          }
        />
      </FilterPanel>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p className="rounded-xl bg-white p-5">Carregando auditoria…</p>
      ) : !items.length ? (
        <p className="rounded-xl bg-white p-5 text-slate-500">
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-4">Data e hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Recurso</th>
                <th>Registro</th>
                <th>Rota</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-b" key={item.id}>
                  <td className="p-4 whitespace-nowrap">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    }).format(new Date(item.createdAt))}
                  </td>
                  <td>
                    <strong>{item.userName ?? "Sistema"}</strong>
                    <br />
                    <span className="text-xs text-slate-500">
                      {item.userEmail}
                    </span>
                  </td>
                  <td>{labels[item.action] ?? item.action}</td>
                  <td>{item.resource}</td>
                  <td>{item.recordId ?? "—"}</td>
                  <td className="max-w-64 truncate" title={item.route}>
                    {item.route}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
      />
    </section>
  );
}
