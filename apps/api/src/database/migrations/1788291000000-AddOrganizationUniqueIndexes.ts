import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationUniqueIndexes1788291000000 implements MigrationInterface {
  name = "AddOrganizationUniqueIndexes1788291000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_areas_name_ci" ON "areas" (LOWER("name"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_churches_area_name_ci" ON "churches" ("area_id", LOWER("name"))`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_churches_area_name_ci"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_areas_name_ci"`);
  }
}
