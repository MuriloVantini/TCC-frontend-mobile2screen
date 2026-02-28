import { useState } from "react";
import {
  BarChart2,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
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
} from "recharts";

const reportData = [
  { id: 1, codigo: "REL-001", titulo: "Levantamento Zona Norte", categoria: "Ambiental", periodo: "Jan/2026", status: "Concluído", registros: 142 },
  { id: 2, codigo: "REL-002", titulo: "Mapeamento Comercial Centro", categoria: "Comercial", periodo: "Jan/2026", status: "Concluído", registros: 89 },
  { id: 3, codigo: "REL-003", titulo: "Infraestrutura Hídrica", categoria: "Infraestrutura", periodo: "Fev/2026", status: "Em Andamento", registros: 56 },
  { id: 4, codigo: "REL-004", titulo: "Diagnóstico Rural Setor Oeste", categoria: "Rural", periodo: "Fev/2026", status: "Pendente", registros: 203 },
  { id: 5, codigo: "REL-005", titulo: "Análise Residencial Sul", categoria: "Residencial", periodo: "Fev/2026", status: "Concluído", registros: 178 },
  { id: 6, codigo: "REL-006", titulo: "Monitoramento Ambiental", categoria: "Ambiental", periodo: "Mar/2026", status: "Em Andamento", registros: 64 },
  { id: 7, codigo: "REL-007", titulo: "Cadastro Industrial Norte", categoria: "Comercial", periodo: "Mar/2026", status: "Pendente", registros: 31 },
  { id: 8, codigo: "REL-008", titulo: "Revisão de Lotes Rurais", categoria: "Rural", periodo: "Dez/2025", status: "Concluído", registros: 297 },
];

const barData = [
  { mes: "Set", registros: 195 },
  { mes: "Out", registros: 230 },
  { mes: "Nov", registros: 280 },
  { mes: "Dez", registros: 310 },
  { mes: "Jan", registros: 350 },
  { mes: "Fev", registros: 410 },
];

const pieData = [
  { name: "Ambiental", value: 35, color: "#10b981" },
  { name: "Comercial", value: 25, color: "#2563eb" },
  { name: "Residencial", value: 20, color: "#8b5cf6" },
  { name: "Rural", value: 12, color: "#f59e0b" },
  { name: "Infraestrutura", value: 8, color: "#06b6d4" },
];

const statusBadge: Record<string, string> = {
  "Concluído": "bg-emerald-100 text-emerald-700",
  "Em Andamento": "bg-blue-100 text-blue-700",
  "Pendente": "bg-amber-100 text-amber-700",
};

const PAGE_SIZE = 5;

const summaryMetrics = [
  { label: "Total de Relatórios", value: "8", icon: FileText, change: "+3", up: true, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Registros Totais", value: "1.060", icon: BarChart2, change: "+18,4%", up: true, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Concluídos", value: "4", icon: TrendingUp, change: "50%", up: null, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Em Andamento", value: "2", icon: Minus, change: "25%", up: null, color: "text-amber-600", bg: "bg-amber-50" },
];

export function Relatorios() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);

  const filtered = reportData.filter((r) => {
    const matchSearch = r.titulo.toLowerCase().includes(search.toLowerCase()) || r.codigo.toLowerCase().includes(search.toLowerCase());
    const matchPeriodo = !periodo || r.periodo === periodo;
    const matchCat = !categoria || r.categoria === categoria;
    return matchSearch && matchPeriodo && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Relatórios</h1>
          <p className="text-gray-500 text-sm mt-0.5">Análise e exportação de dados</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span> PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryMetrics.map(({ label, value, icon: Icon, change, up, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{label}</p>
            <span className={`text-xs mt-1 inline-block font-medium ${up === true ? "text-emerald-600" : up === false ? "text-red-500" : "text-gray-500"}`}>
              {up === true && <TrendingUp className="w-3 h-3 inline mr-0.5" />}
              {up === false && <TrendingDown className="w-3 h-3 inline mr-0.5" />}
              {change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h3 className="text-gray-800 mb-1">Volume de Registros</h3>
          <p className="text-gray-500 text-xs mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="registros" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h3 className="text-gray-800 mb-1">Por Categoria</h3>
          <p className="text-gray-500 text-xs mb-4">Distribuição percentual</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Pesquisar relatório..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={periodo}
              onChange={(e) => { setPeriodo(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">Todos os períodos</option>
              {["Dez/2025", "Jan/2026", "Fev/2026", "Mar/2026"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={categoria}
              onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">Todas as categorias</option>
              {["Ambiental", "Comercial", "Residencial", "Rural", "Infraestrutura"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Período</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Registros</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{r.codigo}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{r.titulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.categoria}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.periodo}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{r.registros}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Baixar PDF">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Exportar Excel">
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">Nenhum relatório encontrado.</div>
          )}
        </div>

        {/* Cards Mobile */}
        <div className="sm:hidden divide-y divide-gray-100">
          {paginated.map((r) => (
            <div key={r.id} className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-gray-800">{r.titulo}</p>
                <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{r.codigo} · {r.categoria} · {r.periodo}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{r.registros} registros</span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">Nenhum relatório encontrado.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                    page === p ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
