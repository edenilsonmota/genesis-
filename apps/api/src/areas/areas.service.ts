import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAreaDto } from "./dto/create-area.dto";
import { Area } from "./entities/area.entity";
import { City } from "../geography/entities/city.entity";

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area) private readonly areas: Repository<Area>,
    @InjectRepository(City) private readonly cities: Repository<City>,
  ) {}
  findAll() {
    return this.areas.find({
      relations: { city: { state: true } },
      order: { name: "ASC" },
    });
  }
  async create(dto: CreateAreaDto) {
    const name = dto.name.trim();
    if (
      await this.areas
        .createQueryBuilder("area")
        .where("LOWER(area.name) = LOWER(:name)", { name })
        .getOne()
    )
      throw new ConflictException("Já existe uma área com este nome");
    const city = await this.cities.findOne({
      where: { id: dto.cityId },
      relations: { state: true },
    });
    if (!city) throw new ConflictException("Cidade não encontrada");
    return this.areas.save(
      this.areas.create({
        name,
        city,
        cityId: city.id,
      }),
    );
  }
}
