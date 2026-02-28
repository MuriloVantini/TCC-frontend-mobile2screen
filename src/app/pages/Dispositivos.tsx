import { useState, useRef } from "react";
import {
  Plus,
  Monitor,
  Search,
  Edit2,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Tag,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  CircuitBoard,
} from "lucide-react";

type DeviceType = "tv" | "rpi";

interface Device {
  id: number;
  name: string;
  type: DeviceType;
  location: string;
  tags: string[];
  online: boolean;
  lastSeen: string;
  ip: string;
}

const initialDevices: Device[] = [
  { id: 1, name: "TV Recepção Principal", type: "tv", location: "Térreo", tags: ["recepcao", "todos"], online: true, lastSeen: "agora", ip: "192.168.1.101" },
  { id: 2, name: "RPi Sala Reunião A", type: "rpi", location: "2º Andar", tags: ["sala-reuniao", "diretoria"], online: true, lastSeen: "há 2 min", ip: "192.168.1.102" },
  { id: 3, name: "TV Produção Linha 1", type: "tv", location: "Galpão", tags: ["producao", "seguranca"], online: false, lastSeen: "há 3h", ip: "192.168.1.103" },
  { id: 4, name: "TV RH", type: "tv", location: "3º Andar", tags: ["rh", "todos"], online: true, lastSeen: "há 1 min", ip: "192.168.1.104" },
  { id: 5, name: "RPi Portaria", type: "rpi", location: "Entrada", tags: ["portaria", "seguranca", "todos"], online: true, lastSeen: "agora", ip: "192.168.1.105" },
  { id: 6, name: "TV Refeitório", type: "tv", location: "Subsolo", tags: ["refeitorio", "todos"], online: false, lastSeen: "há 1 dia", ip: "192.168.1.106" },
];

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

type Feedback = { type: "success" | "error"; msg: string } | null;

function DeviceIcon({ type, online, size = "md" }: { type: DeviceType; online: boolean; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  if (type === "tv") return <Monitor className={s} />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="7" cy="7" r="1.5" />
      <circle cx="17" cy="7" r="1.5" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </svg>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl bg-slate-50 min-h-[44px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:opacity-70">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === "," || e.key === " ") && input.trim()) {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tags.length) removeTag(tags[tags.length - 1]);
        }}
        placeholder={tags.length === 0 ? "Digite uma tag e pressione Enter..." : ""}
        className="flex-1 min-w-24 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
      />
    </div>
  );
}

export function Dispositivos() {
  const [devices, setDevices] = useState(initialDevices);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [form, setForm] = useState<{ name: string; type: DeviceType; location: string; tags: string[] }>({
    name: "", type: "tv", location: "", tags: [],
  });

  const allTags = Array.from(new Set(devices.flatMap((d) => d.tags)));

  const filtered = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || d.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  const openNew = () => {
    setForm({ name: "", type: "tv", location: "", tags: [] });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (d: Device) => {
    setForm({ name: d.name, type: d.type, location: d.location, tags: [...d.tags] });
    setEditingId(d.id);
    setShowModal(true);
  };

  const showFeedback = (feedback: Feedback) => {
    setFeedback(feedback);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = () => {
    if (!form.name) { showFeedback({ type: "error", msg: "O nome do dispositivo é obrigatório." }); return; }
    if (editingId !== null) {
      setDevices((prev) => prev.map((d) => d.id === editingId ? { ...d, name: form.name, type: form.type, location: form.location, tags: form.tags } : d));
      showFeedback({ type: "success", msg: "Dispositivo atualizado com sucesso!" });
    } else {
      const id = Math.max(0, ...devices.map((d) => d.id)) + 1;
      setDevices((prev) => [...prev, { id, name: form.name, type: form.type, location: form.location, tags: form.tags, online: false, lastSeen: "nunca", ip: `192.168.1.${100 + id}` }]);
      showFeedback({ type: "success", msg: "Dispositivo cadastrado! Aguardando conexão." });
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setDeleteConfirm(null);
    showFeedback({ type: "success", msg: "Dispositivo removido." });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-800">Meus Dispositivos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {devices.filter((d) => d.online).length} online · {devices.filter((d) => !d.online).length} offline · {devices.length} total
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto shadow-sm">
          <Plus className="w-4 h-4" /> Adicionar Dispositivo
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${feedback.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar dispositivo..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm text-slate-600">
            <option value="">Todas as tags</option>
            {allTags.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((device) => (
          <div key={device.id} className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${device.online ? "border-slate-100" : "border-slate-100 opacity-80"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <DeviceIcon type={device.type} online={device.online} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{device.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{device.type === "tv" ? "Television" : "Raspberry Pi"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(device)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(device.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {device.tags.map((tag) => (
                <span key={tag} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}>{tag}</span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className={`flex items-center gap-1.5 ${device.online ? "text-emerald-600" : "text-slate-400"}`}>
                {device.online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{device.online ? "Online" : "Offline"}</span>
              </div>
              <span className="text-slate-400">{device.ip}</span>
              <span className="text-slate-400">{device.lastSeen}</span>
            </div>
          </div>
        ))}

        {/* Add device card */}
        <button onClick={openNew} className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all min-h-[160px]">
          <div className="w-10 h-10 border-2 border-current rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">Adicionar dispositivo</p>
        </button>
      </div>

      {filtered.length === 0 && search && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
          Nenhum dispositivo encontrado para "{search}"
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-800">{editingId ? "Editar Dispositivo" : "Novo Dispositivo"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Tipo de dispositivo</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["tv", "rpi"] as DeviceType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex items-center gap-2.5 p-3.5 border-2 rounded-xl text-sm transition-all ${
                        form.type === t ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <DeviceIcon type={t} online={true} />
                      <span className="font-medium">{t === "tv" ? "Television" : "Raspberry Pi"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600 mb-1.5 block">Nome do dispositivo <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: TV Sala de Reunião B"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600 mb-1.5 block">Localização</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: 2º Andar, Ala Norte"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600 mb-1.5 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags de segmentação
                </label>
                <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
                <p className="text-xs text-slate-400 mt-1.5">Digite e pressione Enter para adicionar. As tags agrupam os dispositivos para envio de alertas.</p>
              </div>

              {!editingId && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                  <p className="font-medium mb-1">Como conectar</p>
                  <p className="text-xs text-blue-600">Após cadastrar, acesse <code className="bg-blue-100 px-1 py-0.5 rounded">alertatv.io/connect</code> no dispositivo e insira o código de pareamento.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                {editingId ? "Salvar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-slate-800 mb-2">Remover dispositivo?</h3>
            <p className="text-slate-500 text-sm">O dispositivo perderá a conexão e não receberá mais alertas.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
