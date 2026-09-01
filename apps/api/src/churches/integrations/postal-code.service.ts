import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

type ViaCepResponse = {
  erro?: boolean;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
};
@Injectable()
export class PostalCodeService {
  async lookup(value: string) {
    const postalCode = value.replace(/\D/g, "");
    if (postalCode.length !== 8) throw new NotFoundException("CEP inválido");
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${postalCode}/json/`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!response.ok) throw new Error("ViaCEP unavailable");
      const data = (await response.json()) as ViaCepResponse;
      if (data.erro) throw new NotFoundException("CEP não encontrado");
      return {
        postalCode,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        cityIbgeCode: Number(data.ibge),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadGatewayException("Não foi possível consultar o CEP agora");
    }
  }
}
