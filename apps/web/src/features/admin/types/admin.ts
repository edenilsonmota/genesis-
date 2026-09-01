export type State = { id: number; name: string; abbreviation: string };
export type City = { id: number; name: string; stateId: number; state?: State };
export type Area = { id: string; name: string; cityId: number; city: City };
export type Church = {
  id: string;
  name: string;
  postalCode: string;
  street: string;
  neighborhood: string;
  number: string;
  complement: string | null;
  status: "active" | "inactive";
  area: Area;
};
export type PostalAddress = {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};
