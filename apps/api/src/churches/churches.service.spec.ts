import { BadRequestException } from "@nestjs/common";
import { Area } from "../areas/entities/area.entity";
import { Church } from "./entities/church.entity";
import { ChurchesService } from "./churches.service";
import { PostalCodeService } from "./integrations/postal-code.service";
import { Repository } from "typeorm";

describe("ChurchesService", () => {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
  };
  const churches = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    createQueryBuilder: jest.fn(() => queryBuilder),
  } as unknown as Repository<Church>;
  const areas = { findOne: jest.fn() } as unknown as Repository<Area>;
  const postalCodes = { lookup: jest.fn() } as unknown as PostalCodeService;
  const service = new ChurchesService(churches, areas, postalCodes);
  const dto = {
    areaId: "14bbed20-e448-4a17-9db0-d739c0d67310",
    name: "Central",
    postalCode: "01001000",
    number: "100",
  };

  beforeEach(() => jest.clearAllMocks());

  it("creates a church when the postal code belongs to the area", async () => {
    jest.spyOn(areas, "findOne").mockResolvedValue({
      id: dto.areaId,
      cityId: 3550308,
    } as Area);
    jest.spyOn(postalCodes, "lookup").mockResolvedValue({
      postalCode: "01001000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "Sao Paulo",
      state: "SP",
      cityIbgeCode: 3550308,
    });
    const result = await service.create(dto);
    expect(result.street).toBe("Praça da Sé");
    expect(churches.save).toHaveBeenCalled();
  });

  it("rejects a postal code from another area", async () => {
    jest.spyOn(areas, "findOne").mockResolvedValue({
      id: dto.areaId,
      cityId: 3509502,
    } as Area);
    jest.spyOn(postalCodes, "lookup").mockResolvedValue({
      postalCode: "01001000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      cityIbgeCode: 3550308,
    });
    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
