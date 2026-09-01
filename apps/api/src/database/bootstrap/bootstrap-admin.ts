import { hash } from "bcryptjs";
import { DataSource } from "typeorm";
import { Role } from "../../roles/entities/role.entity";
import { User, UserStatus } from "../../users/entities/user.entity";

export interface BootstrapAdminOptions {
  name?: string;
  email?: string;
  password?: string;
}

export async function bootstrapAdmin(
  dataSource: DataSource,
  options: BootstrapAdminOptions,
) {
  if (!options.name || !options.email || !options.password) {
    throw new Error(
      "Defina DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL e DEFAULT_ADMIN_PASSWORD.",
    );
  }
  if (options.password.length < 8) {
    throw new Error(
      "DEFAULT_ADMIN_PASSWORD deve possuir pelo menos 8 caracteres.",
    );
  }
  const {
    name,
    email: configuredEmail,
    password,
  } = options as Required<BootstrapAdminOptions>;

  return dataSource.transaction(async (manager) => {
    const roles = manager.getRepository(Role);
    const users = manager.getRepository(User);
    let adminRole = await roles.findOneBy({ name: "admin" });
    if (!adminRole) {
      adminRole = await roles.save(
        roles.create({
          name: "admin",
          fixed: true,
          description: "Administrador global",
        }),
      );
    }

    const email = configuredEmail.trim().toLowerCase();
    const existing = await users.findOne({
      where: { email },
      relations: { roles: true },
    });
    if (existing) {
      if (!(existing.roles ?? []).some((role) => role.name === "admin")) {
        existing.roles = [...(existing.roles ?? []), adminRole];
        await users.save(existing);
      }
      return { created: false, userId: existing.id };
    }

    const user = await users.save(
      users.create({
        name: name.trim(),
        email,
        passwordHash: await hash(password, 12),
        status: UserStatus.ACTIVE,
        roles: [adminRole],
      }),
    );
    return { created: true, userId: user.id };
  });
}
