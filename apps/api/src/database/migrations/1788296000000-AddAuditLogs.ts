import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogs1788296000000 implements MigrationInterface {
  name = "AddAuditLogs1788296000000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "user_name" varchar, "user_email" varchar, "action" varchar(10) NOT NULL, "resource" varchar(100) NOT NULL, "route" varchar NOT NULL, "record_id" varchar, "ip_address" varchar, "details" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_resource_action" ON "audit_logs" ("resource", "action")`);
    await queryRunner.query(`INSERT INTO "permission_modules" ("key", "name", "description", "category", "status") VALUES ('audit', 'Auditoria', 'Consulta ao histórico de operações do sistema', 'Administração', 'active') ON CONFLICT ("key") DO NOTHING`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "permission_modules" WHERE "key" = 'audit'`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_resource_action"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
