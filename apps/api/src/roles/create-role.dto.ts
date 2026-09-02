import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { PermissionLevel } from "../permissions/entities/role-permission.entity";

class RolePermissionDto {
  @IsUUID() permissionModuleId: string;
  @IsEnum(PermissionLevel) level: PermissionLevel;
}
export class CreateRoleDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsUUID() areaId: string;
  @IsIn(["active", "inactive"]) status: string;
  @IsBoolean() isAdministrator: boolean;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  permissions: RolePermissionDto[];
}
