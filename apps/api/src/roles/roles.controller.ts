import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateRoleDto } from "./create-role.dto";
import { RolesService } from "./roles.service";

@ApiTags("roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}
  @Get() findAll(@Query() query: Record<string, string>) {
    return this.service.findAll(query);
  }
  @Post() create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }
}
