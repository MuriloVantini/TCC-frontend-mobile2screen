import { Link } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../components/ui/chart";
import { useAlertsApi, useDevicesApi, useStatisticsApi } from "../hooks/api/entities";
import { useUserContext } from "../contexts/UserContextProvider";

type DashboardDevice = {
  id: number;
  name: string;
  type: "tv" | "rpi";
  online: boolean;
  tags: string[];
};

type DashboardAlert = {
  id: number;
  title: string;
  type: "info" | "warning" | "critical" | "success";
  tags: string[];
  devices: number;
  status: "delivered" | "failed";
  time: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toAlertType(value: unknown): DashboardAlert["type"] {
  if (value === "warning" || value === "critical" || value === "success") {
    return value;
  }

  return "info";
}

function relativeTime(value: unknown): string {
  if (typeof value !== "string") return "agora";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "agora";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `ha ${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `ha ${hours}h`;

  const days = Math.floor(hours / 24);
  return `ha ${days}d`;
}

function formatDay(value: unknown, index: number): string {
  if (typeof value !== "string") return `D${index + 1}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `D${index + 1}`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function extractTagNames(source: unknown): string[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((tag) => {
      if (isRecord(tag) && typeof tag.name === "string") return tag.name;
      return null;
    })
    .filter((tag): tag is string => typeof tag === "string");
}

const alertTypeConfig = {
  info: { icon: Info, color: "text-primary", bg: "bg-secondary", label: "Info" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-secondary", label: "Aviso" },
  critical: { icon: Zap, color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" },
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-secondary", label: "Sucesso" },
};

const activityChartConfig = {
  alertas: { label: "Alertas", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const tagColors = [
  "bg-secondary text-primary",
  "bg-secondary text-primary",
  "bg-secondary text-success",
  "bg-secondary text-warning",
  "bg-accent text-accent-foreground",
  "bg-accent text-accent-foreground",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

export function Dashboard() {
  const devicesApi = useMemo(() => useDevicesApi(), []);
  const alertsApi = useMemo(() => useAlertsApi(), []);
  const statisticsApi = useMemo(() => useStatisticsApi(), []);
  const { user } = useUserContext();
  const [devices, setDevices] = useState<DashboardDevice[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<DashboardAlert[]>([]);
  const [activityData, setActivityData] = useState<Array<{ hora: string; alertas: number }>>([]);
  const [alertsToday, setAlertsToday] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(0);
  const onlineCount = devices.filter((d) => d.online).length;
  const offlineCount = devices.length - onlineCount;
  const displayName = user?.name ?? "Usuario";
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [devicesResult, alertsResult, dailyResult, dashboardResult] = await Promise.allSettled([
        devicesApi.latest(),
        alertsApi.list(),
        statisticsApi.daily(),
        statisticsApi.dashboard(),
      ]);

      if (!isMounted) return;

      if (devicesResult.status === "fulfilled") {
        const mapped: DashboardDevice[] = devicesResult.value.map((resource, index) => {
          const type: DashboardDevice["type"] = resource.type === "rpi" ? "rpi" : "tv";

          return {
            id: toNumber(resource.id, index + 1),
            name: typeof resource.name === "string" ? resource.name : `Dispositivo ${index + 1}`,
            type,
            online: Boolean(resource.is_online),
            tags: extractTagNames(resource.tags),
          };
        });
        setDevices(mapped);
      }

      if (alertsResult.status === "fulfilled") {
        const mapped = alertsResult.value.items.slice(0, 8).map((alert, index) => {
          const deliveries = Array.isArray(alert.deliveries) ? alert.deliveries : [];
          const failedCount = deliveries.filter((delivery) => isRecord(delivery) && delivery.status === "failed").length;

          return {
            id: toNumber(alert.id, index + 1),
            title: typeof alert.title === "string" ? alert.title : `Alerta ${index + 1}`,
            type: toAlertType(alert.type),
            tags: extractTagNames(alert.tags),
            devices: deliveries.length,
            status: failedCount > 0 ? "failed" : "delivered",
            time: relativeTime(alert.sent_at ?? alert.created_at),
          } satisfies DashboardAlert;
        });
        setRecentAlerts(mapped);
      }

      if (dailyResult.status === "fulfilled") {
        const mapped = dailyResult.value.slice(-10).map((item, index) => ({
          hora: formatDay(item.date, index),
          alertas: toNumber(item.alerts_sent),
        }));
        setActivityData(mapped);
      }

      if (dashboardResult.status === "fulfilled") {
        const dashboard = dashboardResult.value;
        const alerts = isRecord(dashboard.alerts) ? dashboard.alerts : {};
        const deliveries = isRecord(dashboard.deliveries) ? dashboard.deliveries : {};
        setAlertsToday(toNumber(alerts.today));
        setDeliveryRate(toNumber(deliveries.delivery_rate));
      }
    };

    load().catch(() => {
      if (!isMounted) return;
      setDevices([]);
      setRecentAlerts([]);
      setActivityData([]);
    });

    return () => {
      isMounted = false;
    };
  }, [devicesApi, alertsApi, statisticsApi]);

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
      <div className="bg-gradient-to-r from-primary to-chart-2 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-primary/20">
        <div>
          <p className="text-primary-foreground/80 text-sm">Bem-vindo de volta,</p>
          <h1 className="text-white text-xl mt-0.5">{displayName} 👋</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">{devices.length} dispositivos · {onlineCount} online</p>
        </div>
        <Link
          to="/app/enviar"
          className="flex items-center gap-2 bg-card text-primary hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 shadow-sm"
        >
          <BellRing className="w-4 h-4" />
          Enviar Alerta
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics */}
      <div ref={metricsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Dispositivos", numericValue: devices.length, suffix: "", sub: `${onlineCount} online`, icon: Monitor, color: "text-primary", bg: "bg-accent" },
          { label: "Online agora", numericValue: onlineCount, suffix: "", sub: `${offlineCount} offline`, icon: Wifi, color: "text-success", bg: "bg-secondary" },
          { label: "Alertas hoje", numericValue: alertsToday, suffix: "", sub: "dados do backend", icon: BellRing, color: "text-primary", bg: "bg-accent" },
          { label: "Entregues", numericValue: deliveryRate, suffix: "%", sub: "taxa de entrega", icon: CheckCircle2, color: "text-warning", bg: "bg-secondary" },
        ].map(({ label, numericValue, suffix, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <AnimatedCounter value={numericValue} suffix={suffix} />
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className={`text-xs mt-1 ${color}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity chart */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground">Atividade de hoje</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Alertas enviados por dia</p>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Ultimos dias
            </span>
          </div>
          <ChartContainer config={activityChartConfig} className="h-48 w-full aspect-auto">
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-alertas)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-alertas)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area type="monotone" dataKey="alertas" stroke="var(--color-alertas)" fill="url(#grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Devices status */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Dispositivos</h3>
            <Link to="/app/dispositivos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${d.online ? "bg-secondary" : "bg-muted"}`}>
                  {d.type === "tv" ? (
                    <Monitor className={`w-4 h-4 ${d.online ? "text-success" : "text-muted-foreground"}`} />
                  ) : (
                    <div className={`w-4 h-4 flex items-center justify-center ${d.online ? "text-success" : "text-muted-foreground"}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" />
                        <circle cx="7" cy="8" r="1.5" />
                        <circle cx="17" cy="8" r="1.5" />
                        <circle cx="7" cy="16" r="1.5" />
                        <circle cx="17" cy="16" r="1.5" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{d.name}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {d.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={`flex items-center gap-1 shrink-0 ${d.online ? "text-success" : "text-muted-foreground"}`}>
                  {d.online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-foreground">Alertas Recentes</h3>
          <Link to="/app/historico" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Ver histórico <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentAlerts.map((alert) => {
            const cfg = alertTypeConfig[alert.type as keyof typeof alertTypeConfig];
            const AlertIcon = cfg.icon;
            return (
              <div key={alert.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                  <AlertIcon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{alert.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    {alert.status === "delivered" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">{alert.devices} {alert.devices === 1 ? "dispositivo" : "dispositivos"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
