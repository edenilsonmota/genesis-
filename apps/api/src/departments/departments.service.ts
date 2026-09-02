import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Church } from "../churches/entities/church.entity";
import { CreateDepartmentDto } from "./create-department.dto";
import { Department } from "./entities/department.entity";

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private readonly departments: Repository<Department>,
    @InjectRepository(Church) private readonly churches: Repository<Church>,
  ) {}

  findAll(churchId?: string) {
    return this.departments.find({
      where: { ...(churchId ? { churchId } : {}), status: "active" },
      relations: { church: true },
      order: { name: "ASC" },
    });
  }

  async create(dto: CreateDepartmentDto) {
    if (!(await this.churches.existsBy({ id: dto.churchId })))
      throw new NotFoundException("Igreja não encontrada");
    const duplicate = await this.departments.createQueryBuilder("department")
      .where("department.churchId = :churchId", { churchId: dto.churchId })
      .andWhere("LOWER(department.name) = LOWER(:name)", { name: dto.name.trim() })
      .getOne();
    if (duplicate) throw new ConflictException("Já existe um departamento com este nome na igreja");
    return this.departments.save(this.departments.create({ ...dto, name: dto.name.trim(), description: dto.description?.trim() || null }));
  }
}
