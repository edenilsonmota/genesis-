import { AuthenticatedHome } from "./features/auth/components/AuthenticatedHome";
import { useAuth } from "./features/auth/context/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ChangePasswordPage } from "./features/auth/pages/ChangePasswordPage";

export function App() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return user.mustChangePassword ? <ChangePasswordPage /> : <AuthenticatedHome />;
}
