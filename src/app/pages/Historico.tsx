import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useGridAnimation } from "../hooks/useGridAnimation";
import {
  Info,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Monitor,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { useMorphButton, type SubmitState } from "../hooks/useFormSubmitAnimation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";

type AlertType = "info" | "warning" | "critical" | "success";

interface AlertRecord {
  id: number;
  title: string;
  message: string;
  type: AlertType;
  tags: string[];
  devices: number;
  delivered: number;
  failed: number;
  duration: string;
  sentAt: string;
}

const alertHistory: AlertRecord[] = [
  { id: 1, title: "Reunião em 10 minutos — Sala A", message: "Confirme sua presença com o organizador.", type: "info", tags: ["sala-reuniao", "diretoria"], devices: 3, delivered: 3, failed: 0, duration: "1 minuto", sentAt: "28/02/2026 14:52" },
  { id: 2, title: "EMERGÊNCIA: Saída bloqueada", message: "A saída da Linha 1 está bloqueada. Evacuar imediatamente.", type: "critical", tags: ["producao", "seguranca"], devices: 6, delivered: 5, failed: 1, duration: "Indefinido", sentAt: "28/02/2026 13:30" },
  { id: 3, title: "Sistema em manutenção às 18h", message: "O sistema ficará indisponível das 18h às 19h.", type: "warning", tags: ["ti", "todos"], devices: 12, delivered: 10, failed: 2, duration: "10 minutos", sentAt: "28/02/2026 11:00" },
  { id: 4, title: "Bem-vindo, Rafael!", message: "Nosso novo colega Rafael inicia hoje no setor de TI.", type: "success", tags: ["recepcao"], devices: 2, delivered: 2, failed: 0, duration: "5 minutos", sentAt: "28/02/2026 09:15" },
  { id: 5, title: "Cardápio do refeitório", message: "Hoje: Frango grelhado, arroz, feijão, salada verde.", type: "info", tags: ["refeitorio", "todos"], devices: 8, delivered: 6, failed: 2, duration: "1 hora", sentAt: "28/02/2026 08:00" },
  { id: 6, title: "Entrega de EPI obrigatória", message: "Todos os colaboradores devem retirar EPI até sexta.", type: "warning", tags: ["producao", "seguranca", "rh"], devices: 9, delivered: 9, failed: 0, duration: "30 minutos", sentAt: "27/02/2026 16:00" },
  { id: 7, title: "Aviso de chuva forte", message: "Atenção: previsão de chuva forte às 15h.", type: "warning", tags: ["portaria", "todos"], devices: 12, delivered: 11, failed: 1, duration: "2 horas", sentAt: "27/02/2026 13:00" },
  { id: 8, title: "Meta do mês atingida!", message: "Parabéns equipe! Meta de produção atingida.", type: "success", tags: ["producao", "todos"], devices: 12, delivered: 12, failed: 0, duration: "5 minutos", sentAt: "26/02/2026 17:30" },
];

const alertTypeConfig = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-100", border: "border-l-blue-500", label: "Informativo", badgeCls: "bg-blue-100 text-blue-700" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", border: "border-l-amber-500", label: "Aviso", badgeCls: "bg-amber-100 text-amber-700" },
  critical: { icon: Zap, color: "text-red-600", bg: "bg-red-100", border: "border-l-red-500", label: "Crítico", badgeCls: "bg-red-100 text-red-700" },
  success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-l-emerald-500", label: "Sucesso", badgeCls: "bg-emerald-100 text-emerald-700" },
};

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obj = { val: 0 };
    const anim = animate(obj, {
      val: value,
      duration: 1200,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = Math.round(obj.val) + suffix;
      },
    });
    return () => { anim.pause(); };
  }, [value, suffix]);
  return (
    <p ref={ref} className="text-lg font-semibold text-slate-800">
      0{suffix}
    </p>
  );
}

const PAGE_SIZE = 5;

