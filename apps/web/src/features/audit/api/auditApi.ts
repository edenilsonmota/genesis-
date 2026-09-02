import { http } from "../../../lib/http";
export type AuditLog = { id: string; userId: string | null; userName: string | null; userEmail: string | null; action: string; resource: string; route: string; recordId: string | null; details: Record<string, unknown> | null; createdAt: string };
export type AuditPage = { items: AuditLog[]; page: number; limit: number; total: number };
export const listAuditLogs = async (token: string, params: Record<string, string>) => (await http.get<AuditPage>("/audit", { headers: { Authorization: `Bearer ${token}` }, params })).data;
