import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AuditController } from "./audit.controller";
import { AuditInterceptor } from "./audit.interceptor";
import { AuditService } from "./audit.service";
import { AuditLog } from "./entities/audit-log.entity";

@Module({ imports: [TypeOrmModule.forFeature([AuditLog])], controllers: [AuditController], providers: [AuditService, AuditInterceptor, AdminGuard], exports: [AuditService, AuditInterceptor, TypeOrmModule] })
export class AuditModule {}
