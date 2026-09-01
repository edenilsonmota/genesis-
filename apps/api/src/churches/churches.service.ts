import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Area } from "../areas/entities/area.entity";
import { CreateChurchDto } from "./dto/create-church.dto";
import { Church } from "./entities/church.entity";
import { PostalCodeService } from "./integrations/postal-code.service";

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(Church) private readonly churches: Repository<Church>,
    @InjectRepository(Area) private readonly areas: Repository<Area>,
    private readonly postalCodes: PostalCodeService,
  ) {}
  findAll() {
    return this.churches.find({
      relations: { area: { city: { state: true } } },
      order: { name: "ASC" },
    });
  }
  async create(dto: CreateChurchDto) {
    const area = await this.areas.findOne({
      where: { id: dto.areaId },
      relations: { city: { state: true } },
    });
    if (!area) throw new NotFoundException("Área não encontrada");
    const name = dto.name.trim();
    if (
      await this.churches
        .createQueryBuilder("church")
        .where("church.areaId = :areaId", { areaId: area.id })
        .andWhere("LOWER(church.name) = LOWER(:name)", { name })
        .getOne()
    ) {
      throw new ConflictException("Já existe uma igreja com este nome na área");
    }
    const address = await this.postalCodes.lookup(dto.postalCode);
    if (!address.street || !address.neighborhood) {
      throw new BadRequestException("O CEP precisa identificar rua e bairro");
    }
    if (address.cityIbgeCode !== area.cityId) {
      throw new BadRequestException(
        "O CEP deve pertencer à mesma cidade e estado da área",
      );
    }
    return this.churches.save(
      this.churches.create({
        area,
        areaId: area.id,
        name,
        postalCode: address.postalCode,
        street: address.street,
        neighborhood: address.neighborhood,
        number: dto.number.trim(),
        complement: dto.complement?.trim() || null,
      }),
    );
  }
}
