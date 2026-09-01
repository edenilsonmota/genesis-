import { http } from "../../../lib/http";
import type { Area, Church, City, PostalAddress, State } from "../types/admin";

const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
export const listAreas = async (token: string) =>
  (await http.get<Area[]>("/areas", auth(token))).data;
export const createArea = async (
  token: string,
  data: { name: string; cityId: number },
) => (await http.post<Area>("/areas", data, auth(token))).data;
export const listChurches = async (token: string) =>
  (await http.get<Church[]>("/churches", auth(token))).data;
export const lookupPostalCode = async (token: string, postalCode: string) =>
  (
    await http.get<PostalAddress>(
      `/churches/postal-code/${postalCode}`,
      auth(token),
    )
  ).data;
export const createChurch = async (
  token: string,
  data: {
    areaId: string;
    name: string;
    postalCode: string;
    number: string;
    complement?: string;
  },
) => (await http.post<Church>("/churches", data, auth(token))).data;
export const listStates = async (token: string) =>
  (await http.get<State[]>("/geography/states", auth(token))).data;
export const listCities = async (token: string, stateId: number) =>
  (await http.get<City[]>(`/geography/states/${stateId}/cities`, auth(token)))
    .data;
