import { plainToInstance, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  validateSync,
} from "class-validator";

class EnvironmentVariables {
  @IsIn(["development", "test", "production"])
  NODE_ENV = "development";

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  PORT = 3000;

  @IsUrl({ require_tld: false })
  WEB_ORIGIN = "http://localhost:5173";

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST = "localhost";

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  DATABASE_PORT = 5432;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME = "genesis_plus";

  @IsString()
  @IsNotEmpty()
  DATABASE_USER = "genesis";

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD = "genesis";

  @IsString()
  @Length(32)
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN = "15m";
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
