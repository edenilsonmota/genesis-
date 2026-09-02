import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Church } from "../../churches/entities/church.entity";
import { Role } from "../../roles/entities/role.entity";
import { User } from "../../users/entities/user.entity";
import { Department } from "../../departments/entities/department.entity";

@Entity("user_church_roles")
export class UserChurchRole {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "user_id", type: "uuid" }) userId: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
  @Column({ name: "church_id", type: "uuid" }) churchId: string;
  @ManyToOne(() => Church, { onDelete: "CASCADE" })
  @JoinColumn({ name: "church_id" })
  church: Church;
  @Column({ name: "role_id", type: "uuid" }) roleId: string;
  @ManyToOne(() => Role, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "role_id" })
  role: Role;
  @Column({ name: "department_id", type: "uuid", nullable: true }) departmentId: string | null;
  @ManyToOne(() => Department, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "department_id" })
  department: Department | null;
  @Column({ default: "active" }) status: string;
  @Column({ name: "started_at", type: "date", nullable: true }) startedAt: string | null;
  @Column({ name: "ended_at", type: "date", nullable: true }) endedAt: string | null;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
}
