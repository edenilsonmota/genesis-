import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChurchesService } from "./churches.service";
import { CreateChurchDto } from "./dto/create-church.dto";
import { PostalCodeService } from "./integrations/postal-code.service";

@ApiTags("churches")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("churches")
export class ChurchesController {
  constructor(
    private readonly service: ChurchesService,
    private readonly postalCodes: PostalCodeService,
  ) {}
  @Get() @ApiOperation({ summary: "Lista as igrejas" }) findAll() {
    return this.service.findAll();
  }
  @Get("postal-code/:postalCode")
  @ApiOperation({ summary: "Consulta um CEP" })
  lookup(@Param("postalCode") postalCode: string) {
    return this.postalCodes.lookup(postalCode);
  }
  @Post() @ApiOperation({ summary: "Cria uma igreja" }) create(
    @Body() dto: CreateChurchDto,
  ) {
    return this.service.create(dto);
  }
}
