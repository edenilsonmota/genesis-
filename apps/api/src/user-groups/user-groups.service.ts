import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hash } from "bcryptjs";
import { DataSource, In, IsNull, Repository } from "typeorm";
import { Church } from "../churches/entities/church.entity";
import { Member } from "../members/entities/member.entity";
import { Role } from "../roles/entities/role.entity";
import { User, UserStatus } from "../users/entities/user.entity";
import { GrantAccessDto } from "./dto/grant-access.dto";
import { UserChurchRole } from "./entities/user-church-role.entity";
import { Department } from "../departments/entities/department.entity";

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserChurchRole)
    private readonly assignments: Repository<UserChurchRole>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Member) private readonly members: Repository<Member>,
    @InjectRepository(Church) private readonly churches: Repository<Church>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  async searchMembers(search = "") {
    const normalizedCpf = search.replace(/\D/g, "");
    return this.members
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.user", "user")
      .where("member.status = 'active'")
      .andWhere(
        "(LOWER(member.name) LIKE LOWER(:search) OR member.cpf LIKE :cpf OR LOWER(COALESCE(member.email, '')) LIKE LOWER(:search))",
        { search: `%${search}%`, cpf: `%${normalizedCpf}%` },
      )
      .orderBy("member.name", "ASC")
      .take(20)
      .getMany();
  }

  async findUsers(query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const qb = this.assignments
      .createQueryBuilder("assignment")
      .innerJoin("assignment.user", "user")
      .innerJoin("user.member", "member")
      .innerJoin("assignment.church", "church")
      .innerJoin("church.area", "area")
      .innerJoin("assignment.role", "role")
      .where("assignment.status = 'active'");
    if (query.search)
      qb.andWhere(
        "(LOWER(member.name) LIKE LOWER(:search) OR member.cpf LIKE :cpf OR LOWER(user.email) LIKE LOWER(:search))",
        {
          search: `%${query.search}%`,
          cpf: `%${query.search.replace(/\D/g, "")}%`,
        },
      );
    if (query.churchId)
      qb.andWhere("church.id = :churchId", { churchId: query.churchId });
    if (query.roleId)
      qb.andWhere("role.id = :roleId", { roleId: query.roleId });
    if (query.areaId)
      qb.andWhere("area.id = :areaId", { areaId: query.areaId });
    if (query.status)
      qb.andWhere("user.status = :status", { status: query.status });
    if (query.administratorsOnly === "true")
      qb.andWhere("role.isAdministrator = true");
    const total = await qb
      .clone()
      .select("COUNT(DISTINCT user.id)", "count")
      .getRawOne<{ count: string }>();
    const ids = await qb
      .clone()
      .select("user.id", "id")
      .distinct(true)
      .orderBy("user.id")
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();
    if (!ids.length)
      return { items: [], page, limit, total: Number(total?.count ?? 0) };
    const userIds = ids.map((item) => item.id);
    const users = await this.users.find({
      where: { id: In(userIds) },
      relations: { member: true },
    });
    const assignments = await this.assignments.find({
      where: { userId: In(userIds), status: "active" },
      relations: { church: { area: true }, role: true, department: true },
    });
    return {
      items: users.map((user) => ({
        id: user.id,
        name: user.member?.name ?? user.name,
        cpf: user.member?.cpf,
        email: user.email,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        isGlobalAdmin:
          user.roles?.some((role) => role.name === "admin") ?? false,
        churches: assignments
          .filter((assignment) => assignment.userId === user.id)
          .reduce<
            Array<{
              id: string;
              name: string;
              roles: Array<{
                id: string;
                name: string;
                isAdministrator: boolean;
                department: { id: string; name: string } | null;
              }>;
            }>
          >((result, assignment) => {
            let church = result.find((item) => item.id === assignment.churchId);
            if (!church) {
              church = {
                id: assignment.churchId,
                name: assignment.church.name,
                roles: [],
              };
              result.push(church);
            }
            church.roles.push({
              id: assignment.roleId,
              name: assignment.role.name,
              isAdministrator: assignment.role.isAdministrator,
              department: assignment.department ? { id: assignment.department.id, name: assignment.department.name } : null,
            });
            return result;
          }, []),
      })),
      page,
      limit,
      total: Number(total?.count ?? 0),
    };
  }

  async grantAccess(dto: GrantAccessDto) {
    return this.dataSource.transaction(async (manager) => {
      const member = await manager.findOne(Member, {
        where: { id: dto.memberId },
        relations: { user: true },
      });
      if (!member) throw new NotFoundException("Membro não encontrado");
      if (!/^\d{11}$/.test(member.cpf))
        throw new BadRequestException(
          "O membro precisa possuir CPF válido para receber acesso",
        );
      const church = await manager.findOneBy(Church, { id: dto.churchId });
      if (!church) throw new NotFoundException("Igreja não encontrada");
      const department = dto.departmentId
        ? await manager.findOneBy(Department, { id: dto.departmentId, churchId: church.id, status: "active" })
        : null;
      if (dto.departmentId && !department)
        throw new BadRequestException("Selecione um departamento ativo da igreja");
      const roles = await manager.find(Role, {
        where: {
          id: In([...new Set(dto.roleIds)]),
          areaId: church.areaId,
          status: "active",
          fixed: false,
        },
      });
      if (roles.length !== new Set(dto.roleIds).size)
        throw new BadRequestException(
          "Selecione somente cargos ativos da área da igreja",
        );
      let user = member.user;
      const createdUser = !user;
      if (!user) {
        const email = (dto.email ?? member.email)?.trim().toLowerCase();
        if (!email)
          throw new BadRequestException("Informe o e-mail de acesso do membro");
        user = await manager.save(
          User,
          manager.create(User, {
            name: member.name,
            email,
            passwordHash: await hash(member.cpf, 12),
            status: UserStatus.ACTIVE,
            mustChangePassword: true,
            lastLoginAt: null,
            roles: [],
          }),
        );
        member.user = user;
        member.userId = user.id;
        member.email = member.email ?? email;
        await manager.save(Member, member);
      }
      const existing = await manager.find(UserChurchRole, {
        where: {
          userId: user.id,
          churchId: church.id,
          roleId: In(roles.map((role) => role.id)),
          departmentId: department?.id ?? IsNull(),
        },
      });
      if (existing.length)
        throw new ConflictException("Um dos vínculos selecionados já existe");
      await manager.save(
        UserChurchRole,
        roles.map((role) =>
          manager.create(UserChurchRole, {
            userId: user!.id,
            churchId: church.id,
            roleId: role.id,
            departmentId: department?.id ?? null,
            status: "active",
          }),
        ),
      );
      return {
        userId: user.id,
        created: createdUser,
        assignmentsCreated: roles.length,
        mustChangePassword: user.mustChangePassword,
      };
    });
  }
}
