import type { Area, Church } from "../../admin/types/admin";
export type PermissionModule = {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
};
export type Role = {
  id: string;
  name: string;
  description: string | null;
  areaId: string;
  area: Area;
  status: string;
  isAdministrator: boolean;
  userCount: number;
  createdAt: string;
};
export type Member = {
  id: string;
  name: string;
  cpf: string;
  email: string | null;
  user?: { id: string; email: string } | null;
};
export type Department = {
  id: string;
  churchId: string;
  name: string;
  description: string | null;
  status: string;
};
export type AccessUser = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  status: string;
  lastLoginAt: string | null;
  isGlobalAdmin: boolean;
  churches: Array<{
    id: string;
    name: string;
    roles: Array<{
      id: string;
      name: string;
      isAdministrator: boolean;
      department: { id: string; name: string } | null;
    }>;
  }>;
};
export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
export type RolePermissionInput = {
  permissionModuleId: string;
  level: "read" | "write";
};
export type UserGroupReferences = {
  areas: Area[];
  churches: Church[];
  roles: Role[];
};
