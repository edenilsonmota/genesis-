import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { City } from "./entities/city.entity";
import { State } from "./entities/state.entity";
import { GeographyController } from "./geography.controller";
import { GeographyService } from "./geography.service";

@Module({
  imports: [TypeOrmModule.forFeature([State, City])],
  controllers: [GeographyController],
  providers: [GeographyService, AdminGuard],
})
export class GeographyModule {}
