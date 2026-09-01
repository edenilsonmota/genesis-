import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
});

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error))
    return "Não foi possível concluir a solicitação.";
  const message = error.response?.data?.message;
  if (Array.isArray(message))
    return message[0] ?? "Verifique os dados informados.";
  if (typeof message === "string") return message;
  if (!error.response) return "Não foi possível conectar à API.";
  return "Não foi possível concluir a solicitação.";
}
