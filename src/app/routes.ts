import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { AdminLayout } from "./components/AdminLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Dispositivos } from "./pages/Dispositivos";
import { EnviarAlerta } from "./pages/EnviarAlerta";
import { Historico } from "./pages/Historico";
import { Configuracoes } from "./pages/Configuracoes";
import { MapaInterativo } from "./pages/MapaInterativo";
import { Admin } from "./pages/Admin";
import { AdminUsuarios } from "./pages/AdminUsuarios";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  {
    path: "/app",
    Component: RequireAuth,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "dispositivos", Component: Dispositivos },
          { path: "enviar", Component: EnviarAlerta },
          { path: "historico", Component: Historico },
          { path: "mapa", Component: MapaInterativo },
          { path: "configuracoes", Component: Configuracoes },
        ],
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Admin },
      { path: "usuarios", Component: AdminUsuarios },
    ],
  },
  { path: "*", Component: NotFound },
]);
