import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandMembers1788295000000 implements MigrationInterface {
  name = "ExpandMembers1788295000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "members" ALTER COLUMN "church_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "members" ADD "phone" varchar`);
    await queryRunner.query(`ALTER TABLE "members" ADD "birth_date" date`);
    await queryRunner.query(`ALTER TABLE "members" ADD "sex" varchar(1)`);
    await queryRunner.query(`ALTER TABLE "members" ADD "postal_code" varchar(8)`);
    await queryRunner.query(`ALTER TABLE "members" ADD "street" varchar`);
    await queryRunner.query(`ALTER TABLE "members" ADD "number" varchar(20)`);
    await queryRunner.query(`ALTER TABLE "members" ADD "complement" varchar`);
    await queryRunner.query(`ALTER TABLE "members" ADD "neighborhood" varchar`);
    await queryRunner.query(`ALTER TABLE "members" ADD "city_id" integer`);
    await queryRunner.query(`ALTER TABLE "members" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "members" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "CK_members_sex" CHECK ("sex" IS NULL OR "sex" IN ('M', 'F'))`);
    await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_members_city" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" ADD "started_at" date`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" ADD "ended_at" date`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_church_roles" DROP COLUMN "ended_at"`);
    await queryRunner.query(`ALTER TABLE "user_church_roles" DROP COLUMN "started_at"`);
    await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_members_city"`);
    await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "CK_members_sex"`);
    for (const column of ["updated_at", "created_at", "city_id", "neighborhood", "complement", "number", "street", "postal_code", "sex", "birth_date", "phone"])
      await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "${column}"`);
    await queryRunner.query(`ALTER TABLE "members" ALTER COLUMN "church_id" SET NOT NULL`);
  }
}
