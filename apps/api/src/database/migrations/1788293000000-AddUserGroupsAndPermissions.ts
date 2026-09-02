import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserGroupsAndPermissions1788293000000 implements MigrationInterface {
  name = "AddUserGroupsAndPermissions1788293000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "must_change_password" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_login_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "members" ADD "cpf" varchar(11)`);
    await queryRunner.query(`ALTER TABLE "members" ADD "email" varchar`);
    await queryRunner.query(
      `ALTER TABLE "members" ADD "status" varchar NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_members_cpf" ON "members" ("cpf") WHERE "cpf" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "roles" ADD "area_id" uuid`);
    await queryRunner.query(
      `DO $$ DECLARE constraint_name text; BEGIN SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'roles'::regclass AND contype = 'u' LIMIT 1; IF constraint_name IS NOT NULL THEN EXECUTE format('ALTER TABLE roles DROP CONSTRAINT %I', constraint_name); END IF; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "is_administrator" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "status" varchar NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_roles_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_roles_area_name_ci" ON "roles" (COALESCE("area_id", '00000000-0000-0000-0000-000000000000'::uuid), LOWER("name"))`,
    );
    await queryRunner.query(
      `UPDATE "roles" SET "is_administrator" = true WHERE "name" = 'admin'`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "category" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'active', CONSTRAINT "UQ_permission_modules_key" UNIQUE ("key"), CONSTRAINT "PK_permission_modules" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permissions_level_enum" AS ENUM('read', 'write')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "permission_module_id" uuid NOT NULL, "level" "public"."role_permissions_level_enum" NOT NULL, CONSTRAINT "UQ_role_permission" UNIQUE ("role_id", "permission_module_id"), CONSTRAINT "PK_role_permissions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_church_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "church_id" uuid NOT NULL, "role_id" uuid NOT NULL, "status" varchar NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_user_church_role" UNIQUE ("user_id", "church_id", "role_id"), CONSTRAINT "PK_user_church_roles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_module" FOREIGN KEY ("permission_module_id") REFERENCES "permission_modules"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_church_roles" ADD CONSTRAINT "FK_ucr_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_church_roles" ADD CONSTRAINT "FK_ucr_church" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_church_roles" ADD CONSTRAINT "FK_ucr_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `INSERT INTO "permission_modules" ("key","name","description","category") VALUES ('dashboard','Dashboard','Visualização do painel inicial','Geral'),('members','Membros','Cadastro e consulta de membros','Organização'),('users','Usuários','Acessos e vínculos de usuários','Administração'),('roles','Cargos','Cargos e suas permissões','Administração'),('areas','Áreas','Cadastro e consulta de áreas','Organização'),('churches','Igrejas','Cadastro e consulta de igrejas','Organização')`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_church_roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TYPE "public"."role_permissions_level_enum"`);
    await queryRunner.query(`DROP TABLE "permission_modules"`);
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_area"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_roles_area_name_ci"`);
    await queryRunner.query(
      `ALTER TABLE "roles" DROP COLUMN "updated_at", DROP COLUMN "created_at", DROP COLUMN "status", DROP COLUMN "is_administrator", DROP COLUMN "area_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_roles_name" UNIQUE ("name")`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_members_cpf"`);
    await queryRunner.query(
      `ALTER TABLE "members" DROP COLUMN "status", DROP COLUMN "email", DROP COLUMN "cpf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "last_login_at", DROP COLUMN "must_change_password"`,
    );
  }
}
