import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Church } from "../churches/entities/church.entity";
import { Member } from "../members/entities/member.entity";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { UserChurchRole } from "./entities/user-church-role.entity";
import { UserGroupsController } from "./user-groups.controller";
import { UserGroupsService } from "./user-groups.service";
import { Department } from "../departments/entities/department.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserChurchRole, User, Member, Church, Role, Department]),
  ],
  controllers: [UserGroupsController],
  providers: [UserGroupsService, AdminGuard],
})
export class UserGroupsModule {}
