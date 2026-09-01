import { DataSource } from "typeorm";
import { Role } from "../../roles/entities/role.entity";
import { User } from "../../users/entities/user.entity";
import { bootstrapAdmin } from "./bootstrap-admin";

describe("bootstrapAdmin", () => {
  function fakeDatabase() {
    const roles: Role[] = [];
    const users: User[] = [];
    const roleStore = {
      findOneBy: jest.fn(
        async ({ name }: { name: string }) =>
          roles.find((role) => role.name === name) ?? null,
      ),
      create: jest.fn((value: Role) => value),
      save: jest.fn(async (value: Role) => {
        const saved = { ...value, id: value.id ?? "admin-role" };
        if (!roles.some((role) => role.id === saved.id)) roles.push(saved);
        return saved;
      }),
    };
    const userStore = {
      findOne: jest.fn(
        async ({ where }: { where: { email: string } }) =>
          users.find((user) => user.email === where.email) ?? null,
      ),
      create: jest.fn((value: User) => value),
      save: jest.fn(async (value: User) => {
        const saved = { ...value, id: value.id ?? "admin-user" } as User;
        const index = users.findIndex((user) => user.id === saved.id);
        if (index < 0) users.push(saved);
        else users[index] = saved;
        return saved;
      }),
    };
    const manager = {
      getRepository: (entity: unknown) =>
        entity === Role ? roleStore : userStore,
    };
    const dataSource = {
      transaction: (callback: (value: typeof manager) => unknown) =>
        callback(manager),
    };
    return { dataSource: dataSource as unknown as DataSource, roles, users };
  }

  const options = {
    name: "Admin",
    email: "ADMIN@example.com",
    password: "strong-password-123",
  };

  it("creates the initial administrator with a password hash", async () => {
    const database = fakeDatabase();
    const result = await bootstrapAdmin(database.dataSource, options);
    expect(result.created).toBe(true);
    expect(database.roles).toHaveLength(1);
    expect(database.users).toHaveLength(1);
    expect(database.users[0].passwordHash).not.toBe(options.password);
  });

  it("is idempotent", async () => {
    const database = fakeDatabase();
    await bootstrapAdmin(database.dataSource, options);
    const result = await bootstrapAdmin(database.dataSource, options);
    expect(result.created).toBe(false);
    expect(database.roles).toHaveLength(1);
    expect(database.users).toHaveLength(1);
  });

  it("rejects passwords shorter than eight characters", async () => {
    const database = fakeDatabase();
    await expect(
      bootstrapAdmin(database.dataSource, { ...options, password: "1234567" }),
    ).rejects.toThrow(
      "DEFAULT_ADMIN_PASSWORD deve possuir pelo menos 8 caracteres.",
    );
  });
});
