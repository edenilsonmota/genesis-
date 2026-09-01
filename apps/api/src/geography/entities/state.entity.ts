import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { City } from "./city.entity";

@Entity("states")
export class State {
  @PrimaryColumn({ type: "integer" }) id: number;
  @Column({ unique: true, length: 2 }) abbreviation: string;
  @Column() name: string;
  @OneToMany(() => City, (city) => city.state) cities?: City[];
}
