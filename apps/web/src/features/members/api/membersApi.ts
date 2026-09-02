import { http } from "../../../lib/http";
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export type MemberItem = { id: string; name: string; cpf: string; email: string | null; phone: string | null; sex: "M" | "F" | null; status: string; createdAt: string; assignments: Array<{ id: string; church: { id: string; name: string }; role: { id: string; name: string }; department: { id: string; name: string } | null }> };
export type MemberPage = { items: MemberItem[]; page: number; limit: number; total: number };
export const listMembers = async (token: string, params: Record<string, string>) => (await http.get<MemberPage>("/members", { ...auth(token), params })).data;
export const createMember = async (token: string, data: Record<string, unknown>) => (await http.post<MemberItem>("/members", data, auth(token))).data;
export const inactivateMember = async (token: string, id: string) => (await http.patch(`/members/${id}/inactivate`, {}, auth(token))).data;
