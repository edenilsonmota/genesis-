import type { AuthenticatedUser } from "../../features/auth/types/auth";

export type PermissionAction = "view" | "create" | "update" | "delete";
export type AdminView = "areas" | "churches" | "members" | "user-groups";

export type NavigationItem = {
  id: AdminView;
  label: string;
  path: string;
  resource: string;
  permissions: Record<PermissionAction, string>;
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
        id: "members",
        label: "Membros",
        path: "/admin/members",
        resource: "members",
        permissions: { view: "members.view", create: "members.create", update: "members.update", delete: "members.delete" },
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
      },
    ],
  },
  {
    id: "administration",
    label: "Administração",
    items: [
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
  return user.isAdmin || user.permissions.includes(item.permissions.view);
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
