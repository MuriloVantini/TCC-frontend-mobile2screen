import { useEffect, useMemo, useState } from "react";
import { Edit2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useTagsApi } from "../hooks/api/entities";
import type { TagResource } from "../hooks/api/laravel-api.types";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export type ManagedTag = {
  id: number;
  name: string;
  color: string | null;
  devicesCount: number;
  alertsCount: number;
};

type TagManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: ManagedTag[];
  onTagsChange: (tags: ManagedTag[], change?: { from?: string; to?: string }) => void;
};

type Feedback = { type: "success" | "error"; message: string } | null;

const DEFAULT_COLOR = "#6366f1";

function mapTag(resource: TagResource): ManagedTag | null {
  if (typeof resource.id !== "number" || typeof resource.name !== "string" || !resource.name.trim()) {
    return null;
  }

  return {
    id: resource.id,
    name: resource.name.trim(),
    color: typeof resource.color === "string" && resource.color ? resource.color : null,
    devicesCount: typeof resource.devices_count === "number" ? resource.devices_count : 0,
    alertsCount: typeof resource.alerts_count === "number" ? resource.alerts_count : 0,
  };
}

function toColorInputValue(color: string | null): string {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) return color;

  const namedColors: Record<string, string> = {
    red: "#ef4444",
    orange: "#f97316",
    yellow: "#eab308",
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#8b5cf6",
  };

  return color ? namedColors[color.toLowerCase()] ?? DEFAULT_COLOR : DEFAULT_COLOR;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;

  const response = "response" in error ? error.response : null;
  if (typeof response !== "object" || response === null || !("data" in response)) return fallback;

  const data = response.data;
  if (typeof data !== "object" || data === null || !("message" in data)) return fallback;

  return typeof data.message === "string" && data.message ? data.message : fallback;
}

export function TagManagerDialog({ open, onOpenChange, tags, onTagsChange }: TagManagerDialogProps) {
  const tagsApi = useMemo(() => useTagsApi(), []);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [editingTag, setEditingTag] = useState<ManagedTag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedTag | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const resetForm = () => {
    setName("");
    setColor(DEFAULT_COLOR);
    setEditingTag(null);
  };

  const refreshTags = async (change?: { from?: string; to?: string }) => {
    const resources = await tagsApi.list();
    const nextTags = resources.map(mapTag).filter((tag): tag is ManagedTag => tag !== null);
    onTagsChange(nextTags, change);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      setFeedback(null);
      return;
    }

    let active = true;
    setLoading(true);
    refreshTags()
      .catch((error) => {
        if (active) setFeedback({ type: "error", message: extractErrorMessage(error, "Não foi possível carregar as tags.") });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const startEditing = (tag: ManagedTag) => {
    setEditingTag(tag);
    setName(tag.name);
    setColor(toColorInputValue(tag.color));
    setFeedback(null);
  };

  const handleSave = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setFeedback({ type: "error", message: "Informe o nome da tag." });
      return;
    }

    const duplicate = tags.some(
      (tag) => tag.id !== editingTag?.id && tag.name.toLocaleLowerCase("pt-BR") === normalizedName.toLocaleLowerCase("pt-BR"),
    );
    if (duplicate) {
      setFeedback({ type: "error", message: "Já existe uma tag com esse nome." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, { name: normalizedName, color });
        await refreshTags({ from: editingTag.name, to: normalizedName });
        setFeedback({ type: "success", message: "Tag atualizada com sucesso." });
      } else {
        await tagsApi.create({ name: normalizedName, color });
        await refreshTags();
        setFeedback({ type: "success", message: "Tag criada com sucesso." });
      }
      resetForm();
    } catch (error) {
      setFeedback({ type: "error", message: extractErrorMessage(error, "Não foi possível salvar a tag.") });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setFeedback(null);
    try {
      await tagsApi.remove(deleteTarget.id);
      await refreshTags({ from: deleteTarget.name });
      if (editingTag?.id === deleteTarget.id) resetForm();
      setFeedback({ type: "success", message: "Tag removida com sucesso." });
      setDeleteTarget(null);
    } catch (error) {
      setFeedback({ type: "error", message: extractErrorMessage(error, "Não foi possível remover a tag.") });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden gap-0 p-0">
          <DialogHeader className="px-5 py-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Tag className="w-5 h-5 text-primary" /> Gerenciar tags
            </DialogTitle>
            <DialogDescription>Crie, edite ou remova os grupos usados para direcionar alertas.</DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-5 overflow-y-auto">
            {feedback && (
              <Alert className={feedback.type === "error" ? "border-destructive/40 text-destructive" : "border-success/40 text-success"}>
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-foreground">{editingTag ? "Editar tag" : "Nova tag"}</h4>
                {editingTag && (
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancelar edição</Button>
                )}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="tag-name">Nome</Label>
                  <Input
                    id="tag-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSave();
                      }
                    }}
                    maxLength={100}
                    placeholder="Ex: Urgente"
                    className="rounded-xl"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tag-color">Cor</Label>
                  <Input
                    id="tag-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-9 w-14 cursor-pointer rounded-xl p-1"
                    aria-label="Cor da tag"
                    disabled={saving}
                  />
                </div>
              </div>
              <Button type="button" onClick={() => void handleSave()} disabled={saving} className="w-full rounded-xl">
                {saving ? <Loader2 className="animate-spin" /> : editingTag ? <Edit2 /> : <Plus />}
                {saving ? "Salvando..." : editingTag ? "Salvar alterações" : "Adicionar tag"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Tags cadastradas</h4>
                <span className="text-xs text-muted-foreground">{tags.length} {tags.length === 1 ? "tag" : "tags"}</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" /> Carregando tags...
                </div>
              ) : tags.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  Nenhuma tag cadastrada.
                </div>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full ring-2 ring-border"
                        style={{ backgroundColor: tag.color || DEFAULT_COLOR }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{tag.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tag.devicesCount} {tag.devicesCount === 1 ? "dispositivo" : "dispositivos"} · {tag.alertsCount} {tag.alertsCount === 1 ? "alerta" : "alertas"}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => startEditing(tag)} aria-label={`Editar tag ${tag.name}`} title="Editar tag">
                        <Edit2 />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTarget(tag)} aria-label={`Remover tag ${tag.name}`} title="Remover tag" className="text-destructive hover:text-destructive">
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(nextOpen) => !nextOpen && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tag?</AlertDialogTitle>
            <AlertDialogDescription>
              A tag “{deleteTarget?.name}” será removida dos dispositivos e não poderá mais ser usada para direcionar alertas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); void handleDelete(); }} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting && <Loader2 className="animate-spin" />}
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
