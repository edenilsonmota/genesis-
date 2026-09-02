import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Role } from "../../roles/entities/role.entity";
import { PermissionModule } from "./permission-module.entity";

export enum PermissionLevel {
  READ = "read",
  WRITE = "write",
}
@Entity("role_permissions")
@Unique(["roleId", "permissionModuleId"])
export class RolePermission {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "role_id", type: "uuid" }) roleId: string;
  @ManyToOne(() => Role, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role: Role;
  @Column({ name: "permission_module_id", type: "uuid" })
  permissionModuleId: string;
  @ManyToOne(() => PermissionModule, { onDelete: "CASCADE" })
  @JoinColumn({ name: "permission_module_id" })
  permissionModule: PermissionModule;
  @Column({ type: "enum", enum: PermissionLevel }) level: PermissionLevel;
}
