import { useState, useRef } from "react";
import { useGridAnimation } from "../hooks/useGridAnimation";
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
  plan: "free" | "pro" | "enterprise";
  devices: number;
  alerts: number;
  deliveryRate: number;
  lastActive: string;
  joined: string;
  status: "active" | "suspended";
  tags: string[];
}

const users: User[] = [
  { id: 1, name: "João Silva", email: "joao@empresa.com.br", company: "Empresa Ltda", plan: "pro", devices: 6, alerts: 82, deliveryRate: 97, lastActive: "há 5 min", joined: "Jan/2026", status: "active", tags: ["recepcao", "producao", "ti"] },
  { id: 2, name: "Maria Oliveira", email: "maria@fabrica.com.br", company: "Fábrica XYZ", plan: "enterprise", devices: 12, alerts: 145, deliveryRate: 100, lastActive: "há 2 min", joined: "Dez/2025", status: "active", tags: ["linha1", "seguranca", "rh", "gestao"] },
  { id: 3, name: "Carlos Santos", email: "carlos@hospital.com.br", company: "Hospital Municipal", plan: "enterprise", devices: 8, alerts: 67, deliveryRate: 89, lastActive: "há 1h", joined: "Nov/2025", status: "active", tags: ["emergencia", "ti", "recepcao"] },
  { id: 4, name: "Ana Ferreira", email: "ana@escola.gov.br", company: "Escola Estadual", plan: "free", devices: 4, alerts: 38, deliveryRate: 95, lastActive: "ontem", joined: "Fev/2026", status: "active", tags: ["sala1", "direcao"] },
  { id: 5, name: "Pedro Costa", email: "pedro@varejo.com.br", company: "Varejo S.A.", plan: "pro", devices: 9, alerts: 112, deliveryRate: 98, lastActive: "há 3h", joined: "Out/2025", status: "active", tags: ["atendimento", "estoque", "gerencia"] },
  { id: 6, name: "Luiza Pereira", email: "luiza@hotel.com.br", company: "Hotel Palace", plan: "pro", devices: 7, alerts: 54, deliveryRate: 92, lastActive: "há 2 dias", joined: "Jan/2026", status: "suspended", tags: ["recepcao", "restaurante"] },
  { id: 7, name: "Ricardo Lima", email: "ricardo@startup.com", company: "Startup Tech", plan: "free", devices: 2, alerts: 15, deliveryRate: 100, lastActive: "há 4 dias", joined: "Fev/2026", status: "active", tags: ["escritorio"] },
  { id: 8, name: "Fernanda Souza", email: "fern@industria.com.br", company: "Indústria BR", plan: "enterprise", devices: 18, alerts: 203, deliveryRate: 96, lastActive: "agora", joined: "Set/2025", status: "active", tags: ["planta1", "planta2", "seguranca", "rh", "gestao"] },
];

const planConfig = {
  free: { label: "Free", cls: "bg-slate-100 text-slate-600" },
  pro: { label: "Pro", cls: "bg-blue-100 text-blue-700" },
  enterprise: { label: "Enterprise", cls: "bg-violet-100 text-violet-700" },
};

const PAGE_SIZE = 5;

const tagColors = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

export function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [localUsers, setLocalUsers] = useState(users);

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

  useGridAnimation(tbodyRef, { effect: "ra", selector: ":scope > tr", deps: [paginated.map((u) => u.id).join()] });
  useGridAnimation(mobileListRef, { effect: "ra", deps: [paginated.map((u) => u.id).join()] });

  const toggleSuspend = (id: number) => {
    setLocalUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status: s.status === "active" ? "suspended" : "active" } : null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-slate-800">Usuários</h1>
        <p className="text-slate-500 text-sm mt-0.5">{localUsers.length} usuários cadastrados · {localUsers.filter((u) => u.status === "active").length} ativos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Free", count: localUsers.filter((u) => u.plan === "free").length, cls: "text-slate-600 bg-slate-50 border-slate-200" },
          { label: "Pro", count: localUsers.filter((u) => u.plan === "pro").length, cls: "text-blue-600 bg-blue-50 border-blue-200" },
          { label: "Enterprise", count: localUsers.filter((u) => u.plan === "enterprise").length, cls: "text-violet-600 bg-violet-50 border-violet-200" },
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Pesquisar usuário, empresa..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 shadow-sm">
          <option value="">Todos os planos</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 shadow-sm">
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
        </select>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Usuário", "Plano", "Dispositivos", "Alertas", "Taxa", "Último acesso", "Status", "Ações"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody ref={tbodyRef} className="divide-y divide-slate-50">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(u)} className="flex items-center gap-2.5 text-left hover:text-blue-600 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${planConfig[u.plan].cls}`}>{planConfig[u.plan].label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{u.devices}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{u.alerts}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${u.deliveryRate >= 95 ? "text-emerald-600" : u.deliveryRate >= 80 ? "text-amber-600" : "text-red-500"}`}>
                      {u.deliveryRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{u.lastActive}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {u.status === "active" ? "Ativo" : "Suspenso"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs">Ver</button>
                      <button onClick={() => toggleSuspend(u.id)} className={`p-1.5 rounded-lg ${u.status === "active" ? "text-red-400 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50"}`}>
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
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-400">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg ${page === p ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div ref={mobileListRef} className="sm:hidden space-y-3">
        {paginated.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${planConfig[u.plan].cls}`}>{planConfig[u.plan].label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {u.status === "active" ? "Ativo" : "Suspenso"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                <p className="text-xs text-slate-500 truncate">{u.company}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {u.devices} disp.</span>
              <span className="flex items-center gap-1"><BellRing className="w-3 h-3" /> {u.alerts} alertas</span>
              <span className={`font-medium ${u.deliveryRate >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{u.deliveryRate}%</span>
              <div className="flex gap-1">
                <button onClick={() => setSelected(u)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">Ver</button>
                <button onClick={() => toggleSuspend(u.id)} className={`p-1.5 rounded-lg ${u.status === "active" ? "text-red-400 bg-red-50" : "text-emerald-500 bg-emerald-50"}`}>
                  {u.status === "active" ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-slate-400">{page}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40">
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planConfig[selected.plan].cls}`}>{planConfig[selected.plan].label}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${selected.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {selected.status === "active" ? "Ativo" : "Suspenso"}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{selected.company}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{selected.devices}</p>
                  <p className="text-xs text-blue-600">Dispositivos</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-violet-700">{selected.alerts}</p>
                  <p className="text-xs text-violet-600">Alertas</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${selected.deliveryRate >= 95 ? "bg-emerald-50" : "bg-amber-50"}`}>
                  <p className={`text-lg font-bold ${selected.deliveryRate >= 95 ? "text-emerald-700" : "text-amber-700"}`}>{selected.deliveryRate}%</p>
                  <p className={`text-xs ${selected.deliveryRate >= 95 ? "text-emerald-600" : "text-amber-600"}`}>Taxa</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags utilizadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-2 bg-slate-50 rounded-xl p-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cadastrado em</span>
                  <span className="font-medium">{selected.joined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Último acesso</span>
                  <span className="font-medium">{selected.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => toggleSuspend(selected.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selected.status === "active"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
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