export function Historico() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AlertRecord | null>(null);
  const [resendState, setResendState] = useState<SubmitState>("idle");

  const handleResend = async () => {
    setResendState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setResendState("success");
    setTimeout(() => setResendState("idle"), 1500);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) { setSelected(null); setResendState("idle"); }
  };

  const { morphStyle: resendMorphStyle, morphContent: resendMorphContent } = useMorphButton(
    resendState,
    <><RotateCcw className="w-4 h-4" /> Reenviar este alerta</>
  );

  const filtered = alertHistory.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.join(" ").includes(search.toLowerCase());
    const matchType = !typeFilter || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const listRef = useRef<HTMLDivElement>(null);

  useGridAnimation(listRef, { effect: "hapi", deps: [paginated.map((a) => a.id).join()] });

  const totalDelivered = alertHistory.reduce((s, a) => s + a.delivered, 0);
  const totalFailed = alertHistory.reduce((s, a) => s + a.failed, 0);
  const deliveryRate = Math.round((totalDelivered / (totalDelivered + totalFailed)) * 100);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!summaryRef.current) return;
    animate(Array.from(summaryRef.current.children), {
      opacity: [0, 1],
      translateY: [14, 0],
      delay: stagger(80),
      duration: 500,
      ease: "outExpo",
    });
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-slate-800">Histórico de Alertas</h1>
        <p className="text-slate-500 text-sm mt-0.5">{alertHistory.length} alertas enviados</p>
      </div>

      {/* Summary */}
      <div ref={summaryRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total enviados", numericValue: alertHistory.length, suffix: "", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Entregues", numericValue: totalDelivered, suffix: "", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Falhas", numericValue: totalFailed, suffix: "", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "Taxa de entrega", numericValue: deliveryRate, suffix: "%", icon: Monitor, color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, numericValue, suffix, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4 gap-2 border-slate-100 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <AnimatedCounter value={numericValue} suffix={suffix} />
            <p className="text-xs text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pesquisar por título ou tag..."
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter || "all"}
          onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="info">Informativo</SelectItem>
            <SelectItem value="warning">Aviso</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div ref={listRef} className="divide-y divide-slate-50">
          {paginated.map((alert) => {
            const cfg = alertTypeConfig[alert.type];
            const Icon = cfg.icon;
            const deliveryPct = Math.round((alert.delivered / alert.devices) * 100);
            return (
              <Button
                key={alert.id}
                variant="ghost"
                onClick={() => setSelected(alert)}
                className={`w-full flex items-start gap-3 sm:gap-4 p-4 sm:p-5 h-auto text-left justify-start border-l-4 ${cfg.border} hover:bg-slate-50/50 rounded-none`}
              >
                <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{alert.title}</p>
                    <Badge variant="outline" className={`shrink-0 text-[11px] rounded-full border-0 ${cfg.badgeCls}`}>{cfg.label}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                    {alert.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className={`text-[10px] rounded-full border-0 ${getTagColor(tag)}`}>{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> {alert.devices} disp.
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className={`w-3 h-3 ${deliveryPct === 100 ? "text-emerald-500" : "text-amber-400"}`} />
                      {deliveryPct}% entregues
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.sentAt}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhum alerta encontrado.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setPage(p)}
                  className="size-7 text-xs"
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh] gap-0">
          {selected && (
            <>
              <div className={`border-l-4 ${alertTypeConfig[selected.type].border} px-5 py-4 flex items-start gap-3 bg-slate-50 pr-12`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${alertTypeConfig[selected.type].bg} rounded-xl flex items-center justify-center shrink-0`}>
                    {(() => { const Icon = alertTypeConfig[selected.type].icon; return <Icon className={`w-4.5 h-4.5 ${alertTypeConfig[selected.type].color}`} />; })()}
                  </div>
                  <div>
                    <DialogTitle className="text-sm font-semibold text-slate-800 leading-tight">{selected.title}</DialogTitle>
                    <p className="text-xs text-slate-400 mt-0.5">{selected.sentAt}</p>
                  </div>
                </div>
              </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {selected.message && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Mensagem</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selected.message}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{selected.devices}</p>
                  <p className="text-xs text-slate-400">Dispositivos</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{selected.delivered}</p>
                  <p className="text-xs text-emerald-500">Entregues</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${selected.failed > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                  <p className={`text-lg font-bold ${selected.failed > 0 ? "text-red-600" : "text-slate-400"}`}>{selected.failed}</p>
                  <p className={`text-xs ${selected.failed > 0 ? "text-red-400" : "text-slate-400"}`}>Falhas</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Tags utilizadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className={`text-xs rounded-full border-0 font-medium ${getTagColor(tag)}`}>{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                <Clock className="w-3.5 h-3.5" />
                Duração na tela: <strong>{selected.duration}</strong>
              </div>
            </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-center">
                <Button
                  onClick={handleResend}
                  disabled={resendState !== "idle"}
                  style={resendMorphStyle}
                  className="overflow-hidden"
                >
                  {resendMorphContent}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}