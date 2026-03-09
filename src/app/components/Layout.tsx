import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation } from "react-router";
import { animate } from "animejs";
import { useDrawableAnimation } from "../hooks/useDrawableAnimation";
import LogoDarkMarkup from "../assets/LogoDark.svg?raw";
import { useAuthApi } from "../hooks/api/entities";
import { useUserContext } from "../contexts/UserContextProvider";
import {
  LayoutDashboard,
  Monitor,
  BellRing,
  History,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  ShieldCheck,
  Map,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/dispositivos", label: "Dispositivos", icon: Monitor },
  { to: "/app/enviar", label: "Enviar Alerta", icon: BellRing },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/mapa", label: "Mapa Interativo", icon: Map },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
];

const logoDarkInline = LogoDarkMarkup
  .replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')
  .replace("<svg ", '<svg class="h-5 w-auto" ');

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearUser } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const authApi = useMemo(() => useAuthApi(), []);
  const sidebarNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? "Usuario";
  const displayEmail = user?.email ?? "-";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "US";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if logout fails on the server, clear local auth flow.
    } finally {
      clearUser();
      navigate("/");
    }
  };

  useDrawableAnimation(logoRef, {duration: 1500, staggerMs: 80});

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (sidebarNavRef.current) {
        const activeLink = sidebarNavRef.current.querySelector<HTMLElement>(".bg-blue-600");
        if (activeLink) {
          animate(activeLink, {
            scale: [0.6, 1],
            opacity: [0.6, 1],
            duration: 380,
            ease: "outBack(6.4)",
          });
        }
      }
      if (mobileNavRef.current) {
        const activeMobile = mobileNavRef.current.querySelector<HTMLElement>(".text-blue-600");
        if (activeMobile) {
          animate(activeMobile, {
            scale: [0.70, 1],
            opacity: [0.5, 1],
            duration: 320,
            ease: "outBack(1.8)",
          });
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar via Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#0f172a] border-white/10 flex flex-col gap-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="px-4 py-2 border-b border-white/10">
            <div
              className="px-3 py-2.5 flex items-center"
              aria-label="Mobile2Screen"
              role="img"
              dangerouslySetInnerHTML={{ __html: logoDarkInline }}
            />
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-white/10 space-y-1">
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Painel Admin</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sair</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f172a]">
        <div className="px-4 py-2 border-b border-white/10">
          <div
            ref={logoRef}
            className="px-3 py-2.5 flex items-center"
            aria-label="Mobile2Screen"
            role="img"
            dangerouslySetInnerHTML={{ __html: logoDarkInline }}
          />
        </div>
        <nav ref={sidebarNavRef} className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{'Painel Admin'}</span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="hidden sm:flex rounded-xl"
              asChild
            >
              <NavLink to="/app/enviar">
                <BellRing className="w-4 h-4" />
                Enviar Alerta
              </NavLink>
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-xl">
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm text-slate-700">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-slate-800">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/configuracoes">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav ref={mobileNavRef} className="md:hidden bg-white border-t border-slate-200 flex items-center justify-around px-1 py-2 shrink-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${isActive ? "text-blue-600" : "text-slate-400"
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
