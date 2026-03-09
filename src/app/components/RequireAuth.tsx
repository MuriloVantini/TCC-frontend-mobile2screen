import { Navigate, Outlet, useLocation } from "react-router";
import { useUserContext } from "../contexts/UserContextProvider";

export function RequireAuth() {
  const { user, isLoading } = useUserContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Verificando autenticacao...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
