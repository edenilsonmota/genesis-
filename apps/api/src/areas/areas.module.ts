import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Area } from "./entities/area.entity";
import { AreasController } from "./areas.controller";
import { AreasService } from "./areas.service";
import { City } from "../geography/entities/city.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Area, City])],
  controllers: [AreasController],
  providers: [AreasService, AdminGuard],
  exports: [TypeOrmModule],
})
export class AreasModule {}
