import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Church } from "../../churches/entities/church.entity";
import { City } from "../../geography/entities/city.entity";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "church_id", type: "uuid", nullable: true })
  churchId: string | null;

  @ManyToOne(() => Church, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "church_id" })
  church: Church | null;

  @Column()
  name: string;

  @Column({ unique: true, length: 11 })
  cpf: string;

  @Column({ type: "varchar", nullable: true })
  email: string | null;

  @Column({ type: "varchar", nullable: true }) phone: string | null;
  @Column({ name: "birth_date", type: "date", nullable: true }) birthDate: string | null;
  @Column({ type: "varchar", length: 1, nullable: true }) sex: "M" | "F" | null;
  @Column({ name: "postal_code", type: "varchar", length: 8, nullable: true }) postalCode: string | null;
  @Column({ type: "varchar", nullable: true }) street: string | null;
  @Column({ type: "varchar", length: 20, nullable: true }) number: string | null;
  @Column({ type: "varchar", nullable: true }) complement: string | null;
  @Column({ type: "varchar", nullable: true }) neighborhood: string | null;
  @Column({ name: "city_id", type: "integer", nullable: true }) cityId: number | null;
  @ManyToOne(() => City, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "city_id" }) city: City | null;

  @Column({ default: "active" })
  status: string;

  @Column({ name: "user_id", type: "uuid", nullable: true, unique: true })
  userId: string | null;

  @OneToOne(() => User, (user) => user.member, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "user_id" })
  user?: User | null;

  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
}
