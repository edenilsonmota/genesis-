import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GrantAccessDto } from "./dto/grant-access.dto";
import { UserGroupsService } from "./user-groups.service";

@ApiTags("user-groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("user-groups")
export class UserGroupsController {
  constructor(private readonly service: UserGroupsService) {}
  @Get("users") users(@Query() query: Record<string, string>) {
    return this.service.findUsers(query);
  }
  @Get("members") members(@Query("search") search?: string) {
    return this.service.searchMembers(search);
  }
  @Post("users") grant(@Body() dto: GrantAccessDto) {
    return this.service.grantAccess(dto);
  }
}
