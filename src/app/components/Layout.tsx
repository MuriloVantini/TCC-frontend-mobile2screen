import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation } from "react-router";
import { animate } from "animejs";
import { useDrawableAnimation } from "../hooks/useDrawableAnimation";
import LogoDarkMarkup from "../assets/LogoDark.svg?raw";
import LogoLightMarkup from "../assets/LogoLight.svg?raw";
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
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
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

const logoLightInline = LogoLightMarkup
  .replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')
  .replace("<svg ", '<svg class="h-5 w-auto" ');

const THEME_STORAGE_KEY = "m2s.theme";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  const logoInline = isDarkMode ? logoDarkInline : logoLightInline;

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
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    window.localStorage.setItem(THEME_STORAGE_KEY, checked ? "dark" : "light");
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (sidebarNavRef.current) {
        const activeLink = sidebarNavRef.current.querySelector<HTMLElement>(".bg-primary");
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
        const activeMobile = mobileNavRef.current.querySelector<HTMLElement>(".text-primary");
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar via Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border text-sidebar-foreground flex flex-col gap-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="px-4 py-2 border-b border-sidebar-border">
            <div
              className="px-3 py-2.5 flex items-center"
              aria-label="Mobile2Screen"
              role="img"
              dangerouslySetInnerHTML={{ __html: logoInline }}
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
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Painel Admin</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-xl text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sair</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div
            ref={logoRef}
            className="px-3 py-2.5 flex items-center"
            aria-label="Mobile2Screen"
            role="img"
            dangerouslySetInnerHTML={{ __html: logoInline }}
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
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{'Painel Admin'}</span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-xl text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl text-muted-foreground hover:text-foreground"
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
            <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5 bg-background">
              {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
              <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} aria-label="Alternar tema" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-xl">
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm text-foreground">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
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
        <nav ref={mobileNavRef} className="md:hidden bg-card border-t border-border flex items-center justify-around px-1 py-2 shrink-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
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
