import { DataSource } from "typeorm";
import { City } from "../entities/city.entity";
import { State } from "../entities/state.entity";

type IbgeState = { id: number; sigla: string; nome: string };
type IbgeCity = { id: number; nome: string };
const baseUrl = "https://servicodados.ibge.gov.br/api/v1/localidades";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok)
    throw new Error(`IBGE respondeu com HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function syncGeography(dataSource: DataSource) {
  const states = await getJson<IbgeState[]>(`${baseUrl}/estados?orderBy=nome`);
  const citiesByState = await Promise.all(
    states.map(async (state) => ({
      state,
      cities: await getJson<IbgeCity[]>(
        `${baseUrl}/estados/${state.id}/municipios?orderBy=nome`,
      ),
    })),
  );
  await dataSource.transaction(async (manager) => {
    await manager.getRepository(State).upsert(
      states.map((state) => ({
        id: state.id,
        abbreviation: state.sigla,
        name: state.nome,
      })),
      ["id"],
    );
    for (const item of citiesByState) {
      await manager.getRepository(City).upsert(
        item.cities.map((city) => ({
          id: city.id,
          name: city.nome,
          stateId: item.state.id,
        })),
        ["id"],
      );
    }
  });
  return {
    states: states.length,
    cities: citiesByState.reduce(
      (total, item) => total + item.cities.length,
      0,
    ),
  };
}
