import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../lib/http";
import {
  Button,
  FilterPanel,
  PageHeader,
  Pagination,
  StatusBadge,
  controlClass,
} from "../../../components/ui";
import { useAuth } from "../../auth/context/useAuth";
import {
  createMember,
  inactivateMember,
  listMembers,
  type MemberItem,
} from "../api/membersApi";

const cpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
export function MembersPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(false);
  const [data, setData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    birthDate: "",
    sex: "",
    status: "active",
  });
  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const result = await listMembers(accessToken, {
        page: String(page),
        limit: "10",
        search,
        status,
      });
      setItems(result.items);
      setTotal(result.total);
      setError(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, status]);
  useEffect(() => {
    void load();
  }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    try {
      await createMember(accessToken, {
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
        phone: data.phone.replace(/\D/g, "") || undefined,
        birthDate: data.birthDate || undefined,
        sex: data.sex || undefined,
        email: data.email || undefined,
      });
      setForm(false);
      setData({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        birthDate: "",
        sex: "",
        status: "active",
      });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }
  return (
    <section>
      <PageHeader
        title="Membros"
        description="Cadastro e vínculos das pessoas da igreja."
        action={
          <Button variant="primary" onClick={() => setForm(true)}>
            Novo membro
          </Button>
        }
      />
      <FilterPanel className="lg:grid-cols-2">
        <input
          className={controlClass}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Nome, CPF, e-mail ou telefone"
        />
        <select
          className={controlClass}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas as situações</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </FilterPanel>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {form && (
        <form
          className="mb-5 grid gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2"
          onSubmit={submit}
        >
          <h2 className="font-display text-xl font-bold sm:col-span-2">
            Dados gerais
          </h2>
          <label className="text-sm font-semibold">
            Nome completo *
            <input
              className={controlClass}
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            CPF *
            <input
              className={controlClass}
              required
              value={cpf(data.cpf)}
              onChange={(e) => setData({ ...data, cpf: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            E-mail
            <input
              className={controlClass}
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            Telefone
            <input
              className={controlClass}
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            Nascimento
            <input
              className={controlClass}
              type="date"
              value={data.birthDate}
              onChange={(e) => setData({ ...data, birthDate: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            Sexo
            <select
              className={controlClass}
              value={data.sex}
              onChange={(e) => setData({ ...data, sex: e.target.value })}
            >
              <option value="">Não informado</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="primary">
              Salvar
            </Button>
            <Button variant="secondary" onClick={() => setForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
      {loading ? (
        <p className="rounded-xl bg-white p-5">Carregando membros…</p>
      ) : items.length ? (
        <div className="space-y-3">
          {items.map((member) => (
            <article
              className="rounded-xl bg-white p-5 shadow-sm"
              key={member.id}
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{member.name}</h2>
                  <p className="text-sm text-slate-500">
                    {cpf(member.cpf)} · {member.phone || "Sem telefone"} ·{" "}
                    {member.email || "Sem e-mail"}
                  </p>
                </div>
                <StatusBadge active={member.status === "active"} />
              </div>
              <ul className="mt-3 text-sm text-slate-600">
                {member.assignments.map((assignment) => (
                  <li key={assignment.id}>
                    {assignment.church.name} — {assignment.role.name}
                    {assignment.department &&
                      ` — ${assignment.department.name}`}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3 text-sm">
                <Button variant="view">Visualizar</Button>
                <Button variant="edit">Editar</Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm("Inativar este membro?") && accessToken)
                      void inactivateMember(accessToken, member.id).then(load);
                  }}
                >
                  Inativar
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white p-5 text-slate-500">
          Nenhum membro encontrado.
        </p>
      )}
      <Pagination
        page={page}
        pageSize={10}
        total={total}
        onPageChange={setPage}
        itemLabel="membro(s)"
      />
    </section>
  );
}
