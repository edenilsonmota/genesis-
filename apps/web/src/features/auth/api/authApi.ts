import { http } from "../../../lib/http";
import type {
  AuthenticatedUser,
  LoginCredentials,
  LoginResponse,
} from "../types/auth";

export async function login(credentials: LoginCredentials) {
  return (await http.post<LoginResponse>("/auth/login", credentials)).data;
}

export async function getCurrentUser(accessToken: string) {
  return (
    await http.get<AuthenticatedUser>("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  ).data;
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
) {
  return (
    await http.post<{ message: string }>(
      "/auth/change-password",
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
  ).data;
}
