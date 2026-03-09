import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Zap, Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle, Moon, Sun } from "lucide-react";
import { shake, useMorphButton, type SubmitState } from "../hooks/useFormSubmitAnimation";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useDrawableAnimation } from "../hooks/useDrawableAnimation";
import { useAuthApi, useSanctumApi } from "../hooks/api/entities";
import { ApiError } from "../hooks/api/config/httpClient";
import { useUserContext } from "../contexts/UserContextProvider";

const THEME_STORAGE_KEY = "m2s.theme";

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const data = error.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;

      if (typeof record.message === "string" && record.message.trim().length > 0) {
        return record.message;
      }

      const errors = record.errors;
      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors as Record<string, unknown>).find((value) => {
          if (typeof value === "string") return true;
          return Array.isArray(value) && typeof value[0] === "string";
        });

        if (typeof firstError === "string") {
          return firstError;
        }

        if (Array.isArray(firstError) && typeof firstError[0] === "string") {
          return firstError[0];
        }
      }
    }
  }

  return fallback;
}

export function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<SubmitState>("idle");
  const [registerState, setRegisterState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", company: "", password: "", confirm: "" });

  const navigate = useNavigate();
  const authApi = useMemo(() => useAuthApi(), []);
  const sanctumApi = useMemo(() => useSanctumApi(), []);
  const { setUser } = useUserContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { shakeCard } = shake(cardRef, tab);
  const { morphStyle: loginMorphStyle, morphContent: loginMorphContent } = useMorphButton(loginState, <span>Entrar</span>);
  const { morphStyle: registerMorphStyle, morphContent: registerMorphContent } = useMorphButton(registerState, <span>Criar Minha Conta</span>);

  useDrawableAnimation(logoRef, { textSelector: "span" });

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


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginForm.email || !loginForm.password) {
      setError("Preencha todos os campos.");
      setLoginState("error");
      shakeCard();
      setTimeout(() => setLoginState("idle"), 1500);
      return;
    }

    setLoginState("loading");

    try {
      await sanctumApi.csrfCookie();
      const response = await authApi.login({
        email: loginForm.email,
        password: loginForm.password,
      });
      setUser(response.user);

      setLoginState("success");
      setSuccess("Login realizado com sucesso!");
      setTimeout(() => navigate("/app"), 700);
    } catch (err) {
      setError(extractApiErrorMessage(err, "Nao foi possivel entrar. Verifique seus dados."));
      setLoginState("error");
      shakeCard();
      setTimeout(() => setLoginState("idle"), 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError("Preencha todos os campos obrigatorios.");
      setRegisterState("error");
      shakeCard();
      setTimeout(() => setRegisterState("idle"), 1500);
      return;
    }

    if (registerForm.password !== registerForm.confirm) {
      setError("As senhas nao coincidem.");
      setRegisterState("error");
      shakeCard();
      setTimeout(() => setRegisterState("idle"), 1500);
      return;
    }

    setRegisterState("loading");

    try {
      await sanctumApi.csrfCookie();
      const response = await authApi.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.confirm,
      });
      setUser(response.user);

      setRegisterState("success");
      setSuccess("Conta criada! Redirecionando...");
      setTimeout(() => navigate("/app"), 900);
    } catch (err) {
      setError(extractApiErrorMessage(err, "Nao foi possivel criar a conta."));
      setRegisterState("error");
      shakeCard();
      setTimeout(() => setRegisterState("idle"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sidebar to-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur">
          <Sun className={`h-4 w-4 ${isDarkMode ? "text-muted-foreground" : "text-warning"}`} />
          <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} aria-label="Alternar tema" />
          <Moon className={`h-4 w-4 ${isDarkMode ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div ref={logoRef} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-foreground text-2xl mb-1">AlertaTV</h1>
          <p className="text-muted-foreground text-sm">Sistema de alertas em tempo real</p>
        </div>

        {/* Card */}
        <div ref={cardRef} className="bg-card rounded-2xl shadow-2xl overflow-hidden opacity-0">
          <Tabs
            value={tab}
            onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); setSuccess(""); }}
            className="gap-0"
          >
            <TabsList className="w-full h-auto rounded-none border-b border-border bg-card p-0">
              <TabsTrigger
                value="login"
                className="flex-1 h-auto py-3.5 rounded-none border-0 border-b-2 border-transparent text-muted-foreground
                data-[state=active]:border-primary
                data-[state=active]:text-primary
                data-[state=active]:bg-accent
                data-[state=active]:shadow-none"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 h-auto py-3.5 rounded-none border-0 border-b-2 border-transparent text-muted-foreground
                data-[state=active]:border-primary
                data-[state=active]:text-primary
                data-[state=active]:bg-accent
                data-[state=active]:shadow-none"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>

            <div className="p-6 sm:p-7">
              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-success/10 border border-success/30 text-success text-sm rounded-xl p-3 mb-4">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-field">
                  <Label className="text-muted-foreground mb-1.5">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="pl-9 rounded-xl bg-muted"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-muted-foreground mb-1.5">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="pl-9 pr-10 rounded-xl bg-muted"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground hover:bg-transparent">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="form-field flex justify-end">
                  <Button type="button" variant="link" className="text-xs p-0 h-auto text-primary">Esqueci a senha</Button>
                </div>
                <div className="form-field flex justify-center">
                  <Button
                    type="submit"
                    disabled={loginState !== "idle"}
                    style={loginMorphStyle}
                    className="overflow-hidden"
                  >
                    {loginMorphContent}
                  </Button>
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">ou acesse como</span></div>
                </div>
                <Link to="/admin">
                  <Button variant="outline" className="w-full border-border text-primary hover:bg-accent hover:text-primary rounded-xl py-2.5 h-auto">
                    Painel Administrador →
                  </Button>
                </Link>
              </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="form-field">
                  <Label className="text-muted-foreground mb-1.5">Nome completo <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input type="text" value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Seu nome"
                      className="pl-9 rounded-xl bg-muted" />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-muted-foreground mb-1.5">E-mail <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="seu@email.com"
                      className="pl-9 rounded-xl bg-muted" />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-muted-foreground mb-1.5">Empresa / Organização</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input type="text" value={registerForm.company} onChange={(e) => setRegisterForm((f) => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa"
                      className="pl-9 rounded-xl bg-muted" />
                  </div>
                </div>
                <div className="form-field grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground mb-1.5">Senha <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                        <Input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••"
                          className="pl-9 rounded-xl bg-muted" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground mb-1.5">Confirmar <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                        <Input type="password" value={registerForm.confirm} onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••"
                          className="pl-9 rounded-xl bg-muted" />
                    </div>
                  </div>
                </div>
                <div className="form-field flex justify-center mt-1">
                  <Button
                    type="submit"
                    disabled={registerState !== "idle"}
                    style={registerMorphStyle}
                    className="overflow-hidden"
                  >
                    {registerMorphContent}
                  </Button>
                </div>
                <p className="form-field text-xs text-muted-foreground text-center">Ao criar uma conta, você concorda com os <span className="text-primary cursor-pointer hover:underline">Termos de Uso</span>.</p>
              </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mt-6">© 2026 AlertaTV · v1.0</p>
      </div>
    </div>
  );
}
