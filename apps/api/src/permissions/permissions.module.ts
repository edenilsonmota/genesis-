import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { PermissionModule } from "./entities/permission-module.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { PermissionsController } from "./permissions.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PermissionModule, RolePermission])],
  controllers: [PermissionsController],
  providers: [AdminGuard],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
