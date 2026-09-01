import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeGeography1788292000000 implements MigrationInterface {
  name = "NormalizeGeography1788292000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "states" ("id" integer NOT NULL, "abbreviation" varchar(2) NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_states_abbreviation" UNIQUE ("abbreviation"), CONSTRAINT "PK_states" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cities" ("id" integer NOT NULL, "name" varchar NOT NULL, "state_id" integer NOT NULL, CONSTRAINT "PK_cities" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" ADD CONSTRAINT "FK_cities_state" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(`ALTER TABLE "areas" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "areas" DROP COLUMN "state"`);
    await queryRunner.query(
      `ALTER TABLE "areas" ADD "city_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "areas" ADD CONSTRAINT "FK_areas_city" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "areas" DROP CONSTRAINT "FK_areas_city"`,
    );
    await queryRunner.query(`ALTER TABLE "areas" DROP COLUMN "city_id"`);
    await queryRunner.query(
      `ALTER TABLE "areas" ADD "state" varchar(2) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "areas" ADD "city" varchar NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP TABLE "states"`);
  }
}
