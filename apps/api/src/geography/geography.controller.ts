import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GeographyService } from "./geography.service";

@ApiTags("geography")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("geography")
export class GeographyController {
  constructor(private readonly service: GeographyService) {}
  @Get("states") @ApiOperation({ summary: "Lista os estados" }) states() {
    return this.service.findStates();
  }
  @Get("states/:stateId/cities")
  @ApiOperation({ summary: "Lista as cidades de um estado" })
  cities(@Param("stateId", ParseIntPipe) stateId: number) {
    return this.service.findCities(stateId);
  }
}
