import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MemberSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  churchId: string;
}

export class AuthenticatedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ["active", "inactive"] })
  status: string;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty({ type: [String] })
  permissions: string[];

  @ApiPropertyOptional({ type: MemberSummaryDto, nullable: true })
  member: MemberSummaryDto | null;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  expiresIn: string;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
