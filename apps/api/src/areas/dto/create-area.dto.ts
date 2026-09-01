import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAreaDto {
  @ApiProperty({ example: "Área 111" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
  @ApiProperty({ example: 3550308 }) @IsInt() cityId: number;
}
