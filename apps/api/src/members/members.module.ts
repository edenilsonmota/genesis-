import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "./entities/member.entity";
import { AdminGuard } from "../auth/guards/admin.guard";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [MembersController],
  providers: [MembersService, AdminGuard],
  exports: [TypeOrmModule, MembersService],
})
export class MembersModule {}
