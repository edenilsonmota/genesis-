import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateDepartmentDto } from "./create-department.dto";
import { DepartmentsService } from "./departments.service";

@ApiTags("departments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}
  @Get() findAll(@Query("churchId") churchId?: string) { return this.departments.findAll(churchId); }
  @Post() create(@Body() dto: CreateDepartmentDto) { return this.departments.create(dto); }
}
