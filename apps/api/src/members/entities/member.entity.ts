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

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "church_id", type: "uuid" })
  churchId: string;

  @ManyToOne(() => Church, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "church_id" })
  church: Church;

  @Column()
  name: string;

  @Column({ unique: true, length: 11 })
  cpf: string;

  @Column({ type: "varchar", nullable: true })
  email: string | null;

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
}
