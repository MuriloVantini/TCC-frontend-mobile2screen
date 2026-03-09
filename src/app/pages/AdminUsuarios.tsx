import { useEffect, useMemo, useRef, useState } from "react";
import { useGridAnimation } from "../hooks/useGridAnimation";
import { useUsersApi } from "../hooks/api/entities";
import {
  Search,
  Monitor,
  BellRing,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  ShieldOff,
  Tag,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  plan: "free" | "pro" | "enterprise" | "outro";
  devices: number;
  alerts: number;
  deliveryRate: number;
  lastActive: string;
  joined: string;
  status: "active" | "suspended";
  tags: string[];
  role: string;
  planId: number | null;
}

const planConfig = {
  free: { label: "Free", cls: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", cls: "bg-secondary text-primary" },
  enterprise: { label: "Enterprise", cls: "bg-secondary text-primary" },
  outro: { label: "Outro", cls: "bg-muted text-muted-foreground" },
};

const PAGE_SIZE = 5;

const tagColors = ["bg-secondary text-primary", "bg-secondary text-primary", "bg-secondary text-success", "bg-secondary text-warning", "bg-accent text-accent-foreground", "bg-accent text-accent-foreground"];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPlan(value: unknown): User["plan"] {
  if (value === "free" || value === "pro" || value === "enterprise") {
    return value;
  }

  return "outro";
}

function formatRelativeDate(value: unknown): string {
  if (typeof value !== "string") return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `ha ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;

  const days = Math.floor(hours / 24);
  return `ha ${days}d`;
}

function formatJoined(value: unknown): string {
  if (typeof value !== "string") return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

function mapApiUser(resource: Record<string, unknown>, index: number): User {
  const plan = isRecord(resource.plan) ? resource.plan : null;

  return {
    id: typeof resource.id === "number" ? resource.id : index + 1,
    name: typeof resource.name === "string" ? resource.name : `Usuario ${index + 1}`,
    email: typeof resource.email === "string" ? resource.email : "-",
    company: typeof resource.company === "string" ? resource.company : "-",
    plan: toPlan(plan?.name),
    devices: plan && typeof plan.max_devices === "number" ? plan.max_devices : 0,
    alerts: plan && typeof plan.max_alerts_per_month === "number" ? plan.max_alerts_per_month : 0,
    deliveryRate: 0,
    lastActive: formatRelativeDate(resource.last_active),
    joined: formatJoined(resource.joined_at ?? resource.created_at),
    status: resource.status === "suspended" ? "suspended" : "active",
    tags: [],
    role: typeof resource.role === "string" ? resource.role : "user",
    planId: typeof resource.plan_id === "number" ? resource.plan_id : null,
  };
}

export function AdminUsuarios() {
  const usersApi = useMemo(() => useUsersApi(), []);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  useEffect(() => {
    let isMounted = true;

    usersApi
      .list()
      .then((resources) => {
        if (!isMounted) return;
        const mapped = resources.map((resource, index) => mapApiUser(resource as Record<string, unknown>, index));
        setLocalUsers(mapped);
      })
      .catch(() => {
        if (!isMounted) return;
        setLocalUsers([]);
      });

    return () => {
      isMounted = false;
    };
  }, [usersApi]);

  const filtered = localUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !planFilter || u.plan === planFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  useGridAnimation(tbodyRef, { effect: "seket", selector: ":scope > tr", deps: [paginated.map((u) => u.id).join()] });
  useGridAnimation(mobileListRef, { effect: "seket", deps: [paginated.map((u) => u.id).join()] });

  const toggleSuspend = async (id: number) => {
    const targetUser = localUsers.find((user) => user.id === id);
    if (!targetUser) return;

    const nextStatus = targetUser.status === "active" ? "suspended" : "active";

    try {
      await usersApi.update(id, {
        name: targetUser.name,
        email: targetUser.email,
        company: targetUser.company,
        plan_id: targetUser.planId,
        role: targetUser.role,
        status: nextStatus,
      });

      setLocalUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status: nextStatus } : user)));
      if (selected?.id === id) {
        setSelected((current) => (current ? { ...current, status: nextStatus } : null));
      }
    } catch {
      // Keep current status if backend update fails.
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-foreground">Usuários</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{localUsers.length} usuários cadastrados · {localUsers.filter((u) => u.status === "active").length} ativos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Free", count: localUsers.filter((u) => u.plan === "free").length, cls: "text-muted-foreground bg-muted border-border" },
          { label: "Pro", count: localUsers.filter((u) => u.plan === "pro").length, cls: "text-primary bg-accent border-border" },
          { label: "Enterprise", count: localUsers.filter((u) => u.plan === "enterprise").length, cls: "text-primary bg-accent border-border" },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`rounded-2xl border p-3 sm:p-4 text-center ${cls}`}>
            <p className="text-xl font-bold">{count}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Pesquisar usuário, empresa..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm" />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground shadow-sm">
          <option value="">Todos os planos</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground shadow-sm">
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
        </select>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                {["Usuário", "Plano", "Dispositivos", "Alertas", "Taxa", "Último acesso", "Status", "Ações"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody ref={tbodyRef} className="divide-y divide-slate-50">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(u)} className="flex items-center gap-2.5 text-left hover:text-primary group">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-chart-2 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${planConfig[u.plan].cls}`}>{planConfig[u.plan].label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{u.devices}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{u.alerts}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${u.deliveryRate >= 95 ? "text-success" : u.deliveryRate >= 80 ? "text-warning" : "text-destructive"}`}>
                      {u.deliveryRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{u.lastActive}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === "active" ? "bg-secondary text-success" : "bg-destructive/10 text-destructive"}`}>
                      {u.status === "active" ? "Ativo" : "Suspenso"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(u)} className="p-1.5 text-primary hover:bg-accent rounded-lg text-xs">Ver</button>
                      <button onClick={() => toggleSuspend(u.id)} className={`p-1.5 rounded-lg ${u.status === "active" ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-secondary"}`}>
                        {u.status === "active" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg ${page === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div ref={mobileListRef} className="sm:hidden space-y-3">
        {paginated.map((u) => (
          <div key={u.id} className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{u.name}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${planConfig[u.plan].cls}`}>{planConfig[u.plan].label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-secondary text-success" : "bg-destructive/10 text-destructive"}`}>
                    {u.status === "active" ? "Ativo" : "Suspenso"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.company}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {u.devices} disp.</span>
              <span className="flex items-center gap-1"><BellRing className="w-3 h-3" /> {u.alerts} alertas</span>
              <span className={`font-medium ${u.deliveryRate >= 95 ? "text-success" : "text-warning"}`}>{u.deliveryRate}%</span>
              <div className="flex gap-1">
                <button onClick={() => setSelected(u)} className="px-2 py-1 bg-accent text-primary rounded-lg text-xs">Ver</button>
                <button onClick={() => toggleSuspend(u.id)} className={`p-1.5 rounded-lg ${u.status === "active" ? "text-destructive bg-destructive/10" : "text-success bg-secondary"}`}>
                  {u.status === "active" ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground disabled:opacity-40">
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary to-chart-2 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planConfig[selected.plan].cls}`}>{planConfig[selected.plan].label}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${selected.status === "active" ? "bg-secondary text-success" : "bg-destructive/10 text-destructive"}`}>
                  {selected.status === "active" ? "Ativo" : "Suspenso"}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{selected.company}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-accent rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-primary">{selected.devices}</p>
                  <p className="text-xs text-primary">Dispositivos</p>
                </div>
                <div className="bg-accent rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-primary">{selected.alerts}</p>
                  <p className="text-xs text-primary">Alertas</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${selected.deliveryRate >= 95 ? "bg-secondary" : "bg-secondary"}`}>
                  <p className={`text-lg font-bold ${selected.deliveryRate >= 95 ? "text-success" : "text-warning"}`}>{selected.deliveryRate}%</p>
                  <p className={`text-xs ${selected.deliveryRate >= 95 ? "text-success" : "text-warning"}`}>Taxa</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags utilizadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2 bg-muted rounded-xl p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cadastrado em</span>
                  <span className="font-medium">{selected.joined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último acesso</span>
                  <span className="font-medium">{selected.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <button onClick={() => toggleSuspend(selected.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selected.status === "active"
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-secondary text-success hover:bg-secondary/80"
                }`}
              >
                {selected.status === "active" ? <><ShieldOff className="w-4 h-4" /> Suspender</> : <><Shield className="w-4 h-4" /> Reativar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}