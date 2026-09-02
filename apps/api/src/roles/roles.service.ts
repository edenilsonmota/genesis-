import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Area } from "../areas/entities/area.entity";
import { PermissionModule } from "../permissions/entities/permission-module.entity";
import { RolePermission } from "../permissions/entities/role-permission.entity";
import { UserChurchRole } from "../user-groups/entities/user-church-role.entity";
import { CreateRoleDto } from "./create-role.dto";
import { Role } from "./entities/role.entity";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Area) private readonly areas: Repository<Area>,
    @InjectRepository(PermissionModule)
    private readonly modules: Repository<PermissionModule>,
    @InjectRepository(UserChurchRole)
    private readonly assignments: Repository<UserChurchRole>,
    private readonly dataSource: DataSource,
  ) {}
  async findAll(query: {
    search?: string;
    areaId?: string;
    status?: string;
    administratorsOnly?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const qb = this.roles
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.area", "area")
      .where("role.fixed = false");
    if (query.search)
      qb.andWhere("LOWER(role.name) LIKE LOWER(:search)", {
        search: `%${query.search}%`,
      });
    if (query.areaId)
      qb.andWhere("role.areaId = :areaId", { areaId: query.areaId });
    if (query.status)
      qb.andWhere("role.status = :status", { status: query.status });
    if (query.administratorsOnly === "true")
      qb.andWhere("role.isAdministrator = true");
    const [items, total] = await qb
      .orderBy("role.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const counts = items.length
      ? await this.assignments
          .createQueryBuilder("assignment")
          .select("assignment.roleId", "roleId")
          .addSelect("COUNT(DISTINCT assignment.userId)", "count")
          .where("assignment.roleId IN (:...ids)", {
            ids: items.map((item) => item.id),
          })
          .andWhere("assignment.status = 'active'")
          .groupBy("assignment.roleId")
          .getRawMany<{ roleId: string; count: string }>()
      : [];
    return {
      items: items.map((item) => ({
        ...item,
        userCount: Number(
          counts.find((count) => count.roleId === item.id)?.count ?? 0,
        ),
      })),
      page,
      limit,
      total,
    };
  }
  async create(dto: CreateRoleDto) {
    const area = await this.areas.findOneBy({ id: dto.areaId });
    if (!area) throw new NotFoundException("Área não encontrada");
    if (
      await this.roles
        .createQueryBuilder("role")
        .where("role.areaId = :areaId", { areaId: area.id })
        .andWhere("LOWER(role.name) = LOWER(:name)", { name: dto.name.trim() })
        .getOne()
    )
      throw new ConflictException("Já existe um cargo com este nome na área");
    const moduleIds = dto.permissions.map(
      (permission) => permission.permissionModuleId,
    );
    if (
      moduleIds.length &&
      (await this.modules
        .createQueryBuilder("module")
        .where("module.id IN (:...ids)", { ids: moduleIds })
        .getCount()) !== new Set(moduleIds).size
    )
      throw new NotFoundException("Permissão não encontrada");
    return this.dataSource.transaction(async (manager) => {
      const role = await manager.save(
        Role,
        manager.create(Role, {
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          area,
          areaId: area.id,
          status: dto.status,
          isAdministrator: dto.isAdministrator,
          fixed: false,
        }),
      );
      if (dto.permissions.length)
        await manager.save(
          RolePermission,
          dto.permissions.map((permission) =>
            manager.create(RolePermission, { roleId: role.id, ...permission }),
          ),
        );
      return role;
    });
  }
}
