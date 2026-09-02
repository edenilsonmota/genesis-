import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("audit_logs")
@Index(["createdAt"])
@Index(["resource", "action"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "user_id", type: "uuid", nullable: true }) userId: string | null;
  @Column({ name: "user_name", type: "varchar", nullable: true }) userName: string | null;
  @Column({ name: "user_email", type: "varchar", nullable: true }) userEmail: string | null;
  @Column({ length: 10 }) action: string;
  @Column({ length: 100 }) resource: string;
  @Column({ type: "varchar" }) route: string;
  @Column({ name: "record_id", type: "varchar", nullable: true }) recordId: string | null;
  @Column({ name: "ip_address", type: "varchar", nullable: true }) ipAddress: string | null;
  @Column({ type: "jsonb", nullable: true }) details: Record<string, unknown> | null;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
}
