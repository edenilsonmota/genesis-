import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { City } from "./entities/city.entity";
import { State } from "./entities/state.entity";

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(State) private readonly states: Repository<State>,
    @InjectRepository(City) private readonly cities: Repository<City>,
  ) {}
  findStates() {
    return this.states.find({ order: { name: "ASC" } });
  }
  findCities(stateId: number) {
    return this.cities.find({ where: { stateId }, order: { name: "ASC" } });
  }
}
