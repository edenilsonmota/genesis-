import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartments1788294000000 implements MigrationInterface {
  name = "AddDepartments1788294000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_departments_church" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_departments_church_name" ON "departments" ("church_id", LOWER("name"))`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" DROP CONSTRAINT "UQ_user_church_role"`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" ADD "department_id" uuid`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" ADD CONSTRAINT "FK_user_church_roles_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_church_role_without_department" ON "user_church_roles" ("user_id", "church_id", "role_id") WHERE "department_id" IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_church_role_department" ON "user_church_roles" ("user_id", "church_id", "role_id", "department_id") WHERE "department_id" IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_user_church_role_department"`);
    await queryRunner.query(`DROP INDEX "UQ_user_church_role_without_department"`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" DROP CONSTRAINT "FK_user_church_roles_department"`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" DROP COLUMN "department_id"`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" ADD CONSTRAINT "UQ_user_church_role" UNIQUE ("user_id", "church_id", "role_id")`);
    await queryRunner.query(`DROP INDEX "UQ_departments_church_name"`);
    await queryRunner.query(`DROP TABLE "departments"`);
  }
}
