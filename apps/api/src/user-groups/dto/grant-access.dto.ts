import {
  IsArray,
  IsEmail,
  IsOptional,
  IsUUID,
  ArrayMinSize,
} from "class-validator";

export class GrantAccessDto {
  @IsUUID() memberId: string;
  @IsUUID() churchId: string;
  @IsArray() @ArrayMinSize(1) @IsUUID("4", { each: true }) roleIds: string[];
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsEmail() email?: string;
}
