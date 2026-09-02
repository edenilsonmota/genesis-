import { Exclude } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Member } from "../../members/entities/member.entity";
import { Role } from "../../roles/entities/role.entity";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ name: "password_hash", select: false })
  passwordHash: string;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: "must_change_password", default: false })
  mustChangePassword: boolean;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt: Date | null;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: "user_global_roles" })
  roles: Role[];

  @OneToOne(() => Member, (member) => member.user)
  member?: Member | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
