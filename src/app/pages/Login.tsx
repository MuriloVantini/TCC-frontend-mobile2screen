import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { Zap, Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { shake, useMorphButton, type SubmitState } from "../hooks/useFormSubmitAnimation";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useDrawableAnimation } from "../hooks/useDrawableAnimation";

export function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<SubmitState>("idle");
  const [registerState, setRegisterState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", company: "", password: "", confirm: "" });

  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { shakeCard } = shake(cardRef, tab);
  const { morphStyle: loginMorphStyle, morphContent: loginMorphContent } = useMorphButton(loginState, <span>Entrar</span>);
  const { morphStyle: registerMorphStyle, morphContent: registerMorphContent } = useMorphButton(registerState, <span>Criar Minha Conta</span>);

  useDrawableAnimation(logoRef, { textSelector: "span" });


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    if (!loginForm.email || !loginForm.password) {
      setError("Preencha todos os campos.");
      setLoginState("error");
      shakeCard();
      setTimeout(() => setLoginState("idle"), 1500);
      return;
    }
    setLoginState("success");
    setTimeout(() => navigate("/app"), 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegisterState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError("Preencha todos os campos obrigatórios.");
      setRegisterState("error");
      shakeCard();
      setTimeout(() => setRegisterState("idle"), 1500);
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      setError("As senhas não coincidem.");
      setRegisterState("error");
      shakeCard();
      setTimeout(() => setRegisterState("idle"), 1500);
      return;
    }
    setRegisterState("success");
    setSuccess("Conta criada! Redirecionando...");
    setTimeout(() => navigate("/app"), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div ref={logoRef} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-600/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl mb-1">AlertaTV</h1>
          <p className="text-slate-400 text-sm">Sistema de alertas em tempo real</p>
        </div>

        {/* Card */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden opacity-0">
          <Tabs
            value={tab}
            onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); setSuccess(""); }}
            className="gap-0"
          >
            <TabsList className="w-full h-auto rounded-none border-b border-slate-100 bg-white p-0">
              <TabsTrigger
                value="login"
                className="flex-1 h-auto py-3.5 rounded-none border-b-2 border-transparent text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:shadow-none"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 h-auto py-3.5 rounded-none border-b-2 border-transparent text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:shadow-none"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <div className="p-6 sm:p-7">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-3 mb-4">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-field">
                  <Label className="text-slate-600 mb-1.5">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="pl-9 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-slate-600 mb-1.5">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="pl-9 pr-10 rounded-xl bg-slate-50"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-slate-400 hover:text-slate-600 hover:bg-transparent">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="form-field flex justify-end">
                  <Button type="button" variant="link" className="text-xs p-0 h-auto text-blue-600">Esqueci a senha</Button>
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
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">ou acesse como</span></div>
                </div>
                <Link to="/admin">
                  <Button variant="outline" className="w-full border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl py-2.5 h-auto">
                    Painel Administrador →
                  </Button>
                </Link>
              </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="form-field">
                  <Label className="text-slate-600 mb-1.5">Nome completo <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input type="text" value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Seu nome"
                      className="pl-9 rounded-xl bg-slate-50" />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-slate-600 mb-1.5">E-mail <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="seu@email.com"
                      className="pl-9 rounded-xl bg-slate-50" />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="text-slate-600 mb-1.5">Empresa / Organização</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input type="text" value={registerForm.company} onChange={(e) => setRegisterForm((f) => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa"
                      className="pl-9 rounded-xl bg-slate-50" />
                  </div>
                </div>
                <div className="form-field grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-600 mb-1.5">Senha <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                        <Input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••"
                          className="pl-9 rounded-xl bg-slate-50" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600 mb-1.5">Confirmar <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                        <Input type="password" value={registerForm.confirm} onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••"
                          className="pl-9 rounded-xl bg-slate-50" />
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
                <p className="form-field text-xs text-slate-400 text-center">Ao criar uma conta, você concorda com os <span className="text-blue-600 cursor-pointer hover:underline">Termos de Uso</span>.</p>
              </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <p className="text-center text-slate-600/40 text-xs mt-6">© 2026 AlertaTV · v1.0</p>
      </div>
    </div>
  );
}
