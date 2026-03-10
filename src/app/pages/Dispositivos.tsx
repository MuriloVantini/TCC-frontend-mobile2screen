import { useState, useRef, useEffect, useMemo } from "react";
import { useGridAnimation } from "../hooks/useGridAnimation";
import type { Device, DeviceType } from "../interfaces/types/device";
import { useDevicesApi, useTagsApi } from "../hooks/api/entities";
import {
  Plus,
  Monitor,
  Search,
  Edit2,
  Trash2,
  Wifi,
  WifiOff,
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
import { ComboboxChips } from "../components/ui/combobox-chips";

const tagColors = [
  "bg-secondary text-primary",
  "bg-secondary text-primary",
  "bg-secondary text-success",
  "bg-secondary text-warning",
  "bg-accent text-accent-foreground",
  "bg-accent text-accent-foreground",
  "bg-accent text-accent-foreground",
  "bg-accent text-accent-foreground",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

type Feedback = { type: "success" | "error"; msg: string } | null;
type TagOption = { id: number; name: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractTagNames(source: unknown): string[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => (isRecord(item) && typeof item.name === "string" ? item.name : null))
    .filter((item): item is string => typeof item === "string");
}

function mapTagResource(resource: Record<string, unknown>, index: number): TagOption | null {
  const id = typeof resource.id === "number" ? resource.id : index + 1;
  const name = typeof resource.name === "string" ? resource.name.trim() : "";

  if (!name) return null;

  return { id, name };
}

function mapApiDevice(resource: Record<string, unknown>, index: number): Device {
  return {
    id: typeof resource.id === "number" ? resource.id : index + 1,
    name: typeof resource.name === "string" ? resource.name : `Dispositivo ${index + 1}`,
    type: resource.type === "rpi" ? "rpi" : "tv",
    online: Boolean(resource.is_online),
    tags: extractTagNames(resource.tags),
    location: typeof resource.location === "string" ? resource.location : "",
    lastSeen: typeof resource.last_seen === "string" ? resource.last_seen : "nunca",
    ip: typeof resource.ip_address === "string" ? resource.ip_address : "-",
  };
}

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

export function Dispositivos() {
  const devicesApi = useMemo(() => useDevicesApi(), []);
  const tagsApi = useMemo(() => useTagsApi(), []);
  const [devices, setDevices] = useState<Device[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTagNames, setEditingTagNames] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const deviceRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pendingEnterId = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<{ name: string; type: DeviceType; location: string; tagIds: number[] }>({
    name: "", type: "tv", location: "", tagIds: [],
  });

  const loadDevices = async () => {
    const resources = await devicesApi.list();
    const mapped = resources.map((resource, index) => mapApiDevice(resource as Record<string, unknown>, index));
    setDevices(mapped);
  };

  const loadTags = async () => {
    const resources = await tagsApi.list();
    const mapped = resources
      .map((resource, index) => mapTagResource(resource as Record<string, unknown>, index))
      .filter((tag): tag is TagOption => tag !== null);

    setAvailableTags(mapped);
  };

  useEffect(() => {
    Promise.allSettled([loadDevices(), loadTags()]).then((results) => {
      const [devicesResult, tagsResult] = results;

      if (devicesResult.status === "rejected") {
        showFeedback({ type: "error", msg: "Nao foi possivel carregar os dispositivos." });
      }

      if (tagsResult.status === "rejected") {
        showFeedback({ type: "error", msg: "Nao foi possivel carregar as tags." });
      }
    });
  }, [devicesApi, tagsApi]);

  const allTags = Array.from(new Set(devices.flatMap((d) => d.tags)));

  useEffect(() => {
    if (editingId === null || editingTagNames.length === 0 || availableTags.length === 0) return;

    const selectedIds = availableTags
      .filter((tag) => editingTagNames.includes(tag.name))
      .map((tag) => tag.id);

    setForm((prev) => ({ ...prev, tagIds: selectedIds }));
  }, [editingId, editingTagNames, availableTags]);

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
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || (d.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || d.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  const tagComboboxOptions = availableTags.map((tag) => ({
    value: String(tag.id),
    label: tag.name,
  }));

  const selectedTagValues = form.tagIds.map((id) => String(id));

  useGridAnimation(gridRef, { effect: "hapi", deps: [filtered.map((d) => d.id).join()] });

  const openNew = () => {
    setForm({ name: "", type: "tv", location: "", tagIds: [] });
    setEditingId(null);
    setEditingTagNames([]);
    setShowModal(true);
  };

  const openEdit = (d: Device) => {
    const selectedIds = availableTags
      .filter((tag) => d.tags.includes(tag.name))
      .map((tag) => tag.id);

    setForm({ name: d.name, type: d.type, location: d.location ?? "", tagIds: selectedIds });
    setEditingId(d.id);
    setEditingTagNames(d.tags);
    setShowModal(true);
  };

  const showFeedback = (feedback: Feedback) => {
    setFeedback(feedback);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async () => {
    if (!form.name) { showFeedback({ type: "error", msg: "O nome do dispositivo é obrigatório." }); return; }

    try {
      if (editingId !== null) {
        await devicesApi.update(editingId, {
          name: form.name,
          type: form.type,
          location: form.location,
          tags: form.tagIds,
        });
        showFeedback({ type: "success", msg: "Dispositivo atualizado com sucesso!" });
      } else {
        await devicesApi.create({
          name: form.name,
          type: form.type,
          location: form.location,
          tags: form.tagIds,
        });
        showFeedback({ type: "success", msg: "Dispositivo cadastrado!" });
      }

      await loadDevices();
      const latestId = devices.length > 0 ? Math.max(...devices.map((d) => d.id)) : null;
      pendingEnterId.current = latestId;
      setShowModal(false);
    } catch {
      showFeedback({ type: "error", msg: "Nao foi possivel salvar o dispositivo." });
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm(null);

    try {
      await devicesApi.remove(id);
      await loadDevices();
      showFeedback({ type: "success", msg: "Dispositivo removido." });
    } catch {
      showFeedback({ type: "error", msg: "Nao foi possivel remover o dispositivo." });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground">Meus Dispositivos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {devices.filter((d) => d.online).length} online · {devices.filter((d) => !d.online).length} offline · {devices.length} total
          </p>
        </div>
        <Button onClick={openNew} className="self-start sm:self-auto rounded-xl">
          <Plus className="w-4 h-4" /> Adicionar Dispositivo
        </Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.type === "success" ? "default" : "destructive"} className={feedback.type === "success" ? "border-border bg-secondary text-success" : ""}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertDescription>{feedback.msg}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar dispositivo..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={filterTag} onValueChange={(v) => setFilterTag(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <Tag className="w-4 h-4 text-muted-foreground" />
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
            className={`bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${device.online ? "border-border" : "border-border opacity-80"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.online ? "bg-secondary text-success" : "bg-muted text-muted-foreground"}`}>
                  <DeviceIcon type={device.type} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{device.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{device.type === "tv" ? "Television" : "Raspberry Pi"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(device)} className="size-7 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(device.id)} className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {device.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={`rounded-full text-[11px] border-0 font-medium ${getTagColor(tag)}`}>{tag}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
              <div className={`flex items-center gap-1.5 ${device.online ? "text-success" : "text-muted-foreground"}`}>
                {device.online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{device.online ? "Online" : "Offline"}</span>
              </div>
              <span className="text-muted-foreground">{device.ip}</span>
              <span className="text-muted-foreground">{device.lastSeen}</span>
            </div>
          </div>
        ))}

        {/* Add device card */}
        <button onClick={openNew} className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-ring hover:text-primary hover:bg-accent transition-all min-h-[160px]">
          <div className="w-10 h-10 border-2 border-current rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">Adicionar dispositivo</p>
        </button>
      </div>

      {filtered.length === 0 && search && (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          Nenhum dispositivo encontrado para "{search}"
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh] gap-0 p-0">
          <DialogHeader className="px-5 py-4 border-b border-border">
            <DialogTitle className="text-foreground">{editingId ? "Editar Dispositivo" : "Novo Dispositivo"}</DialogTitle>
          </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <Label className="text-muted-foreground mb-2">Tipo de dispositivo</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["tv", "rpi"] as DeviceType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex items-center gap-2.5 p-3.5 border-2 rounded-xl text-sm transition-all ${
                        form.type === t ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <DeviceIcon type={t} />
                      <span className="font-medium">{t === "tv" ? "Television" : "Raspberry Pi"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Nome do dispositivo <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: TV Sala de Reunião B"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Localização</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: 2º Andar, Ala Norte"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="text-muted-foreground mb-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags de segmentação
                </Label>
                <ComboboxChips
                  options={tagComboboxOptions}
                  value={selectedTagValues}
                  onChange={(values) => {
                    const nextTagIds = values
                      .map((value) => Number(value))
                      .filter((id) => Number.isFinite(id));

                    setForm((f) => ({ ...f, tagIds: nextTagIds }));
                  }}
                  placeholder="Selecione as tags"
                  searchPlaceholder="Buscar tag..."
                  emptyMessage="Nenhuma tag encontrada."
                />
                <p className="text-xs text-muted-foreground mt-1.5">Selecione uma ou mais tags para relacionar o dispositivo aos grupos de envio de alertas.</p>
              </div>

              {!editingId && (
                <div className="p-3.5 bg-accent border border-border rounded-xl text-sm text-primary">
                  <p className="font-medium mb-1">Como conectar</p>
                  <p className="text-xs text-primary">Após cadastrar, acesse <code className="bg-secondary px-1 py-0.5 rounded">alertatv.io/connect</code> no dispositivo e insira o código de pareamento.</p>
                </div>
              )}
            </div>

          <DialogFooter className="px-5 py-4 border-t border-border sm:flex-row gap-3">
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
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-destructive" />
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
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
