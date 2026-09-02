import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}
  record(data: Partial<AuditLog>) { return this.logs.save(this.logs.create(data)); }
  async findAll(query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const qb = this.logs.createQueryBuilder("audit");
    if (query.search) qb.andWhere("(LOWER(COALESCE(audit.userName, '')) LIKE LOWER(:search) OR LOWER(COALESCE(audit.userEmail, '')) LIKE LOWER(:search) OR LOWER(audit.resource) LIKE LOWER(:search) OR LOWER(audit.route) LIKE LOWER(:search) OR COALESCE(audit.recordId, '') LIKE :search)", { search: `%${query.search}%` });
    if (query.userId) qb.andWhere("audit.userId = :userId", { userId: query.userId });
    if (query.action) qb.andWhere("audit.action = :action", { action: query.action.toUpperCase() });
    if (query.resource) qb.andWhere("audit.resource = :resource", { resource: query.resource });
    if (query.from) qb.andWhere("audit.createdAt >= :from", { from: query.from });
    if (query.to) qb.andWhere("audit.createdAt < (:to::date + INTERVAL '1 day')", { to: query.to });
    const [items, total] = await qb.orderBy("audit.createdAt", "DESC").skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, page, limit, total };
  }
}
