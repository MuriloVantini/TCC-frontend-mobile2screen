import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import LogoDarkMarkup from "../assets/LogoDark.svg?raw";
import LogoLightMarkup from "../assets/LogoLight.svg?raw";
import { useUserContext } from "../contexts/UserContextProvider";
import { useAuthApi } from "../hooks/api/entities";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";
import { Switch } from "./ui/switch";

const navItems = [
  { to: "/admin", label: "Painel Geral", icon: LayoutDashboard, end: true },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
];

const logoDarkInline = LogoDarkMarkup.replace("<svg ", '<svg class="h-5 w-auto" ');
const logoLightInline = LogoLightMarkup.replace("<svg ", '<svg class="h-5 w-auto" ');
const THEME_STORAGE_KEY = "m2s.theme";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const authApi = useMemo(() => useAuthApi(), []);
  const { user, clearUser } = useUserContext();
  const displayName = user?.name ?? "Administrador";
  const displayEmail = user?.email ?? "-";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AD";
  const logoInline = isDarkMode ? logoDarkInline : logoLightInline;

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // A sessão local deve ser removida mesmo se a revogação remota falhar.
    } finally {
      clearUser();
      navigate("/", { replace: true });
    }
  };

  const navigation = (onNavigate?: () => void) => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
          >
            <Icon className="size-4.5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
        <Button variant="ghost" asChild className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/app" onClick={onNavigate}><ChevronLeft className="size-4" /> Área do Usuário</Link>
        </Button>
        <Button variant="ghost" onClick={() => void handleLogout()} className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="size-4" /> Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="flex w-64 flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Menu administrativo</SheetTitle>
          <AdminBrand logoInline={logoInline} />
          {navigation(() => setSidebarOpen(false))}
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <AdminBrand logoInline={logoInline} />
        {navigation()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu administrativo">
              <Menu className="size-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span className="hidden text-sm font-semibold text-foreground sm:inline">Painel Administrativo</span>
              <Badge variant="outline" className="hidden sm:inline-flex">Admin</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-1.5 sm:flex">
              {isDarkMode ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-warning" />}
              <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} aria-label="Alternar tema" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto gap-2 rounded-xl px-2 py-1.5">
                  <Avatar className="size-7 rounded-lg"><AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-primary-foreground">{initials}</AvatarFallback></Avatar>
                  <span className="hidden text-sm text-foreground sm:block">{displayName}</span>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal"><p className="text-sm font-medium">{displayName}</p><p className="text-xs text-muted-foreground">{displayEmail}</p></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/app">Área do Usuário</Link></DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}><LogOut className="size-4" /> Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto"><Outlet /></main>

        <nav className="flex shrink-0 items-center justify-around border-t border-border bg-card px-1 py-2 md:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="size-5" /><span className="text-[10px]">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function AdminBrand({ logoInline }: { logoInline: string }) {
  return (
    <div className="border-b border-sidebar-border px-4 py-2">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div aria-label="Mobile2Screen" role="img" dangerouslySetInnerHTML={{ __html: logoInline }} />
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"><ShieldCheck className="size-3" /> Admin</span>
      </div>
    </div>
  );
}
