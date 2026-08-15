import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock,
  Monitor,
  RefreshCw,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useStatisticsApi } from "../hooks/api/entities";
import type {
  AdminDashboardStatistics,
  AdminDashboardTopUser,
} from "../hooks/api/laravel-api.types";

const activityChartConfig = {
  alerts_sent: { label: "Alertas enviados", color: "var(--color-chart-1)" },
  alerts_delivered: { label: "Entregas confirmadas", color: "var(--color-success)" },
} satisfies ChartConfig;

const alertTypeConfig = {
  info: { label: "Informativo", color: "var(--color-chart-1)" },
  warning: { label: "Aviso", color: "var(--color-warning)" },
  critical: { label: "Crítico", color: "var(--color-destructive)" },
  success: { label: "Sucesso", color: "var(--color-success)" },
} as const;

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatDay(value: unknown): string {
  if (typeof value !== "string") return "-";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }).replace(".", "");
}

function formatUpdatedAt(value: unknown): string {
  if (typeof value !== "string") return "agora";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "agora";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: unknown): string {
  if (typeof name !== "string" || !name.trim()) return "US";
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function Admin() {
  const statisticsApi = useMemo(() => useStatisticsApi(), []);
  const [dashboard, setDashboard] = useState<AdminDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      setDashboard(await statisticsApi.adminDashboard());
    } catch {
      setError("Nao foi possivel carregar as metricas administrativas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statisticsApi]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadDashboard(true);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadDashboard]);

  const users = dashboard?.users ?? {};
  const devices = dashboard?.devices ?? {};
  const alerts = dashboard?.alerts ?? {};
  const deliveries = dashboard?.deliveries ?? {};
  const activityData = (dashboard?.daily ?? []).map((item) => ({
    day: formatDay(item.date),
    alerts_sent: toNumber(item.alerts_sent),
    alerts_delivered: toNumber(item.alerts_delivered),
  }));
  const alertTypes = (dashboard?.alerts_by_type ?? []).map((item) => {
    const type = typeof item.type === "string" && item.type in alertTypeConfig
      ? item.type as keyof typeof alertTypeConfig
      : "info";
    return {
      type,
      name: alertTypeConfig[type].label,
      value: toNumber(item.count),
      color: alertTypeConfig[type].color,
    };
  });
  const topUsers = dashboard?.top_users ?? [];
  const onlinePercentage = toNumber(devices.online_percentage);
  const deliveryRate = toNumber(deliveries.delivery_rate);

  const metrics = [
    {
      label: "Usuários cadastrados",
      value: toNumber(users.total),
      detail: `${toNumber(users.active)} ativos`,
      icon: Users,
      iconClass: "text-primary",
      iconBackground: "bg-accent",
      href: "/admin/usuarios",
    },
    {
      label: "Dispositivos cadastrados",
      value: toNumber(devices.total),
      detail: `${toNumber(devices.offline)} offline`,
      icon: Monitor,
      iconClass: "text-primary",
      iconBackground: "bg-accent",
    },
    {
      label: "Dispositivos online",
      value: toNumber(devices.online),
      detail: `${onlinePercentage.toLocaleString("pt-BR")}% conectados`,
      icon: Wifi,
      iconClass: "text-success",
      iconBackground: "bg-secondary",
    },
    {
      label: "Alertas hoje",
      value: toNumber(alerts.today),
      detail: `${toNumber(alerts.last_30_days)} nos últimos 30 dias`,
      icon: BellRing,
      iconClass: "text-warning",
      iconBackground: "bg-secondary",
    },
    {
      label: "Taxa de entrega",
      value: deliveryRate,
      suffix: "%",
      detail: `${toNumber(deliveries.failed)} falhas`,
      icon: CheckCircle2,
      iconClass: deliveryRate >= 90 ? "text-success" : "text-warning",
      iconBackground: "bg-secondary",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground">Painel Administrativo</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Visão consolidada de usuários, dispositivos e alertas do sistema</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadDashboard(true)} disabled={loading || refreshing}>
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar dados
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Falha ao carregar o dashboard</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void loadDashboard()}>Tentar novamente</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground shadow-lg shadow-primary/20">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-primary-foreground/75">Visão administrativa</p>
            <h2 className="mt-0.5 text-xl text-white">Operacao do Mobile2Screen</h2>
            <p className="mt-1 text-sm text-primary-foreground/75">
              {loading ? "Carregando dados..." : `${toNumber(devices.total)} dispositivos em ${toNumber(users.total)} contas`}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-primary-foreground/80 backdrop-blur-sm">
            <Clock className="size-4" /> Atualizado as {formatUpdatedAt(dashboard?.generated_at)}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map(({ label, value, suffix, detail, icon: Icon, iconClass, iconBackground, href }) => {
          const content = (
            <Card className="h-full gap-0 border-border p-4 shadow-sm transition-colors hover:border-primary/40">
              <div className={`mb-3 flex size-9 items-center justify-center rounded-xl ${iconBackground}`}>
                <Icon className={`size-4.5 ${iconClass}`} />
              </div>
              {loading ? <Skeleton className="h-7 w-20" /> : <AnimatedCounter value={value} suffix={suffix} />}
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              <p className={`mt-1 text-xs ${iconClass}`}>{detail}</p>
            </Card>
          );
          return href ? <Link key={label} to={href}>{content}</Link> : <div key={label}>{content}</div>;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="gap-0 border-border shadow-sm lg:col-span-3">
          <CardHeader className="px-5 pb-3 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Estatisticas diarias</CardTitle>
            <CardDescription>Alertas enviados e entregas confirmadas nos últimos sete dias</CardDescription>
              </div>
              <Activity className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer config={activityChartConfig} className="h-56 w-full aspect-auto">
                <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="admin-alerts-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-alerts_sent)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--color-alerts_sent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area type="monotone" dataKey="alerts_sent" stroke="var(--color-alerts_sent)" fill="url(#admin-alerts-gradient)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="alerts_delivered" stroke="var(--color-alerts_delivered)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 border-border shadow-sm lg:col-span-2">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle>Status dos dispositivos</CardTitle>
            <CardDescription>Disponibilidade atual em todas as contas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <>
                <div className="flex items-center justify-center py-2">
                  <div className="relative flex size-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--color-success) ${onlinePercentage}%, var(--color-muted) 0)` }}>
                    <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card">
                      <span className="text-2xl font-semibold text-foreground">{onlinePercentage.toLocaleString("pt-BR")}%</span>
                      <span className="text-xs text-muted-foreground">online</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <div className="flex items-center gap-2 text-success"><Wifi className="size-4" /><span className="text-xs">Online</span></div>
                    <p className="mt-1 text-xl font-semibold text-foreground">{toNumber(devices.online)}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <div className="flex items-center gap-2 text-muted-foreground"><WifiOff className="size-4" /><span className="text-xs">Offline</span></div>
                    <p className="mt-1 text-xl font-semibold text-foreground">{toNumber(devices.offline)}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="gap-0 border-border shadow-sm lg:col-span-2">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle>Alertas por tipo</CardTitle>
            <CardDescription>Distribuição dos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? <Skeleton className="h-56 w-full" /> : alertTypes.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">Nenhum alerta no periodo.</p>
            ) : (
              <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <ChartContainer config={{}} className="h-44 w-full aspect-auto">
                  <PieChart>
                    <Pie data={alertTypes} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={3}>
                      {alertTypes.map((item) => <Cell key={item.type} fill={item.color} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2">
                  {alertTypes.map((item) => (
                    <div key={item.type} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden border-border shadow-sm lg:col-span-3">
          <CardHeader className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Contas com mais alertas</CardTitle>
                <CardDescription>Atividade e taxa de entrega nos últimos 30 dias</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/usuarios">Ver usuários <ChevronRight className="size-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : topUsers.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
            ) : (
              <>
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="px-5">Usuário</TableHead>
                        <TableHead>Dispositivos</TableHead>
                        <TableHead>Alertas</TableHead>
                        <TableHead className="pr-5 text-right">Entrega</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topUsers.map((user) => <TopUserRow key={String(user.id)} user={user} />)}
                    </TableBody>
                  </Table>
                </div>
                <div className="divide-y divide-border sm:hidden">
                  {topUsers.map((user) => (
                    <div key={String(user.id)} className="flex items-center gap-3 p-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-xs font-bold text-white">{initials(user.name)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground"><p>{toNumber(user.alerts_count)} alertas</p><p className="font-medium text-success">{toNumber(user.delivery_rate)}%</p></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 border-border shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <DeliverySummary icon={CheckCircle2} label="Entregues" value={toNumber(deliveries.delivered)} color="text-success" progress={deliveryRate} />
          <DeliverySummary icon={AlertTriangle} label="Com falha" value={toNumber(deliveries.failed)} color="text-destructive" progress={toNumber(deliveries.total) > 0 ? toNumber(deliveries.failed) / toNumber(deliveries.total) * 100 : 0} />
          <DeliverySummary icon={Clock} label="Pendentes" value={toNumber(deliveries.pending)} color="text-warning" progress={toNumber(deliveries.total) > 0 ? toNumber(deliveries.pending) / toNumber(deliveries.total) * 100 : 0} />
        </CardContent>
      </Card>
    </div>
  );
}

function TopUserRow({ user }: { user: AdminDashboardTopUser }) {
  const rate = toNumber(user.delivery_rate);
  return (
    <TableRow>
      <TableCell className="px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-[11px] font-bold text-white">{initials(user.name)}</div>
          <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
        </div>
      </TableCell>
      <TableCell>{toNumber(user.devices_count)}</TableCell>
      <TableCell>{toNumber(user.alerts_count)}</TableCell>
      <TableCell className={`pr-5 text-right font-medium ${rate >= 90 ? "text-success" : rate >= 70 ? "text-warning" : "text-destructive"}`}>{rate.toLocaleString("pt-BR")}%</TableCell>
    </TableRow>
  );
}

function DeliverySummary({ icon: Icon, label, value, color, progress }: { icon: typeof CheckCircle2; label: string; value: number; color: string; progress: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><span className={`flex items-center gap-2 text-sm ${color}`}><Icon className="size-4" />{label}</span><span className="font-semibold text-foreground">{value.toLocaleString("pt-BR")}</span></div>
      <Progress value={Math.min(100, Math.max(0, progress))} className="h-1.5" />
    </div>
  );
}
