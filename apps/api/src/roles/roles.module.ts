import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { Area } from "../areas/entities/area.entity";
import { PermissionModule } from "../permissions/entities/permission-module.entity";
import { UserChurchRole } from "../user-groups/entities/user-church-role.entity";
import { AdminGuard } from "../auth/guards/admin.guard";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Area, PermissionModule, UserChurchRole]),
  ],
  controllers: [RolesController],
  providers: [RolesService, AdminGuard],
  exports: [TypeOrmModule],
})
export class RolesModule {}
