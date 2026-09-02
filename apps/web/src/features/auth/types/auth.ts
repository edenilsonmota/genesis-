export type MemberSummary = { id: string; name: string; churchId: string };

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  isAdmin: boolean;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
  member: MemberSummary | null;
};

export type LoginCredentials = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthenticatedUser;
};
