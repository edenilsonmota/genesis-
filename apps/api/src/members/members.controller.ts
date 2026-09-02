import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MembersService } from "./members.service";

@ApiTags("members") @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminGuard) @Controller("members")
export class MembersController {
  constructor(private readonly members: MembersService) {}
  @Get() findAll(@Query() query: Record<string, string>) { return this.members.findAll(query); }
  @Get(":id") findOne(@Param("id") id: string) { return this.members.findOne(id); }
  @Post() create(@Body() dto: CreateMemberDto) { return this.members.create(dto); }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateMemberDto) { return this.members.update(id, dto); }
  @Patch(":id/inactivate") inactivate(@Param("id") id: string) { return this.members.inactivate(id); }
  @Delete(":id") remove(@Param("id") id: string) { return this.members.remove(id); }
}
