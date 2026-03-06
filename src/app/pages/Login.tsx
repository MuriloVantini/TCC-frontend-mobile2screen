import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { Zap, Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { animate, stagger } from "animejs";

type SubmitState = "idle" | "loading" | "success" | "error";

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

  useEffect(() => {
    animate(cardRef.current!, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 700,
      easing: "easeOutExpo",
    });
    animate(".form-field", {
      translateX: [-12, 0],
      opacity: [0, 1],
      delay: stagger(70, { start: 250 }),
      easing: "easeOutQuad",
    });
  }, [tab]);

  const shakeCard = () => {
    animate(cardRef.current!, {
      translateX: [-10, 10, -8, 8, -4, 4, 0],
      duration: 500,
      easing: "easeInOutSine",
    });
  };

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-600/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl mb-1">AlertaTV</h1>
          <p className="text-slate-400 text-sm">Sistema de alertas em tempo real</p>
        </div>

        {/* Card */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden opacity-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === "login" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === "register" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Criar Conta
            </button>
          </div>

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

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-field">
                  <label className="text-sm text-slate-600 mb-1.5 block">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="text-sm text-slate-600 mb-1.5 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="form-field flex justify-end">
                  <button type="button" className="text-xs text-blue-600 hover:underline">Esqueci a senha</button>
                </div>
                <div className="form-field flex justify-center">
                  <button
                    type="submit"
                    disabled={loginState !== "idle"}
                    style={{
                      width: loginState === "idle" ? "100%" : "48px",
                      height: "48px",
                      borderRadius: loginState === "idle" ? "12px" : "9999px",
                      transition: "width 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), border-radius 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), background-color 0.35s ease",
                    }}
                    className={`flex items-center justify-center text-white font-medium text-sm overflow-hidden ${
                      loginState === "success"
                        ? "bg-emerald-500"
                        : loginState === "error"
                        ? "bg-red-500"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loginState === "idle" && <span>Entrar</span>}
                    {loginState === "loading" && (
                      <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {loginState === "success" && (
                      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {loginState === "error" && (
                      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">ou acesse como</span></div>
                </div>
                <Link to="/admin" className="w-full flex items-center justify-center gap-2 border border-violet-200 text-violet-600 hover:bg-violet-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Painel Administrador →
                </Link>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="form-field">
                  <label className="text-sm text-slate-600 mb-1.5 block">Nome completo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Seu nome"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="form-field">
                  <label className="text-sm text-slate-600 mb-1.5 block">E-mail <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="seu@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="form-field">
                  <label className="text-sm text-slate-600 mb-1.5 block">Empresa / Organização</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.company} onChange={(e) => setRegisterForm((f) => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="form-field grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Senha <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Confirmar <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" value={registerForm.confirm} onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="form-field flex justify-center mt-1">
                  <button
                    type="submit"
                    disabled={registerState !== "idle"}
                    style={{
                      width: registerState === "idle" ? "100%" : "48px",
                      height: "48px",
                      borderRadius: registerState === "idle" ? "12px" : "9999px",
                      transition: "width 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), border-radius 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), background-color 0.35s ease",
                    }}
                    className={`flex items-center justify-center text-white font-medium text-sm overflow-hidden ${
                      registerState === "success"
                        ? "bg-emerald-500"
                        : registerState === "error"
                        ? "bg-red-500"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {registerState === "idle" && <span>Criar Minha Conta</span>}
                    {registerState === "loading" && (
                      <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {registerState === "success" && (
                      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {registerState === "error" && (
                      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="form-field text-xs text-slate-400 text-center">Ao criar uma conta, você concorda com os <span className="text-blue-600 cursor-pointer hover:underline">Termos de Uso</span>.</p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600/40 text-xs mt-6">© 2026 AlertaTV · v1.0</p>
      </div>
    </div>
  );
}
