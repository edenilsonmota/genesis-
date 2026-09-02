import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, MaxLength, MinLength, ValidateNested } from "class-validator";

export class MemberAssignmentDto {
  @IsUUID() churchId: string;
  @IsArray() @ArrayUnique() @IsUUID("4", { each: true }) roleIds: string[];
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsDateString() startedAt?: string;
}

export class CreateMemberDto {
  @IsString() @MinLength(3) @MaxLength(160) name: string;
  @IsString() @Length(11, 11) cpf: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsIn(["M", "F"]) sex?: "M" | "F";
  @IsOptional() @IsString() @Length(8, 8) postalCode?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() @MaxLength(20) number?: string;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @Type(() => Number) @IsInt() cityId?: number;
  @IsOptional() @IsIn(["active", "inactive"]) status = "active";
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MemberAssignmentDto) assignments: MemberAssignmentDto[] = [];
}
