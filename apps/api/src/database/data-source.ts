import "dotenv/config";
import { DataSource } from "typeorm";
import { Member } from "../members/entities/member.entity";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Area } from "../areas/entities/area.entity";
import { Church } from "../churches/entities/church.entity";
import { City } from "../geography/entities/city.entity";
import { State } from "../geography/entities/state.entity";
import { PermissionModule } from "../permissions/entities/permission-module.entity";
import { RolePermission } from "../permissions/entities/role-permission.entity";
import { UserChurchRole } from "../user-groups/entities/user-church-role.entity";
import { Department } from "../departments/entities/department.entity";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  database: process.env.DATABASE_NAME ?? "genesis_plus",
  username: process.env.DATABASE_USER ?? "genesis",
  password: process.env.DATABASE_PASSWORD ?? "genesis",
  entities: [
    User,
    Role,
    Member,
    Area,
    Church,
    State,
    City,
    PermissionModule,
    RolePermission,
    UserChurchRole,
    Department,
  ],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
});

export default AppDataSource;
