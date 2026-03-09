import { Navigate, Outlet, useLocation } from "react-router";
import { useUserContext } from "../contexts/UserContextProvider";
import { Loader2 } from "lucide-react";

export function RequireAuth() {
    const { user, isLoading } = useUserContext();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Verificando autenticacao...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
