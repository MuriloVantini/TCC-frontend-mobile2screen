import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router";
import {
  LayoutDashboard,
  Monitor,
  BellRing,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Zap,
  ShieldCheck,
  Map,
} from "lucide-react";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/dispositivos", label: "Dispositivos", icon: Monitor },
  { to: "/app/enviar", label: "Enviar Alerta", icon: BellRing },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/mapa", label: "Mapa Interativo", icon: Map },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">AlertaTV</p>
              <p className="text-slate-400 text-xs">Alertas em tempo real</p>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{label}</span>
              {label === "Enviar Alerta" && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">NOVO</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Painel Admin</span>
          </Link>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-slate-800 font-semibold">AlertaTV</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/app/enviar"
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <BellRing className="w-4 h-4" />
              Enviar Alerta
            </NavLink>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">JS</span>
                </div>
                <span className="hidden sm:block text-sm text-slate-700">João Silva</span>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-800">João Silva</p>
                    <p className="text-xs text-slate-500">joao@empresa.com.br</p>
                  </div>
                  <Link to="/app/configuracoes" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Configurações</Link>
                  <button onClick={() => navigate("/")} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white border-t border-slate-200 flex items-center justify-around px-1 py-2 shrink-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`
              }
            >
              {label === "Enviar Alerta" ? (
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md -mt-5">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-[10px] leading-none">{label.split(" ")[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
