import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hash } from "bcryptjs";
import { DataSource, In, Repository } from "typeorm";
import { Church } from "../churches/entities/church.entity";
import { Department } from "../departments/entities/department.entity";
import { Role } from "../roles/entities/role.entity";
import { User, UserStatus } from "../users/entities/user.entity";
import { UserChurchRole } from "../user-groups/entities/user-church-role.entity";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { Member } from "./entities/member.entity";

function validCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (size: number) => {
    let sum = 0;
    for (let index = 0; index < size; index++) sum += Number(cpf[index]) * (size + 1 - index);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

@Injectable()
export class MembersService {
  constructor(@InjectRepository(Member) private readonly members: Repository<Member>, private readonly dataSource: DataSource) {}

  async findAll(query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const qb = this.members.createQueryBuilder("member")
      .leftJoinAndSelect("member.user", "user")
      .leftJoinAndSelect("member.city", "city")
      .leftJoinAndSelect("city.state", "state")
      .leftJoin(UserChurchRole, "assignment", "assignment.user_id = user.id AND assignment.status = 'active'")
      .leftJoin(Church, "church", "church.id = assignment.church_id")
      .leftJoin(Role, "role", "role.id = assignment.role_id");
    if (query.search) qb.andWhere("(LOWER(member.name) LIKE LOWER(:search) OR member.cpf LIKE :cpf OR LOWER(COALESCE(member.email,'')) LIKE LOWER(:search) OR member.phone LIKE :phone)", { search: `%${query.search}%`, cpf: `%${query.search.replace(/\D/g, "")}%`, phone: `%${query.search.replace(/\D/g, "")}%` });
    if (query.churchId) qb.andWhere("church.id = :churchId", { churchId: query.churchId });
    if (query.areaId) qb.andWhere("church.area_id = :areaId", { areaId: query.areaId });
    if (query.roleId) qb.andWhere("role.id = :roleId", { roleId: query.roleId });
    if (query.sex) qb.andWhere("member.sex = :sex", { sex: query.sex });
    if (query.status) qb.andWhere("member.status = :status", { status: query.status });
    const order = query.order === "createdAt" ? "member.createdAt" : "member.name";
    const [items, total] = await qb.distinct(true).orderBy(order, query.direction === "desc" ? "DESC" : "ASC").skip((page - 1) * limit).take(limit).getManyAndCount();
    const ids = items.flatMap((item) => item.userId ? [item.userId] : []);
    const assignments = ids.length ? await this.dataSource.getRepository(UserChurchRole).find({ where: { userId: In(ids) }, relations: { church: true, role: true, department: true } }) : [];
    return { items: items.map((member) => ({ ...member, assignments: assignments.filter((item) => item.userId === member.userId) })), page, limit, total };
  }

  async findOne(id: string) {
    const member = await this.members.findOne({ where: { id }, relations: { user: true, city: { state: true } } });
    if (!member) throw new NotFoundException("Membro não encontrado");
    const assignments = member.userId ? await this.dataSource.getRepository(UserChurchRole).find({ where: { userId: member.userId }, relations: { church: true, role: true, department: true } }) : [];
    return { ...member, assignments };
  }

  async create(dto: CreateMemberDto) {
    if (!validCpf(dto.cpf)) throw new BadRequestException("CPF inválido");
    if (await this.members.existsBy({ cpf: dto.cpf })) throw new ConflictException("CPF já cadastrado");
    return this.dataSource.transaction(async (manager) => {
      const { assignments, ...data } = dto;
      const member = await manager.save(Member, manager.create(Member, { ...data, email: data.email?.toLowerCase() ?? null, phone: data.phone ?? null, birthDate: data.birthDate ?? null, sex: data.sex ?? null, postalCode: data.postalCode ?? null, street: data.street ?? null, number: data.number ?? null, complement: data.complement ?? null, neighborhood: data.neighborhood ?? null, cityId: data.cityId ?? null, churchId: assignments[0]?.churchId ?? null, userId: null }));
      if (!assignments.length) return member;
      if (!dto.email) throw new BadRequestException("Informe o e-mail para cargos que concedem acesso");
      const user = await manager.save(User, manager.create(User, { name: member.name, email: dto.email.toLowerCase(), passwordHash: await hash(dto.cpf, 12), status: UserStatus.ACTIVE, mustChangePassword: true, lastLoginAt: null, roles: [] }));
      member.userId = user.id; await manager.save(Member, member);
      for (const assignment of assignments) {
        const church = await manager.findOneBy(Church, { id: assignment.churchId });
        if (!church) throw new NotFoundException("Igreja não encontrada");
        const roles = await manager.find(Role, { where: { id: In(assignment.roleIds), areaId: church.areaId, status: "active", fixed: false } });
        if (roles.length !== new Set(assignment.roleIds).size) throw new BadRequestException("Cargo inválido para a área da igreja");
        if (assignment.departmentId && !(await manager.existsBy(Department, { id: assignment.departmentId, churchId: church.id, status: "active" }))) throw new BadRequestException("Departamento inválido para a igreja");
        await manager.save(UserChurchRole, roles.map((role) => manager.create(UserChurchRole, { userId: user.id, churchId: church.id, roleId: role.id, departmentId: assignment.departmentId ?? null, status: "active", startedAt: assignment.startedAt ?? null, endedAt: null })));
      }
      return { ...member, assignmentsCreated: assignments.reduce((total, item) => total + item.roleIds.length, 0) };
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.members.findOneBy({ id });
    if (!member) throw new NotFoundException("Membro não encontrado");
    if (dto.cpf && (!validCpf(dto.cpf))) throw new BadRequestException("CPF inválido");
    const { assignments, ...values } = dto;
    void assignments;
    Object.assign(member, Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== "")));
    return this.members.save(member);
  }
  async inactivate(id: string) { const member = await this.members.findOne({ where: { id }, relations: { user: true } }); if (!member) throw new NotFoundException("Membro não encontrado"); member.status = "inactive"; if (member.user) member.user.status = UserStatus.INACTIVE; return this.dataSource.transaction(async (manager) => { if (member.user) await manager.save(User, member.user); return manager.save(Member, member); }); }
  async remove(id: string) { const member = await this.members.findOneBy({ id }); if (!member) throw new NotFoundException("Membro não encontrado"); if (member.userId || member.churchId) throw new ConflictException("O membro possui vínculos e deve ser inativado"); await this.members.remove(member); return { removed: true }; }
}
