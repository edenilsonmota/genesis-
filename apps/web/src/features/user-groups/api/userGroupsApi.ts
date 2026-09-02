import { http } from "../../../lib/http";
import type {
  AccessUser,
  Department,
  Member,
  Page,
  PermissionModule,
  Role,
  RolePermissionInput,
} from "../types/userGroups";
const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
export const listPermissionCatalog = async (token: string) =>
  (await http.get<PermissionModule[]>("/permissions/catalog", auth(token)))
    .data;
export const listRoles = async (
  token: string,
  params: Record<string, string> = {},
) => (await http.get<Page<Role>>("/roles", { ...auth(token), params })).data;
export const createRole = async (
  token: string,
  data: {
    name: string;
    description?: string;
    areaId: string;
    status: string;
    isAdministrator: boolean;
    permissions: RolePermissionInput[];
  },
) => (await http.post<Role>("/roles", data, auth(token))).data;
export const listAccessUsers = async (
  token: string,
  params: Record<string, string> = {},
) =>
  (
    await http.get<Page<AccessUser>>("/user-groups/users", {
      ...auth(token),
      params,
    })
  ).data;
export const searchMembers = async (token: string, search: string) =>
  (
    await http.get<Member[]>("/user-groups/members", {
      ...auth(token),
      params: { search },
    })
  ).data;
export const listDepartments = async (token: string, churchId?: string) =>
  (
    await http.get<Department[]>("/departments", {
      ...auth(token),
      params: { churchId },
    })
  ).data;
export const createDepartment = async (
  token: string,
  data: { churchId: string; name: string },
) => (await http.post<Department>("/departments", data, auth(token))).data;
export const grantAccess = async (
  token: string,
  data: {
    memberId: string;
    churchId: string;
    roleIds: string[];
    departmentId?: string;
    email?: string;
  },
) => (await http.post("/user-groups/users", data, auth(token))).data;
