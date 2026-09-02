import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuditService } from "./audit.service";

@ApiTags("audit") @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminGuard) @Controller("audit")
export class AuditController {
  constructor(private readonly audit: AuditService) {}
  @Get() @ApiOperation({ summary: "Lista registros de auditoria com filtros e paginação" })
  @ApiQuery({ name: "search", required: false }) @ApiQuery({ name: "action", required: false }) @ApiQuery({ name: "resource", required: false }) @ApiQuery({ name: "from", required: false }) @ApiQuery({ name: "to", required: false }) @ApiQuery({ name: "page", required: false }) @ApiQuery({ name: "limit", required: false })
  findAll(@Query() query: Record<string, string>) { return this.audit.findAll(query); }
}
