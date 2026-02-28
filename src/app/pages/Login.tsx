import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Zap, Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from "lucide-react";

export function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", company: "", password: "", confirm: "" });

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (!loginForm.email || !loginForm.password) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }
    navigate("/app");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    setLoading(false);
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                <div>
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
                <div>
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
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-blue-600 hover:underline">Esqueci a senha</button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {loading ? "Entrando..." : "Entrar"}
                </button>

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
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">Nome completo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Seu nome"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">E-mail <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="seu@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">Empresa / Organização</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.company} onChange={(e) => setRegisterForm((f) => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {loading ? "Criando conta..." : "Criar Minha Conta"}
                </button>
                <p className="text-xs text-slate-400 text-center">Ao criar uma conta, você concorda com os <span className="text-blue-600 cursor-pointer hover:underline">Termos de Uso</span>.</p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600/40 text-xs mt-6">© 2026 AlertaTV · v1.0</p>
      </div>
    </div>
  );
}
