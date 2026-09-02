import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Church } from "../../churches/entities/church.entity";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "church_id", type: "uuid" }) churchId: string;
  @ManyToOne(() => Church, { onDelete: "CASCADE" })
  @JoinColumn({ name: "church_id" }) church: Church;
  @Column() name: string;
  @Column({ type: "varchar", nullable: true }) description: string | null;
  @Column({ default: "active" }) status: string;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
}
