import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Area } from "../../areas/entities/area.entity";
import { State } from "./state.entity";

@Entity("cities")
export class City {
  @PrimaryColumn({ type: "integer" }) id: number;
  @Column() name: string;
  @Column({ name: "state_id", type: "integer" }) stateId: number;
  @ManyToOne(() => State, (state) => state.cities, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "state_id" })
  state: State;
  @OneToMany(() => Area, (area) => area.city) areas?: Area[];
}
