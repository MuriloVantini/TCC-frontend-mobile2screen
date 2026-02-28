import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Upload,
  MapPin,
} from "lucide-react";

const initialRecords = [
  { id: 1, nome: "Lote Comercial Centro", tipo: "Comercial", zona: "Zona Central", area: "450m²", status: "Ativo", data: "2026-01-15" },
  { id: 2, nome: "Área Verde Setor Norte", tipo: "Ambiental", zona: "Zona Norte", area: "2.300m²", status: "Ativo", data: "2026-01-22" },
  { id: 3, nome: "Edifício Res. Alvorada", tipo: "Residencial", zona: "Zona Sul", area: "1.200m²", status: "Pendente", data: "2026-02-03" },
  { id: 4, nome: "Est. Energia Setor Leste", tipo: "Infraestrutura", zona: "Zona Leste", area: "320m²", status: "Ativo", data: "2026-02-10" },
  { id: 5, nome: "Reservatório Municipal", tipo: "Ambiental", zona: "Zona Oeste", area: "800m²", status: "Ativo", data: "2026-02-18" },
  { id: 6, nome: "Parque Ecológico Central", tipo: "Ambiental", zona: "Zona Central", area: "8.500m²", status: "Inativo", data: "2025-12-05" },
];

const tipoOptions = ["Comercial", "Residencial", "Ambiental", "Infraestrutura", "Rural"];
const zonaOptions = ["Zona Central", "Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste"];
const statusOptions = ["Ativo", "Inativo", "Pendente"];

const statusBadge: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Inativo: "bg-gray-100 text-gray-500",
  Pendente: "bg-amber-100 text-amber-700",
};

type Feedback = { type: "success" | "error"; message: string } | null;

export function Cadastros() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    zona: "",
    area: "",
    status: "Ativo",
    data: new Date().toISOString().split("T")[0],
  });

  const filtered = records.filter(
    (r) =>
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm({ nome: "", tipo: "", zona: "", area: "", status: "Ativo", data: new Date().toISOString().split("T")[0] });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (record: typeof records[0]) => {
    setForm({ nome: record.nome, tipo: record.tipo, zona: record.zona, area: record.area, status: record.status, data: record.data });
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.tipo || !form.zona) {
      setFeedback({ type: "error", message: "Preencha todos os campos obrigatórios." });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (editingId !== null) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form } : r))
      );
      setFeedback({ type: "success", message: "Registro atualizado com sucesso!" });
    } else {
      const newId = Math.max(...records.map((r) => r.id)) + 1;
      setRecords((prev) => [...prev, { id: newId, ...form }]);
      setFeedback({ type: "success", message: "Registro cadastrado com sucesso!" });
    }
    setShowModal(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
    setFeedback({ type: "success", message: "Registro excluído com sucesso." });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Cadastros</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} registros no total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cadastro
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou tipo..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Zona</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Área</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{record.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.tipo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.zona}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.area}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{record.data}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(record)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(record.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.map((record) => (
          <div key={record.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{record.nome}</p>
                <p className="text-xs text-gray-500 mt-0.5">{record.tipo} · {record.zona}</p>
              </div>
              <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[record.status]}`}>
                {record.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {record.area}
                </span>
                <span>{record.data}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(record.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-100 shadow-sm">
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-800">{editingId ? "Editar Registro" : "Novo Cadastro"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Section: Identificação */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Identificação</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome do registro"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block">
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.tipo}
                          onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Selecione</option>
                          {tipoOptions.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block">
                        Zona <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.zona}
                          onChange={(e) => setForm((f) => ({ ...f, zona: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Selecione</option>
                          {zonaOptions.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Dados */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 mt-1">Dados Complementares</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block">Área</label>
                      <input
                        value={form.area}
                        onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                        placeholder="Ex: 450m²"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block">Data</label>
                      <input
                        type="date"
                        value={form.data}
                        onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Status</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        {statusOptions.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Arquivos</p>
                <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Clique para anexar arquivos</span>
                  <span className="text-xs text-gray-400">PDF, KML, SHP, JPG (máx. 10MB)</span>
                  <input type="file" className="hidden" multiple />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editingId ? "Salvar Alterações" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-gray-800 mb-2">Excluir registro?</h3>
              <p className="text-gray-500 text-sm">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
