import { Link } from "react-router";
import { AnimatedCounter } from "../components/AnimatedCounter";
import {
  Users,
  Monitor,
  BellRing,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const weeklyAlerts = [
  { dia: "Seg", alertas: 34, usuarios: 12 },
  { dia: "Ter", alertas: 52, usuarios: 18 },
  { dia: "Qua", alertas: 28, usuarios: 10 },
  { dia: "Qui", alertas: 67, usuarios: 22 },
  { dia: "Sex", alertas: 45, usuarios: 16 },
  { dia: "Sáb", alertas: 12, usuarios: 5 },
  { dia: "Dom", alertas: 8, usuarios: 3 },
];

const alertTypesDist = [
  { name: "Informativo", value: 42, color: "#3b82f6" },
  { name: "Aviso", value: 28, color: "#f59e0b" },
  { name: "Crítico", value: 18, color: "#ef4444" },
  { name: "Sucesso", value: 12, color: "#10b981" },
];

const userGrowth = [
  { mes: "Set", usuarios: 28 },
  { mes: "Out", usuarios: 41 },
  { mes: "Nov", usuarios: 55 },
  { mes: "Dez", usuarios: 63 },
  { mes: "Jan", usuarios: 79 },
  { mes: "Fev", usuarios: 94 },
];

const topUsers = [
  { name: "João Silva", email: "joao@empresa.com.br", devices: 6, alerts: 82, rate: "97%" },
  { name: "Maria Oliveira", email: "maria@fabrica.com.br", devices: 12, alerts: 145, rate: "100%" },
  { name: "Carlos Santos", email: "carlos@hospital.com.br", devices: 8, alerts: 67, rate: "89%" },
  { name: "Ana Ferreira", email: "ana@escola.gov.br", devices: 4, alerts: 38, rate: "95%" },
  { name: "Pedro Costa", email: "pedro@varejo.com.br", devices: 9, alerts: 112, rate: "98%" },
];

const metrics = [
  { label: "Usuários cadastrados", numericValue: 94, change: "+18%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Dispositivos ativos", numericValue: 428, change: "+24%", icon: Monitor, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Alertas este mês", numericValue: 2841, format: (v: number) => Math.round(v).toLocaleString("pt-BR"), change: "+31%", icon: BellRing, color: "text-red-500", bg: "bg-red-50" },
  { label: "Média TV / usuário", numericValue: 4.6, format: (v: number) => v.toFixed(1).replace(".", ","), change: "+0,8", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export function Admin() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-slate-800">Painel Administrativo</h1>
        <p className="text-slate-500 text-sm mt-0.5">Visão geral do sistema AlertaTV · Fevereiro 2026</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map(({ label, numericValue, format, change, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="w-3 h-3" /> {change}
              </span>
            </div>
            <AnimatedCounter value={numericValue} format={format} className="text-2xl font-bold text-slate-800" />
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas por dia */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 mb-1">Atividade semanal</h3>
          <p className="text-slate-500 text-xs mb-4">Alertas e usuários ativos por dia</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyAlerts} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="alertas" name="Alertas" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="usuarios" name="Usuários ativos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert types distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 mb-1">Tipos de alertas</h3>
          <p className="text-slate-500 text-xs mb-4">Distribuição no mês</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={alertTypesDist} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {alertTypesDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User growth + top users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 mb-1">Crescimento de usuários</h3>
          <p className="text-slate-500 text-xs mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={userGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="usuarios" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert type breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 mb-4">Distribuição por tipo</h3>
          <div className="space-y-3">
            {[
              { label: "Informativo", count: 1192, pct: 42, color: "bg-blue-500", icon: Info, textColor: "text-blue-600" },
              { label: "Aviso", count: 795, pct: 28, color: "bg-amber-500", icon: AlertTriangle, textColor: "text-amber-600" },
              { label: "Crítico", count: 511, pct: 18, color: "bg-red-500", icon: Zap, textColor: "text-red-500" },
              { label: "Sucesso", count: 341, pct: 12, color: "bg-emerald-500", icon: CheckCircle2, textColor: "text-emerald-600" },
            ].map(({ label, count, pct, color, icon: Icon, textColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${textColor}`} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{count.toLocaleString("pt-BR")}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top users table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800">Top usuários</h3>
          <Link to="/admin/usuarios" className="text-xs text-violet-600 hover:underline flex items-center gap-0.5">
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Usuário", "Dispositivos", "Alertas enviados", "Taxa entrega"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topUsers.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" /> {u.devices}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <BellRing className="w-3.5 h-3.5 text-slate-400" /> {u.alerts}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium ${parseInt(u.rate) === 100 ? "text-emerald-600" : parseInt(u.rate) >= 95 ? "text-blue-600" : "text-amber-600"}`}>
                      {u.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {topUsers.map((u, i) => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                <p className="text-xs text-slate-400 truncate mb-2">{u.email}</p>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {u.devices} disp.</span>
                  <span className="flex items-center gap-1"><BellRing className="w-3 h-3" /> {u.alerts} alertas</span>
                  <span className={`font-medium ${parseInt(u.rate) >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{u.rate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}