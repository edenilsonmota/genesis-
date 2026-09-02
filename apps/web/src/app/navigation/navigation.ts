import type { AuthenticatedUser } from "../../features/auth/types/auth";

export type PermissionAction = "view" | "create" | "update" | "delete";
export type AdminView =
  "organization" | "areas" | "churches" | "members" | "user-groups" | "audit";

export type NavigationItem = {
  id: AdminView;
  label: string;
  path: string;
  resource: string;
  permissions: Record<PermissionAction, string>;
  visible?: boolean;
  viewPermissions?: string[];
};

export type NavigationCategory = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export const navigationCatalog: NavigationCategory[] = [
  {
    id: "organization",
    label: "Organização",
    items: [
      {
        id: "organization",
        label: "Áreas e igrejas",
        path: "/admin/organization",
        resource: "organization",
        permissions: {
          view: "areas.view",
          create: "areas.create",
          update: "areas.update",
          delete: "areas.delete",
        },
        viewPermissions: ["areas.view", "churches.view"],
      },
      {
        id: "members",
        label: "Membros",
        path: "/admin/members",
        resource: "members",
        permissions: {
          view: "members.view",
          create: "members.create",
          update: "members.update",
          delete: "members.delete",
        },
      },
      {
        id: "areas",
        label: "Áreas",
        path: "/admin/areas",
        resource: "areas",
        permissions: {
          view: "areas.view",
          create: "areas.create",
          update: "areas.update",
          delete: "areas.delete",
        },
        visible: false,
      },
      {
        id: "churches",
        label: "Igrejas",
        path: "/admin/churches",
        resource: "churches",
        permissions: {
          view: "churches.view",
          create: "churches.create",
          update: "churches.update",
          delete: "churches.delete",
        },
        visible: false,
      },
    ],
  },
  {
    id: "administration",
    label: "Administração",
    items: [
      {
        id: "audit",
        label: "Auditoria",
        path: "/admin/audit",
        resource: "audit",
        permissions: {
          view: "audit.view",
          create: "audit.create",
          update: "audit.update",
          delete: "audit.delete",
        },
      },
      {
        id: "user-groups",
        label: "Grupos de usuários",
        path: "/admin/user-groups",
        resource: "users",
        permissions: {
          view: "users.view",
          create: "users.create",
          update: "users.update",
          delete: "users.delete",
        },
      },
    ],
  },
];

export function canAccessItem(user: AuthenticatedUser, item: NavigationItem) {
  return (
    user.isAdmin ||
    (item.viewPermissions ?? [item.permissions.view]).some((permission) =>
      user.permissions.includes(permission),
    )
  );
}

export function canPerform(
  user: AuthenticatedUser,
  itemId: AdminView,
  action: PermissionAction,
) {
  const item = navigationCatalog
    .flatMap((category) => category.items)
    .find((candidate) => candidate.id === itemId);
  return Boolean(
    item &&
    (user.isAdmin || user.permissions.includes(item.permissions[action])),
  );
}
