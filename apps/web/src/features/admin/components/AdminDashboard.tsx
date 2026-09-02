import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../lib/http";
import { SearchableSelect } from "../../../components/forms/SearchableSelect";
import { TopNavigation } from "../../../layouts/TopNavigation";
import {
  canPerform,
  navigationCatalog,
  type AdminView,
} from "../../../app/navigation/navigation";
import { useAuth } from "../../auth/context/useAuth";
import {
  createArea,
  createChurch,
  listAreas,
  listChurches,
  listCities,
  listStates,
  lookupPostalCode,
} from "../api/adminApi";
import type { Area, Church, City, PostalAddress, State } from "../types/admin";
import { UserGroupsPage } from "../../user-groups/components/UserGroupsPage";
import { MembersPage } from "../../members/components/MembersPage";
import { AuditPage } from "../../audit/components/AuditPage";
import { Button, FeatureTabs, PageHeader } from "../../../components/ui";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
export function AdminDashboard() {
  const { accessToken, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tab: AdminView = location.pathname.endsWith("/audit")
    ? "audit"
    : location.pathname.endsWith("/members")
      ? "members"
      : location.pathname.endsWith("/user-groups")
        ? "user-groups"
        : "organization";
  const navigateTo = (view: AdminView) => {
    const item = navigationCatalog
      .flatMap((category) => category.items)
      .find((candidate) => candidate.id === view);
    if (item) navigate(item.path);
  };
  const [areas, setAreas] = useState<Area[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [address, setAddress] = useState<PostalAddress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [areaForm, setAreaForm] = useState<{
    name: string;
    cityId: number | null;
  }>({ name: "", cityId: null });
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [churchForm, setChurchForm] = useState({
    areaId: "",
    name: "",
    postalCode: "",
    number: "",
    complement: "",
  });
  const [organizationTab, setOrganizationTab] = useState<"areas" | "churches">(
    "areas",
  );
  const canViewAreas = Boolean(
    user && (user.isAdmin || user.permissions.includes("areas.view")),
  );
  const canViewChurches = Boolean(
    user && (user.isAdmin || user.permissions.includes("churches.view")),
  );
  useEffect(() => {
    if (!canViewAreas && canViewChurches) setOrganizationTab("churches");
  }, [canViewAreas, canViewChurches]);
  useEffect(() => {
    if (location.pathname.endsWith("/churches")) {
      setOrganizationTab("churches");
      navigate("/admin/organization", { replace: true });
    } else if (location.pathname.endsWith("/areas")) {
      setOrganizationTab("areas");
      navigate("/admin/organization", { replace: true });
    }
  }, [location.pathname, navigate]);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    const [nextAreas, nextChurches, nextStates] = await Promise.all([
      listAreas(accessToken),
      listChurches(accessToken),
      listStates(accessToken),
    ]);
    setAreas(nextAreas);
    setChurches(nextChurches);
    setStates(nextStates);
  }, [accessToken]);
  useEffect(() => {
    refresh().catch((error) => setMessage(getApiErrorMessage(error)));
  }, [refresh]);

  async function selectState(stateId: number | null) {
    setSelectedStateId(stateId);
    setAreaForm((current) => ({ ...current, cityId: null }));
    setCities(
      stateId && accessToken ? await listCities(accessToken, stateId) : [],
    );
  }

  async function submitArea(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !areaForm.cityId) return;
    try {
      await createArea(accessToken, {
        name: areaForm.name,
        cityId: areaForm.cityId,
      });
      setAreaForm({ name: "", cityId: null });
      setSelectedStateId(null);
      setCities([]);
      setMessage("Área criada com sucesso.");
      await refresh();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }
  async function findAddress() {
    if (!accessToken || churchForm.postalCode.replace(/\D/g, "").length !== 8)
      return;
    try {
      setAddress(await lookupPostalCode(accessToken, churchForm.postalCode));
      setMessage(null);
    } catch (error) {
      setAddress(null);
      setMessage(getApiErrorMessage(error));
    }
  }
  async function submitChurch(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    try {
      await createChurch(accessToken, churchForm);
      setChurchForm({
        areaId: "",
        name: "",
        postalCode: "",
        number: "",
        complement: "",
      });
      setAddress(null);
      setMessage("Igreja criada com sucesso.");
      await refresh();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      {user && (
        <TopNavigation
          user={user}
          currentView={tab}
          onNavigate={navigateTo}
          onLogout={logout}
        />
      )}
      <div className="mx-auto max-w-6xl p-5">
        {message && (
          <p className="mb-5 rounded-lg border border-slate-200 bg-white p-3 text-sm">
            {message}
          </p>
        )}
        {tab === "audit" ? (
          <AuditPage />
        ) : tab === "members" ? (
          <MembersPage />
        ) : tab === "user-groups" ? (
          <UserGroupsPage />
        ) : tab === "organization" ? (
          <div className="space-y-8">
            <PageHeader
              title="Áreas e igrejas"
              description="Organize as áreas e as igrejas vinculadas em um só lugar."
            />
            <FeatureTabs
              label="Áreas e igrejas"
              value={organizationTab}
              onChange={setOrganizationTab}
              tabs={[
                ...(canViewAreas
                  ? [{ id: "areas" as const, label: "Áreas" }]
                  : []),
                ...(canViewChurches
                  ? [{ id: "churches" as const, label: "Igrejas" }]
                  : []),
              ]}
            />
            {organizationTab === "areas" && canViewAreas && (
              <section role="tabpanel">
                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                  <form
                    className="space-y-4 rounded-xl bg-white p-5 shadow-sm"
                    onSubmit={submitArea}
                  >
                    <h1 className="font-display text-xl font-bold">
                      Nova área
                    </h1>
                    <label className="block text-sm font-semibold">
                      Nome
                      <input
                        className={inputClass}
                        value={areaForm.name}
                        onChange={(e) =>
                          setAreaForm({ ...areaForm, name: e.target.value })
                        }
                        required
                      />
                    </label>
                    <SearchableSelect
                      label="Estado"
                      options={states.map((state) => ({
                        id: state.id,
                        label: `${state.name} (${state.abbreviation})`,
                      }))}
                      value={
                        states
                          .filter((state) => state.id === selectedStateId)
                          .map((state) => ({
                            id: state.id,
                            label: `${state.name} (${state.abbreviation})`,
                          }))[0] ?? null
                      }
                      onChange={(option) =>
                        void selectState(option ? Number(option.id) : null)
                      }
                      placeholder="Pesquise o estado"
                    />
                    <SearchableSelect
                      label="Cidade"
                      options={cities.map((city) => ({
                        id: city.id,
                        label: city.name,
                      }))}
                      value={
                        cities
                          .filter((city) => city.id === areaForm.cityId)
                          .map((city) => ({
                            id: city.id,
                            label: city.name,
                          }))[0] ?? null
                      }
                      onChange={(option) =>
                        setAreaForm({
                          ...areaForm,
                          cityId: option ? Number(option.id) : null,
                        })
                      }
                      placeholder="Pesquise a cidade"
                      disabled={!selectedStateId}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        !areaForm.cityId ||
                        !user ||
                        !canPerform(user, "areas", "create")
                      }
                      className="w-full"
                    >
                      Cadastrar área
                    </Button>
                  </form>
                  <section className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-display text-xl font-bold">
                      Áreas cadastradas
                    </h2>
                    <div className="divide-y">
                      {areas.map((area) => (
                        <div className="py-3" key={area.id}>
                          <strong>{area.name}</strong>
                          <p className="text-sm text-slate-500">
                            {area.city.name} — {area.city.state?.abbreviation}
                          </p>
                        </div>
                      ))}
                      {!areas.length && (
                        <p className="text-sm text-slate-500">
                          Nenhuma área cadastrada.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </section>
            )}
            {organizationTab === "churches" && canViewChurches && (
              <section role="tabpanel">
                <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                  <form
                    className="space-y-4 rounded-xl bg-white p-5 shadow-sm"
                    onSubmit={submitChurch}
                  >
                    <h1 className="font-display text-xl font-bold">
                      Nova igreja
                    </h1>
                    <SearchableSelect
                      label="Área"
                      options={areas.map((area) => ({
                        id: area.id,
                        label: `${area.name} — ${area.city.name}/${area.city.state?.abbreviation}`,
                      }))}
                      value={
                        areas
                          .filter((area) => area.id === churchForm.areaId)
                          .map((area) => ({
                            id: area.id,
                            label: `${area.name} — ${area.city.name}/${area.city.state?.abbreviation}`,
                          }))[0] ?? null
                      }
                      onChange={(option) =>
                        setChurchForm({
                          ...churchForm,
                          areaId: option ? String(option.id) : "",
                        })
                      }
                      placeholder="Pesquise a área"
                    />
                    <label className="block text-sm font-semibold">
                      Nome
                      <input
                        className={inputClass}
                        value={churchForm.name}
                        onChange={(e) =>
                          setChurchForm({ ...churchForm, name: e.target.value })
                        }
                        required
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      CEP
                      <input
                        className={inputClass}
                        value={churchForm.postalCode}
                        onBlur={findAddress}
                        onChange={(e) => {
                          setChurchForm({
                            ...churchForm,
                            postalCode: e.target.value,
                          });
                          setAddress(null);
                        }}
                        required
                      />
                    </label>
                    {address && (
                      <div className="rounded-lg bg-emerald-50 p-3 text-sm">
                        <strong>{address.street}</strong>
                        <p>
                          {address.neighborhood} — {address.city}/
                          {address.state}
                        </p>
                      </div>
                    )}
                    <label className="block text-sm font-semibold">
                      Número
                      <input
                        className={inputClass}
                        value={churchForm.number}
                        onChange={(e) =>
                          setChurchForm({
                            ...churchForm,
                            number: e.target.value,
                          })
                        }
                        required
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      Complemento
                      <input
                        className={inputClass}
                        value={churchForm.complement}
                        onChange={(e) =>
                          setChurchForm({
                            ...churchForm,
                            complement: e.target.value,
                          })
                        }
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        !user || !canPerform(user, "churches", "create")
                      }
                      className="w-full"
                    >
                      Cadastrar igreja
                    </Button>
                  </form>
                  <section className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-display text-xl font-bold">
                      Igrejas cadastradas
                    </h2>
                    <div className="divide-y">
                      {churches.map((church) => (
                        <div className="py-3" key={church.id}>
                          <strong>{church.name}</strong>
                          <p className="text-sm text-slate-500">
                            {church.area.name} · {church.street},{" "}
                            {church.number} — {church.neighborhood}
                          </p>
                        </div>
                      ))}
                      {!churches.length && (
                        <p className="text-sm text-slate-500">
                          Nenhuma igreja cadastrada.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
