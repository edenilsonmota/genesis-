import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateChurchDto {
  @ApiProperty() @IsUUID() areaId: string;
  @ApiProperty({ example: "Igreja Central" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
  @ApiProperty({ example: "01001000" })
  @Matches(/^\d{5}-?\d{3}$/)
  postalCode: string;
  @ApiProperty({ example: "100" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  complement?: string;
}
