import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWebhooksApi } from "../hooks/api/entities";
import type { WebhookLogResource, WebhookPayload, WebhookResource } from "../hooks/api/laravel-api.types";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const EVENT_OPTIONS = [
  { value: "alert.sent", label: "Alerta enviado" },
  { value: "alert.delivered", label: "Alerta entregue" },
  { value: "alert.failed", label: "Alerta falhou" },
  { value: "device.added", label: "Dispositivo adicionado" },
  { value: "device.online", label: "Dispositivo online" },
  { value: "device.offline", label: "Dispositivo offline" },
] as const;

const EMPTY_FORM = {
  name: "",
  url: "",
  secret: "",
  isActive: true,
};

function eventLabel(event: string): string {
  return EVENT_OPTIONS.find((option) => option.value === event)?.label ?? event;
}

function formatDate(value?: string | null): string {
  if (!value) return "Nunca";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

export function WebhookManager() {
  const webhooksApi = useMemo(() => useWebhooksApi(), []);
  const [webhooks, setWebhooks] = useState<WebhookResource[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<WebhookLogResource[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [events, setEvents] = useState<string[]>(["alert.sent", "alert.delivered"]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"idle" | "saving" | "testing" | "deleting">("idle");


  const selectedWebhook = webhooks.find((webhook) => webhook.id === selectedId);

  const loadLogs = useCallback(async (webhookId: number) => {
    try {
      setLogs(await webhooksApi.logs(webhookId));
    } catch {
      setLogs([]);
    }
  }, [webhooksApi]);

  const selectWebhook = useCallback((webhook: WebhookResource) => {
    if (typeof webhook.id !== "number") return;

    setSelectedId(webhook.id);
    setForm({
      name: typeof webhook.name === "string" ? webhook.name : "",
      url: typeof webhook.url === "string" ? webhook.url : "",
      secret: "",
      isActive: Boolean(webhook.is_active),
    });
    setEvents(Array.isArray(webhook.events) ? webhook.events.filter((event): event is string => typeof event === "string") : []);
    void loadLogs(webhook.id);
  }, [loadLogs]);

  const loadWebhooks = useCallback(async () => {
    setLoading(true);

    try {
      const items = await webhooksApi.list();
      setWebhooks(items);
      if (items[0]) selectWebhook(items[0]);
    } catch {
      toast.error("Não foi possivel carregar os webhooks.");
    } finally {
      setLoading(false);
    }
  }, [selectWebhook, webhooksApi]);

  useEffect(() => {
    void loadWebhooks();
  }, [loadWebhooks]);

  const startNew = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setEvents(["alert.sent", "alert.delivered"]);
    setLogs([]);
  };

  const toggleEvent = (event: string, checked: boolean) => {
    setEvents((current) => checked
      ? Array.from(new Set([...current, event]))
      : current.filter((item) => item !== event));
  };

  const save = async () => {
    const name = form.name.trim();
    const url = form.url.trim();
    const secret = form.secret.trim();

    if (!name) { toast.error("Informe um nome para o webhook."); return; }
    if (!/^https?:\/\//i.test(url)) { toast.error("Informe uma URL HTTP ou HTTPS válida."); return; }
    if (events.length === 0) { toast.error("Selecione pelo menos um evento."); return; }
    if (!selectedId && secret.length < 16) { toast.error("O segredo deve ter pelo menos 16 caracteres."); return; }
    if (secret && secret.length < 16) { toast.error("O segredo deve ter pelo menos 16 caracteres."); return; }

    setAction("saving");

    const payload: WebhookPayload = {
      name,
      url,
      events,
      is_active: form.isActive,
      ...(secret ? { secret } : {}),
    };

    try {
      const saved = selectedId
        ? await webhooksApi.update(selectedId, payload)
        : await webhooksApi.create(payload);

      setWebhooks((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists
          ? current.map((item) => item.id === saved.id ? saved : item)
          : [saved, ...current];
      });
      selectWebhook(saved);
      toast.success(selectedId ? "Webhook atualizado e URL validada." : "Webhook criado e URL validada.");
    } catch {
      toast.error("Não foi possivel salvar. Confira URL, segredo e eventos.");
    } finally {
      setAction("idle");
    }
  };

  const testWebhook = async () => {
    if (!selectedId) return;
    setAction("testing");

    try {
      const response = await webhooksApi.test(selectedId);
      toast.success(response.message);
    } catch {
      toast.error("A URL não respondeu com sucesso. A tentativa foi registrada no log.");
    } finally {
      await loadLogs(selectedId);
      setAction("idle");
    }
  };

  const removeWebhook = async () => {
    if (!selectedId || !window.confirm("Excluir este webhook e todos os seus logs?")) return;
    setAction("deleting");

    try {
      await webhooksApi.remove(selectedId);
      setWebhooks((current) => current.filter((item) => item.id !== selectedId));
      startNew();
      toast.success("Webhook excluído.");
    } catch {
      toast.error("Não foi possivel excluir o webhook.");
    } finally {
      setAction("idle");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Carregando webhooks...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-foreground">Webhooks</h4>
          <p className="text-xs text-muted-foreground">Envie eventos assinados para sistemas externos e acompanhe cada tentativa.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={startNew}>
          <Plus className="size-4" /> Novo
        </Button>
      </div>



      {webhooks.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {webhooks.map((webhook) => (
            <button
              key={String(webhook.id)}
              type="button"
              onClick={() => selectWebhook(webhook)}
              className={`rounded-xl border p-3 text-left transition-colors ${selectedId === webhook.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{webhook.name}</span>
                <Badge variant={webhook.is_active ? "default" : "outline"}>{webhook.is_active ? "Ativo" : "Inativo"}</Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{webhook.url}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{webhook.logs_count ?? 0} tentativa(s) - ultimo disparo: {formatDate(webhook.last_triggered)}</p>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="webhook-name">Nome</Label>
            <Input id="webhook-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Integracao ERP" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="webhook-url">URL de callback</Label>
            <Input id="webhook-url" type="url" value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://sistema.exemplo.com/webhooks" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="webhook-secret">Segredo de assinatura</Label>
          <Input id="webhook-secret" type="password" value={form.secret} onChange={(event) => setForm((current) => ({ ...current, secret: event.target.value }))} placeholder={selectedId ? "Deixe vazio para manter o segredo atual" : "Minimo de 16 caracteres"} autoComplete="new-password" />
          <p className="text-[11px] text-muted-foreground">Cada POST recebe a assinatura HMAC-SHA256 no cabeçalho X-Mobile2Screen-Signature.</p>
        </div>

        <div className="space-y-2">
          <Label>Eventos de interesse</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_OPTIONS.map((option) => (
              <Label key={option.value} htmlFor={`webhook-event-${option.value}`} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 font-normal">
                <Checkbox id={`webhook-event-${option.value}`} checked={events.includes(option.value)} onCheckedChange={(checked) => toggleEvent(option.value, Boolean(checked))} />
                <span className="text-xs">{option.label}</span>
              </Label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <div>
            <p className="text-sm font-medium">Webhook ativo</p>
            <p className="text-xs text-muted-foreground">Desative temporariamente sem remover a configuração.</p>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))} />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {selectedId && <Button type="button" variant="destructive" onClick={removeWebhook} disabled={action !== "idle"}><Trash2 className="size-4" /> Excluir</Button>}
          {selectedId && <Button type="button" variant="outline" onClick={testWebhook} disabled={action !== "idle"}>{action === "testing" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Testar URL</Button>}
          <Button type="button" onClick={save} disabled={action !== "idle"}>{action === "saving" && <Loader2 className="size-4 animate-spin" />} {selectedId ? "Salvar alteracoes" : "Criar webhook"}</Button>
        </div>
      </div>

      {selectedWebhook && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h5 className="text-sm font-medium">Log de entregas</h5>
          </div>
          {logs.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Nenhuma tentativa registrada. Use Testar URL para validar a integração.</p>
          ) : (
            <div className="max-h-72 divide-y overflow-y-auto rounded-lg border border-border">
              {logs.map((log) => {
                const succeeded = typeof log.response_status === "number" && log.response_status >= 200 && log.response_status < 300;
                return (
                  <div key={String(log.id)} className="grid gap-2 p-3 text-xs sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="font-medium">{eventLabel(String(log.event_type ?? ""))}</p>
                      <p className="truncate text-muted-foreground">{log.error_message || log.response_body || "Resposta sem conteudo"}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant={succeeded ? "default" : "destructive"}>{log.response_status ?? "Falha de conexao"}</Badge>
                      <p className="mt-1 text-muted-foreground">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
