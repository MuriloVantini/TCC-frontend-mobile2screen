import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Zap,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Painel Geral", icon: LayoutDashboard, end: true },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Admin</p>
              <p className="text-slate-400 text-xs">AlertaTV</p>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link to="/app" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
            Área do Usuário
          </Link>
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
              <span className="text-slate-800 font-semibold text-sm">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <span className="hidden sm:block text-sm text-slate-700">Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white border-t border-slate-200 flex items-center justify-around px-1 py-2 shrink-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl ${isActive ? "text-violet-600" : "text-slate-400"}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
