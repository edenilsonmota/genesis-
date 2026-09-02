import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  SearchableSelect,
  type SelectOption,
} from "../../../components/forms/SearchableSelect";
import { getApiErrorMessage } from "../../../lib/http";
import { Button, FeatureTabs, PageHeader } from "../../../components/ui";
import { listAreas, listChurches } from "../../admin/api/adminApi";
import { useAuth } from "../../auth/context/useAuth";
import {
  createRole,
  grantAccess,
  listAccessUsers,
  listDepartments,
  listPermissionCatalog,
  listRoles,
  searchMembers,
} from "../api/userGroupsApi";
import type {
  AccessUser,
  Department,
  Member,
  PermissionModule,
  Role,
  RolePermissionInput,
} from "../types/userGroups";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const formatCpf = (cpf = "") =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const option = (id: string | number, label: string): SelectOption => ({
  id,
  label,
});

export function UserGroupsPage() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [areas, setAreas] = useState<Awaited<ReturnType<typeof listAreas>>>([]);
  const [churches, setChurches] = useState<
    Awaited<ReturnType<typeof listChurches>>
  >([]);
  const [catalog, setCatalog] = useState<PermissionModule[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [search, setSearch] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [accessForm, setAccessForm] = useState({
    churchId: "",
    roleIds: [] as string[],
    departmentId: "",
    email: "",
  });
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    areaId: "",
    status: "active",
    isAdministrator: false,
    permissions: {} as Record<string, "none" | "read" | "write">,
  });

  const load = useCallback(async () => {
    if (!accessToken) return;
    const [usersPage, rolesPage, nextAreas, nextChurches, nextCatalog] =
      await Promise.all([
        listAccessUsers(accessToken),
        listRoles(accessToken, { limit: "50" }),
        listAreas(accessToken),
        listChurches(accessToken),
        listPermissionCatalog(accessToken),
      ]);
    setUsers(usersPage.items);
    setRoles(rolesPage.items);
    setAreas(nextAreas);
    setChurches(nextChurches);
    setCatalog(nextCatalog);
  }, [accessToken]);
  useEffect(() => {
    load().catch((error) => setMessage(getApiErrorMessage(error)));
  }, [load]);

  const availableRoles = roles.filter(
    (role) =>
      churches.find((church) => church.id === accessForm.churchId)?.area.id ===
        role.areaId && role.status === "active",
  );
  const groupedCatalog = useMemo(
    () =>
      Object.entries(
        catalog.reduce<Record<string, PermissionModule[]>>((groups, item) => {
          (groups[item.category] ??= []).push(item);
          return groups;
        }, {}),
      ),
    [catalog],
  );

  async function findMembers() {
    if (!accessToken) return;
    setMemberResults(await searchMembers(accessToken, search));
  }
  async function submitAccess(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !selectedMember) return;
    try {
      await grantAccess(accessToken, {
        memberId: selectedMember.id,
        churchId: accessForm.churchId,
        roleIds: accessForm.roleIds,
        departmentId: accessForm.departmentId || undefined,
        email: accessForm.email || undefined,
      });
      setMessage(
        "Acesso criado com sucesso. A senha inicial é o CPF e deverá ser alterada no primeiro acesso.",
      );
      setShowUserForm(false);
      setSelectedMember(null);
      setAccessForm({ churchId: "", roleIds: [], departmentId: "", email: "" });
      await load();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }
  async function submitRole(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    const permissions: RolePermissionInput[] = Object.entries(
      roleForm.permissions,
    )
      .filter(([, level]) => level !== "none")
      .map(([permissionModuleId, level]) => ({
        permissionModuleId,
        level: level as "read" | "write",
      }));
    try {
      await createRole(accessToken, { ...roleForm, permissions });
      setMessage("Cargo criado com sucesso.");
      setShowRoleForm(false);
      setRoleForm({
        name: "",
        description: "",
        areaId: "",
        status: "active",
        isAdministrator: false,
        permissions: {},
      });
      await load();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <section>
      <PageHeader
        title="Grupos de usuários"
        description="Usuários, cargos e permissões por igreja."
        action={
          <Button
            variant="primary"
            onClick={() =>
              tab === "users" ? setShowUserForm(true) : setShowRoleForm(true)
            }
          >
            {tab === "users" ? "Adicionar usuário" : "Novo cargo"}
          </Button>
        }
      />
      <div className="mb-5">
        <FeatureTabs
          label="Grupos de usuários"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "users", label: "Usuários" },
            { id: "roles", label: "Cargos" },
          ]}
        />
      </div>
      {message && (
        <p className="mb-4 rounded-lg border bg-white p-3 text-sm">{message}</p>
      )}
      {showUserForm && (
        <form
          className="mb-6 space-y-4 rounded-xl bg-white p-5 shadow-sm"
          onSubmit={submitAccess}
        >
          <h2 className="font-display text-xl font-bold">
            Conceder acesso a um membro
          </h2>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, CPF ou e-mail"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => void findMembers()}
            >
              Pesquisar
            </Button>
          </div>
          {memberResults.length > 0 && (
            <SearchableSelect
              label="Membro"
              options={memberResults.map((member) =>
                option(member.id, `${member.name} — ${formatCpf(member.cpf)}`),
              )}
              value={
                selectedMember
                  ? option(
                      selectedMember.id,
                      `${selectedMember.name} — ${formatCpf(selectedMember.cpf)}`,
                    )
                  : null
              }
              onChange={(selected) =>
                setSelectedMember(
                  memberResults.find((member) => member.id === selected?.id) ??
                    null,
                )
              }
            />
          )}
          {selectedMember && !selectedMember.user && (
            <label className="block text-sm font-semibold">
              E-mail de acesso
              <input
                className={inputClass}
                type="email"
                value={accessForm.email || selectedMember.email || ""}
                onChange={(event) =>
                  setAccessForm({ ...accessForm, email: event.target.value })
                }
                required={!selectedMember.email}
              />
            </label>
          )}
          <SearchableSelect
            label="Igreja"
            options={churches.map((church) => option(church.id, church.name))}
            value={
              churches
                .filter((church) => church.id === accessForm.churchId)
                .map((church) => option(church.id, church.name))[0] ?? null
            }
            onChange={(selected) => {
              const churchId = String(selected?.id ?? "");
              setAccessForm({
                ...accessForm,
                churchId,
                roleIds: [],
                departmentId: "",
              });
              if (accessToken)
                void listDepartments(accessToken, churchId).then(
                  setDepartments,
                );
            }}
          />
          {accessForm.churchId && (
            <SearchableSelect
              label="Departamento (opcional)"
              options={departments.map((department) =>
                option(department.id, department.name),
              )}
              value={
                departments
                  .filter(
                    (department) => department.id === accessForm.departmentId,
                  )
                  .map((department) =>
                    option(department.id, department.name),
                  )[0] ?? null
              }
              onChange={(selected) =>
                setAccessForm({
                  ...accessForm,
                  departmentId: String(selected?.id ?? ""),
                })
              }
            />
          )}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Cargos</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableRoles.map((role) => (
                <label
                  className="flex gap-2 rounded-lg border p-3 text-sm"
                  key={role.id}
                >
                  <input
                    type="checkbox"
                    checked={accessForm.roleIds.includes(role.id)}
                    onChange={() =>
                      setAccessForm({
                        ...accessForm,
                        roleIds: accessForm.roleIds.includes(role.id)
                          ? accessForm.roleIds.filter((id) => id !== role.id)
                          : [...accessForm.roleIds, role.id],
                      })
                    }
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={
                !selectedMember ||
                !accessForm.churchId ||
                !accessForm.roleIds.length
              }
            >
              Confirmar acesso
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowUserForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      {showRoleForm && (
        <form
          className="mb-6 space-y-4 rounded-xl bg-white p-5 shadow-sm"
          onSubmit={submitRole}
        >
          <h2 className="font-display text-xl font-bold">Novo cargo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Nome
              <input
                className={inputClass}
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, name: event.target.value })
                }
                required
              />
            </label>
            <SearchableSelect
              label="Área"
              options={areas.map((area) => option(area.id, area.name))}
              value={
                areas
                  .filter((area) => area.id === roleForm.areaId)
                  .map((area) => option(area.id, area.name))[0] ?? null
              }
              onChange={(selected) =>
                setRoleForm({ ...roleForm, areaId: String(selected?.id ?? "") })
              }
            />
          </div>
          <label className="block text-sm font-semibold">
            Descrição
            <textarea
              className={inputClass}
              value={roleForm.description}
              onChange={(event) =>
                setRoleForm({ ...roleForm, description: event.target.value })
              }
            />
          </label>
          <div className="flex flex-wrap gap-5 text-sm">
            <label>
              <input
                type="checkbox"
                checked={roleForm.status === "active"}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    status: event.target.checked ? "active" : "inactive",
                  })
                }
              />{" "}
              Cargo ativo
            </label>
            <label>
              <input
                type="checkbox"
                checked={roleForm.isAdministrator}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    isAdministrator: event.target.checked,
                  })
                }
              />{" "}
              Tipo administrador
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Módulo</th>
                  <th>Sem acesso</th>
                  <th>Leitura</th>
                  <th>Leitura e escrita</th>
                </tr>
              </thead>
              <tbody>
                {groupedCatalog.map(([category, modules]) => (
                  <Fragment key={category}>
                    <tr>
                      <th
                        colSpan={4}
                        className="bg-slate-50 px-2 py-2 text-left"
                      >
                        {category}
                      </th>
                    </tr>
                    {modules.map((module) => (
                      <tr className="border-b" key={module.id}>
                        <td className="py-3">
                          <strong>{module.name}</strong>
                          <p className="text-xs text-slate-500">
                            {module.description}
                          </p>
                        </td>
                        {(["none", "read", "write"] as const).map((level) => (
                          <td key={level}>
                            <input
                              type="radio"
                              name={`permission-${module.id}`}
                              checked={
                                (roleForm.permissions[module.id] ?? "none") ===
                                level
                              }
                              onChange={() =>
                                setRoleForm({
                                  ...roleForm,
                                  permissions: {
                                    ...roleForm.permissions,
                                    [module.id]: level,
                                  },
                                })
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!roleForm.name || !roleForm.areaId}
            >
              Criar cargo
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowRoleForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      {tab === "users" ? (
        <div className="space-y-3">
          {users.map((user) => (
            <article
              className="rounded-xl bg-white p-5 shadow-sm"
              key={user.id}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-slate-500">
                    {formatCpf(user.cpf)} · {user.email}
                  </p>
                </div>
                <span className="text-sm">
                  {user.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
              {user.churches.map((church) => (
                <div className="mt-3 border-t pt-3" key={church.id}>
                  <strong className="text-sm">{church.name}</strong>
                  <ul className="ml-5 list-disc text-sm text-slate-600">
                    {church.roles.map((role) => (
                      <li
                        key={`${role.id}-${role.department?.id ?? "general"}`}
                      >
                        {role.name}
                        {role.department && ` — ${role.department.name}`}
                        {role.isAdministrator && " — Administrador"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mt-4 flex gap-2">
                <Button variant="view">Visualizar</Button>
                <Button
                  variant="edit"
                  disabled
                  title="Funcionalidade disponível em uma próxima etapa."
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  disabled
                  title="Funcionalidade disponível em uma próxima etapa."
                >
                  Remover acesso
                </Button>
              </div>
            </article>
          ))}
          {!users.length && (
            <p className="rounded-xl bg-white p-5 text-sm text-slate-500">
              Nenhum usuário vinculado.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-4">Cargo</th>
                <th>Área</th>
                <th>Usuários</th>
                <th>Administrador</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr className="border-b" key={role.id}>
                  <td className="p-4">
                    <strong>{role.name}</strong>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </td>
                  <td>{role.area.name}</td>
                  <td>{role.userCount}</td>
                  <td>{role.isAdministrator ? "Sim" : "Não"}</td>
                  <td>{role.status === "active" ? "Ativo" : "Inativo"}</td>
                  <td>
                    <Button variant="view">Visualizar</Button>{" "}
                    <Button
                      variant="edit"
                      disabled
                      title="Funcionalidade disponível em uma próxima etapa."
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
