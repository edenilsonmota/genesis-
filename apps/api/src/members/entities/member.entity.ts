import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "church_id", type: "uuid" })
  churchId: string;

  @Column()
  name: string;

  @Column({ name: "user_id", type: "uuid", nullable: true, unique: true })
  userId: string | null;

  @OneToOne(() => User, (user) => user.member, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "user_id" })
  user?: User | null;
}
