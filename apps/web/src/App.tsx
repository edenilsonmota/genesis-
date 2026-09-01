import { AuthenticatedHome } from "./features/auth/components/AuthenticatedHome";
import { useAuth } from "./features/auth/context/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";

export function App() {
  const { user } = useAuth();
  return user ? <AuthenticatedHome /> : <LoginPage />;
}
