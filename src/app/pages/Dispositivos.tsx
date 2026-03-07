import { useState, useRef, useEffect } from "react";
import { useGridAnimation } from "../hooks/useGridAnimation";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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

function DeviceIcon({ type, size = "md" }: { type: DeviceType; size?: "sm" | "md" }) {
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
  const deviceRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pendingEnterId = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<{ name: string; type: DeviceType; location: string; tags: string[] }>({
    name: "", type: "tv", location: "", tags: [],
  });

  const allTags = Array.from(new Set(devices.flatMap((d) => d.tags)));

  useEffect(() => {
    if (pendingEnterId.current === null) return;
    const el = deviceRefs.current[pendingEnterId.current];
    if (!el) {
      pendingEnterId.current = null;
      return;
    }

    pendingEnterId.current = null;
  }, [devices]);

  const filtered = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || d.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  useGridAnimation(gridRef, { effect: "hapi", deps: [filtered.map((d) => d.id).join()] });

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
      pendingEnterId.current = id;
      setDevices((prev) => [...prev, { id, name: form.name, type: form.type, location: form.location, tags: form.tags, online: false, lastSeen: "nunca", ip: `192.168.1.${100 + id}` }]);
      showFeedback({ type: "success", msg: "Dispositivo cadastrado! Aguardando conexão." });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm(null);

    setDevices((prev) => prev.filter((d) => d.id !== id));
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
        <Button onClick={openNew} className="self-start sm:self-auto rounded-xl">
          <Plus className="w-4 h-4" /> Adicionar Dispositivo
        </Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.type === "success" ? "default" : "destructive"} className={feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertDescription>{feedback.msg}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar dispositivo..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={filterTag} onValueChange={(v) => setFilterTag(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <Tag className="w-4 h-4 text-slate-400" />
            <SelectValue placeholder="Todas as tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tags</SelectItem>
            {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Device Grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((device) => (
          <div
            key={device.id}
            ref={(el) => {
              deviceRefs.current[device.id] = el;
            }}
            className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${device.online ? "border-slate-100" : "border-slate-100 opacity-80"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <DeviceIcon type={device.type} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{device.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{device.type === "tv" ? "Television" : "Raspberry Pi"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(device)} className="size-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(device.id)} className="size-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {device.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={`rounded-full text-[11px] border-0 font-medium ${getTagColor(tag)}`}>{tag}</Badge>
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
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh] gap-0 p-0">
          <DialogHeader className="px-5 py-4 border-b border-slate-100">
            <DialogTitle className="text-slate-800">{editingId ? "Editar Dispositivo" : "Novo Dispositivo"}</DialogTitle>
          </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <Label className="text-slate-600 mb-2">Tipo de dispositivo</Label>
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
                      <DeviceIcon type={t} />
                      <span className="font-medium">{t === "tv" ? "Television" : "Raspberry Pi"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Nome do dispositivo <span className="text-red-500">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: TV Sala de Reunião B"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Localização</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: 2º Andar, Ala Norte"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="text-slate-600 mb-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags de segmentação
                </Label>
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

          <DialogFooter className="px-5 py-4 border-t border-slate-100 sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl">
              {editingId ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-sm text-center">
          <AlertDialogHeader className="items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              O dispositivo perderá a conexão e não receberá mais alertas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm !== null && void handleDelete(deleteConfirm)}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
