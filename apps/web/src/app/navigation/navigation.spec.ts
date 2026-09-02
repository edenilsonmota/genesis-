import { describe, expect, it } from "vitest";
import type { AuthenticatedUser } from "../../features/auth/types/auth";
import { canAccessItem, canPerform, navigationCatalog } from "./navigation";

const user = (permissions: string[], isAdmin = false) =>
  ({ permissions, isAdmin }) as AuthenticatedUser;
const areas = navigationCatalog[0].items[0];

describe("navigation permissions", () => {
  it("shows an item only with its view permission", () => {
    expect(canAccessItem(user(["areas.view"]), areas)).toBe(true);
    expect(canAccessItem(user(["areas.create"]), areas)).toBe(false);
  });

  it("checks each action independently", () => {
    expect(canPerform(user(["areas.create"]), "areas", "create")).toBe(true);
    expect(canPerform(user(["areas.create"]), "areas", "delete")).toBe(false);
  });

  it("allows the global administrator", () => {
    expect(canAccessItem(user([], true), areas)).toBe(true);
    expect(canPerform(user([], true), "areas", "delete")).toBe(true);
  });
});
