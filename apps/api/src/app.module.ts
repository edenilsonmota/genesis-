import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./health.controller";
import { validateEnvironment } from "./config/environment";
import { AuthModule } from "./auth/auth.module";
import { MembersModule } from "./members/members.module";
import { RolesModule } from "./roles/roles.module";
import { UsersModule } from "./users/users.module";
import { AreasModule } from "./areas/areas.module";
import { ChurchesModule } from "./churches/churches.module";
import { GeographyModule } from "./geography/geography.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { UserGroupsModule } from "./user-groups/user-groups.module";
import { DepartmentsModule } from "./departments/departments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow<string>("DATABASE_HOST"),
        port: config.getOrThrow<number>("DATABASE_PORT"),
        database: config.getOrThrow<string>("DATABASE_NAME"),
        username: config.getOrThrow<string>("DATABASE_USER"),
        password: config.getOrThrow<string>("DATABASE_PASSWORD"),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
    RolesModule,
    MembersModule,
    AuthModule,
    AreasModule,
    ChurchesModule,
    GeographyModule,
    PermissionsModule,
    UserGroupsModule,
    DepartmentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
