import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Area } from "../areas/entities/area.entity";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Church } from "./entities/church.entity";
import { ChurchesController } from "./churches.controller";
import { ChurchesService } from "./churches.service";
import { PostalCodeService } from "./integrations/postal-code.service";

@Module({
  imports: [TypeOrmModule.forFeature([Church, Area])],
  controllers: [ChurchesController],
  providers: [ChurchesService, PostalCodeService, AdminGuard],
})
export class ChurchesModule {}
