import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AreasService } from "./areas.service";
import { CreateAreaDto } from "./dto/create-area.dto";

@ApiTags("areas")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("areas")
export class AreasController {
  constructor(private readonly service: AreasService) {}
  @Get() @ApiOperation({ summary: "Lista as áreas" }) findAll() {
    return this.service.findAll();
  }
  @Post()
  @ApiOperation({ summary: "Cria uma área" })
  @ApiCreatedResponse()
  create(@Body() dto: CreateAreaDto) {
    return this.service.create(dto);
  }
}
