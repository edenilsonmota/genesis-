import "dotenv/config";
import { DataSource } from "typeorm";
import { Member } from "../members/entities/member.entity";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  database: process.env.DATABASE_NAME ?? "genesis_plus",
  username: process.env.DATABASE_USER ?? "genesis",
  password: process.env.DATABASE_PASSWORD ?? "genesis",
  entities: [User, Role, Member],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
});

export default AppDataSource;
