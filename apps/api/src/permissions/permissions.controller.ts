import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionModule } from "./entities/permission-module.entity";

@ApiTags("permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("permissions")
export class PermissionsController {
  constructor(
    @InjectRepository(PermissionModule)
    private readonly modules: Repository<PermissionModule>,
  ) {}
  @Get("catalog") catalog() {
    return this.modules.find({
      where: { status: "active" },
      order: { category: "ASC", name: "ASC" },
    });
  }
}
