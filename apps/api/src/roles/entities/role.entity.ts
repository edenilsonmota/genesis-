import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Area } from "../../areas/entities/area.entity";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  fixed: boolean;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({ name: "area_id", type: "uuid", nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "area_id" })
  area: Area | null;

  @Column({ name: "is_administrator", default: false })
  isAdministrator: boolean;

  @Column({ default: "active" })
  status: string;

  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
}
