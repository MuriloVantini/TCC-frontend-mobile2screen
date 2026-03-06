import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { AnimatedCounter } from "../components/AnimatedCounter";
import {
  Monitor,
  BellRing,
  Wifi,
  WifiOff,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  ChevronRight,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const activityData = [
  { hora: "08h", alertas: 2 },
  { hora: "09h", alertas: 5 },
  { hora: "10h", alertas: 3 },
  { hora: "11h", alertas: 8 },
  { hora: "12h", alertas: 1 },
  { hora: "13h", alertas: 4 },
  { hora: "14h", alertas: 6 },
  { hora: "15h", alertas: 9 },
  { hora: "16h", alertas: 3 },
  { hora: "17h", alertas: 7 },
];

const recentAlerts = [
  { id: 1, title: "Reunião em 10 minutos", type: "info", tags: ["sala-reuniao", "diretoria"], devices: 3, status: "delivered", time: "há 5 min" },
  { id: 2, title: "ALERTA: Saída de emergência bloqueada", type: "critical", tags: ["producao", "seguranca"], devices: 8, status: "delivered", time: "há 23 min" },
  { id: 3, title: "Sistema em manutenção às 18h", type: "warning", tags: ["ti", "todos"], devices: 12, status: "delivered", time: "há 1h" },
  { id: 4, title: "Bem-vindo ao novo colaborador!", type: "success", tags: ["recepcao"], devices: 2, status: "failed", time: "há 2h" },
];

const devices = [
  { id: 1, name: "TV Recepção Principal", type: "tv", online: true, tags: ["recepcao", "todos"] },
  { id: 2, name: "RPi Sala Reunião A", type: "rpi", online: true, tags: ["sala-reuniao", "diretoria"] },
  { id: 3, name: "TV Produção Linha 1", type: "tv", online: false, tags: ["producao"] },
  { id: 4, name: "TV RH", type: "tv", online: true, tags: ["rh", "todos"] },
];

const alertTypeConfig = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-100", label: "Info" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", label: "Aviso" },
  critical: { icon: Zap, color: "text-red-600", bg: "bg-red-100", label: "Crítico" },
  success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", label: "Sucesso" },
};

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

export function Dashboard() {
  const onlineCount = devices.filter((d) => d.online).length;
  const offlineCount = devices.length - onlineCount;
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!metricsRef.current) return;
    animate(Array.from(metricsRef.current.children), {
      opacity: [0, 1],
      translateY: [14, 0],
      delay: stagger(80),
      duration: 500,
      ease: "outExpo",
    });
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-blue-600/20">
        <div>
          <p className="text-blue-100 text-sm">Bem-vindo de volta,</p>
          <h1 className="text-white text-xl mt-0.5">João Silva 👋</h1>
          <p className="text-blue-200 text-sm mt-1">{devices.length} dispositivos · {onlineCount} online</p>
        </div>
        <Link
          to="/app/enviar"
          className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 shadow-sm"
        >
          <BellRing className="w-4 h-4" />
          Enviar Alerta
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics */}
      <div ref={metricsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Dispositivos", numericValue: devices.length, suffix: "", sub: `${onlineCount} online`, icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Online agora", numericValue: onlineCount, suffix: "", sub: `${offlineCount} offline`, icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Alertas hoje", numericValue: 9, suffix: "", sub: "+3 vs ontem", icon: BellRing, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Entregues", numericValue: 94, suffix: "%", sub: "taxa de entrega", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, numericValue, suffix, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <AnimatedCounter value={numericValue} suffix={suffix} />
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className={`text-xs mt-1 ${color}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800">Atividade de hoje</h3>
              <p className="text-slate-500 text-xs mt-0.5">Alertas enviados por hora</p>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Hoje
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="alertas" stroke="#2563eb" fill="url(#grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Devices status */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800">Dispositivos</h3>
            <Link to="/app/dispositivos" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${d.online ? "bg-emerald-50" : "bg-slate-100"}`}>
                  {d.type === "tv" ? (
                    <Monitor className={`w-4 h-4 ${d.online ? "text-emerald-600" : "text-slate-400"}`} />
                  ) : (
                    <div className={`w-4 h-4 flex items-center justify-center ${d.online ? "text-emerald-600" : "text-slate-400"}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3"/>
                        <circle cx="7" cy="8" r="1.5"/>
                        <circle cx="17" cy="8" r="1.5"/>
                        <circle cx="7" cy="16" r="1.5"/>
                        <circle cx="17" cy="16" r="1.5"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{d.name}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {d.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={`flex items-center gap-1 shrink-0 ${d.online ? "text-emerald-600" : "text-slate-400"}`}>
                  {d.online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800">Alertas Recentes</h3>
          <Link to="/app/historico" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            Ver histórico <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentAlerts.map((alert) => {
            const cfg = alertTypeConfig[alert.type as keyof typeof alertTypeConfig];
            const AlertIcon = cfg.icon;
            return (
              <div key={alert.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-8 h-8 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                  <AlertIcon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{alert.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    {alert.status === "delivered" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-xs text-slate-400">{alert.devices} disp.</span>
                  </div>
                  <span className="text-xs text-slate-400">{alert.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
