import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Webhook,
  Key,
  Save,
  Check,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Lock,
  Zap,
  Monitor,
} from "lucide-react";

const sections = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "api", label: "API & Integração", icon: Webhook },
];

const fakeApiKey = "atv_prod_sk_4f8a2b1c9d3e7f6g5h0i1j2k3l4m5n6o7p8q9r";

export function Configuracoes() {
  const [active, setActive] = useState("perfil");
  const [saved, setSaved] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profile, setProfile] = useState({ name: "João Silva", email: "joao@empresa.com.br", phone: "(11) 99999-0000", company: "Empresa Ltda" });

  const [notifs, setNotifs] = useState({
    alertFailed: true,
    deviceOffline: true,
    weeklyReport: false,
    deviceConnected: true,
    limitReached: true,
  });

  const handleSave = (section: string) => {
    setSaved((p) => [...p, section]);
    setTimeout(() => setSaved((p) => p.filter((s) => s !== section)), 2500);
  };

  const copyApiKey = () => {
    navigator.clipboard?.writeText(fakeApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeItem = sections.find((s) => s.id === active)!;
  const ActiveIcon = activeItem.icon;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-slate-800">Configurações</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile section picker */}
        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <ActiveIcon className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">{activeItem.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${mobileOpen ? "rotate-90" : ""}`} />
          </button>
          {mobileOpen && (
            <div className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
              {sections.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActive(id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-b border-slate-50 last:border-0 ${active === id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-slate-50 last:border-0 ${
                  active === id ? "bg-blue-50 text-blue-700 border-l-2 border-l-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`}>
                <Icon className="w-4 h-4 shrink-0" />{label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">

            {/* Perfil */}
            {active === "perfil" && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-white text-xl font-bold">JS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{profile.name}</p>
                    <p className="text-slate-500 text-sm">{profile.email}</p>
                    <button className="text-xs text-blue-600 hover:underline mt-1">Alterar foto</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Nome completo", key: "name", icon: User, placeholder: "Seu nome" },
                    { label: "E-mail", key: "email", icon: Mail, placeholder: "email@exemplo.com" },
                    { label: "Telefone", key: "phone", icon: Phone, placeholder: "(00) 00000-0000" },
                    { label: "Empresa", key: "company", icon: Building2, placeholder: "Nome da empresa" },
                  ].map(({ label, key, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className="text-sm text-slate-600 mb-1.5 block">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={profile[key as keyof typeof profile]}
                          onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave("perfil")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                    {saved.includes("perfil") ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
                  </button>
                </div>
              </div>
            )}

            {/* Notificações */}
            {active === "notificacoes" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-slate-800 mb-1">Notificações</h3>
                  <p className="text-slate-500 text-sm">Quando você quer ser notificado por e-mail</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "alertFailed", label: "Alerta não entregue", desc: "Quando um alerta falha ao ser entregue" },
                    { key: "deviceOffline", label: "Dispositivo desconectado", desc: "Quando um TV/Raspberry perde conexão" },
                    { key: "deviceConnected", label: "Dispositivo conectado", desc: "Quando um novo dispositivo fica online" },
                    { key: "weeklyReport", label: "Relatório semanal", desc: "Resumo de atividades toda segunda-feira" },
                    { key: "limitReached", label: "Limite atingido", desc: "Quando o plano está próximo do limite" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${notifs[key as keyof typeof notifs] ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                          style={{ left: notifs[key as keyof typeof notifs] ? "calc(100% - 22px)" : "2px" }} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSave("notificacoes")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                    {saved.includes("notificacoes") ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
                  </button>
                </div>
              </div>
            )}

            {/* Segurança */}
            {active === "seguranca" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-slate-800 mb-1">Alterar Senha</h3>
                  <p className="text-slate-500 text-sm">Recomendamos uma senha forte com +8 caracteres</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Senha atual</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" placeholder="••••••••" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Nova senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Confirmar nova senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" placeholder="••••••••" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSave("seguranca")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                    {saved.includes("seguranca") ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Alterar Senha</>}
                  </button>
                </div>
              </div>
            )}

            {/* API */}
            {active === "api" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-slate-800 mb-1">API & Integração</h3>
                  <p className="text-slate-500 text-sm">Use a API para integrar AlertaTV com seus sistemas</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl">
                  <p className="text-xs text-slate-400 mb-2 font-mono">Sua chave de API</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-emerald-400 text-xs font-mono break-all">
                      {showApiKey ? fakeApiKey : fakeApiKey.replace(/./g, "•").slice(0, 48)}
                    </code>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 text-slate-400 hover:text-white">
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={copyApiKey} className="p-1.5 text-slate-400 hover:text-white">
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  Mantenha sua chave em sigilo. Não a compartilhe em repositórios ou clientes públicos.
                </div>

                <div className="space-y-3">
                  <h4 className="text-slate-700">Exemplo de uso</h4>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
{`POST https://api.alertatv.io/v1/alerts
Authorization: Bearer ${fakeApiKey.slice(0, 20)}...

{
  "title": "Aviso de manutenção",
  "message": "Sistema em manutenção às 18h",
  "type": "warning",
  "tags": ["ti", "todos"],
  "duration": "10min"
}`}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4" /> Gerar nova chave
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                    <Webhook className="w-4 h-4" /> Ver documentação completa
                  </button>
                </div>

                {/* Webhooks */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-slate-700 mb-3">Webhooks</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">URL de callback</label>
                      <input placeholder="https://seusite.com.br/webhook/alertatv"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Alerta entregue", "Alerta falhou", "Dispositivo online", "Dispositivo offline"].map((ev) => (
                        <label key={ev} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" className="rounded" /> {ev}
                        </label>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                      <Save className="w-4 h-4" /> Salvar webhook
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
