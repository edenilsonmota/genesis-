import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Church } from "../churches/entities/church.entity";
import { DepartmentsController } from "./departments.controller";
import { DepartmentsService } from "./departments.service";
import { Department } from "./entities/department.entity";

@Module({ imports: [TypeOrmModule.forFeature([Department, Church])], controllers: [DepartmentsController], providers: [DepartmentsService, AdminGuard], exports: [TypeOrmModule] })
export class DepartmentsModule {}
