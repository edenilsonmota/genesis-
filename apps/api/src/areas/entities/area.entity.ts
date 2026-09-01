import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Church } from "../../churches/entities/church.entity";
import { City } from "../../geography/entities/city.entity";

@Entity("areas")
export class Area {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ unique: true }) name: string;
  @Column({ name: "city_id", type: "integer" }) cityId: number;
  @ManyToOne(() => City, (city) => city.areas, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "city_id" })
  city: City;
  @OneToMany(() => Church, (church) => church.area) churches?: Church[];
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
}
