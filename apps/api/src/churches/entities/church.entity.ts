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

export enum ChurchStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
@Entity("churches")
export class Church {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "area_id", type: "uuid" }) areaId: string;
  @ManyToOne(() => Area, (area) => area.churches, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "area_id" })
  area: Area;
  @Column() name: string;
  @Column({ name: "postal_code", length: 8 }) postalCode: string;
  @Column() street: string;
  @Column() neighborhood: string;
  @Column({ length: 20 }) number: string;
  @Column({ type: "varchar", nullable: true }) complement: string | null;
  @Column({ type: "enum", enum: ChurchStatus, default: ChurchStatus.ACTIVE })
  status: ChurchStatus;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
}
