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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../components/ui/chart";

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
  { key: "informativo", name: "Informativo", value: 42 },
  { key: "aviso", name: "Aviso", value: 28 },
  { key: "critico", name: "Crítico", value: 18 },
  { key: "sucesso", name: "Sucesso", value: 12 },
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

const weeklyChartConfig = {
  alertas: { label: "Alertas", color: "#2563eb" },
  usuarios: { label: "Usuários ativos", color: "#8b5cf6" },
} satisfies ChartConfig;

const alertTypesChartConfig = {
  informativo: { label: "Informativo", color: "#3b82f6" },
  aviso: { label: "Aviso", color: "#f59e0b" },
  critico: { label: "Crítico", color: "#ef4444" },
  sucesso: { label: "Sucesso", color: "#10b981" },
} satisfies ChartConfig;

const userGrowthChartConfig = {
  usuarios: { label: "Usuários", color: "#8b5cf6" },
} satisfies ChartConfig;

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
          <Card key={label} className="gap-0 border-slate-100 shadow-sm p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <Badge variant="outline" className="gap-0.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-3 h-3" /> {change}
              </Badge>
            </div>
            <AnimatedCounter value={numericValue} format={format} className="text-2xl font-bold text-slate-800" />
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas por dia */}
        <Card className="lg:col-span-2 gap-0 bg-white border-slate-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-slate-800">Atividade semanal</CardTitle>
            <CardDescription className="text-slate-500 text-xs">Alertas e usuários ativos por dia</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
          <ChartContainer config={weeklyChartConfig} className="h-[200px] w-full">
            <BarChart data={weeklyAlerts} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="alertas" fill="var(--color-alertas)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="usuarios" fill="var(--color-usuarios)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          </CardContent>
        </Card>

        {/* Alert types distribution */}
        <Card className="gap-0 bg-white border-slate-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-slate-800">Tipos de alertas</CardTitle>
            <CardDescription className="text-slate-500 text-xs">Distribuição no mês</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
          <ChartContainer config={alertTypesChartConfig} className="h-[200px] w-full">
            <PieChart>
              <Pie data={alertTypesDist} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {alertTypesDist.map((entry) => <Cell key={entry.key} fill={`var(--color-${entry.key})`} />)}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
              <ChartLegend content={<ChartLegendContent nameKey="key" />} />
            </PieChart>
          </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User growth + top users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth chart */}
        <Card className="gap-0 bg-white border-slate-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-slate-800">Crescimento de usuários</CardTitle>
            <CardDescription className="text-slate-500 text-xs">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
          <ChartContainer config={userGrowthChartConfig} className="h-[180px] w-full">
            <LineChart data={userGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="usuarios" stroke="var(--color-usuarios)" strokeWidth={2.5} dot={{ fill: "var(--color-usuarios)", r: 4 }} />
            </LineChart>
          </ChartContainer>
          </CardContent>
        </Card>

        {/* Alert type breakdown */}
        <Card className="gap-0 bg-white border-slate-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-slate-800">Distribuição por tipo</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
          <div className="space-y-4">
            {[
              { label: "Informativo", count: 1192, pct: 42, color: "bg-blue-500", icon: Info, textColor: "text-blue-600" },
              { label: "Aviso", count: 795, pct: 28, color: "bg-amber-500", icon: AlertTriangle, textColor: "text-amber-600" },
              { label: "Crítico", count: 511, pct: 18, color: "bg-red-500", icon: Zap, textColor: "text-red-500" },
              { label: "Sucesso", count: 341, pct: 12, color: "bg-emerald-500", icon: CheckCircle2, textColor: "text-emerald-600" },
            ].map(({ label, count, pct, icon: Icon, textColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${textColor}`} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{count.toLocaleString("pt-BR")}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-600">{pct}%</Badge>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5 bg-slate-100" />
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Top users table */}
      <Card className="gap-0 bg-white border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800">Top usuários</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50">
              <Link to="/admin/usuarios">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50 hover:bg-slate-50">
                {["Usuário", "Dispositivos", "Alertas enviados", "Taxa entrega"].map((h) => (
                  <TableHead key={h} className="px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {topUsers.map((u, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50 border-slate-50">
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" /> {u.devices}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <BellRing className="w-3.5 h-3.5 text-slate-400" /> {u.alerts}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <span className={`text-sm font-medium ${parseInt(u.rate, 10) === 100 ? "text-emerald-600" : parseInt(u.rate, 10) >= 95 ? "text-blue-600" : "text-amber-600"}`}>
                      {u.rate}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <span className={`font-medium ${parseInt(u.rate, 10) >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{u.rate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}