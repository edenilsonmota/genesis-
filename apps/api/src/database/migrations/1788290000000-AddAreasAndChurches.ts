import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAreasAndChurches1788290000000 implements MigrationInterface {
  name = "AddAreasAndChurches1788290000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL, "city" varchar NOT NULL, "state" varchar(2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_areas_name" UNIQUE ("name"), CONSTRAINT "PK_areas" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."churches_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "churches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "area_id" uuid NOT NULL, "name" varchar NOT NULL, "postal_code" varchar(8) NOT NULL, "street" varchar NOT NULL, "neighborhood" varchar NOT NULL, "number" varchar(20) NOT NULL, "complement" varchar, "status" "public"."churches_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_churches" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" ADD CONSTRAINT "FK_churches_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_members_church" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE RESTRICT`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_members_church"`,
    );
    await queryRunner.query(`DROP TABLE "churches"`);
    await queryRunner.query(`DROP TYPE "public"."churches_status_enum"`);
    await queryRunner.query(`DROP TABLE "areas"`);
  }
}
