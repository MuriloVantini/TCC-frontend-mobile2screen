import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useGridAnimation } from "../hooks/useGridAnimation";
import {
  Monitor,
  Tag,
  Send,
  Info,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Eye,
  ChevronDown,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";

type AlertType = "info" | "warning" | "critical" | "success";

const alertTypes = [
  { id: "info" as AlertType, label: "Informativo", icon: Info, color: "bg-blue-500", border: "border-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700", textColor: "text-blue-500" },
  { id: "warning" as AlertType, label: "Aviso", icon: AlertTriangle, color: "bg-amber-500", border: "border-amber-500", light: "bg-amber-50 border-amber-200 text-amber-700", textColor: "text-amber-500" },
  { id: "critical" as AlertType, label: "Crítico", icon: Zap, color: "bg-red-500", border: "border-red-500", light: "bg-red-50 border-red-200 text-red-700", textColor: "text-red-500" },
  { id: "success" as AlertType, label: "Sucesso", icon: CheckCircle2, color: "bg-emerald-500", border: "border-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-700", textColor: "text-emerald-500" },
];

const allDevices = [
  { id: 1, name: "TV Recepção Principal", type: "tv", online: true, tags: ["recepcao", "todos"] },
  { id: 2, name: "RPi Sala Reunião A", type: "rpi", online: true, tags: ["sala-reuniao", "diretoria"] },
  { id: 3, name: "TV Produção Linha 1", type: "tv", online: false, tags: ["producao", "seguranca"] },
  { id: 4, name: "TV RH", type: "tv", online: true, tags: ["rh", "todos"] },
  { id: 5, name: "RPi Portaria", type: "rpi", online: true, tags: ["portaria", "seguranca", "todos"] },
  { id: 6, name: "TV Refeitório", type: "tv", online: false, tags: ["refeitorio", "todos"] },
];

const allTags = Array.from(new Set(allDevices.flatMap((d) => d.tags)));

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const getTagColor = (tag: string) => tagColors[tag.charCodeAt(0) % tagColors.length];

const durations = ["10 segundos", "30 segundos", "1 minuto", "5 minutos", "10 minutos", "Indefinido"];

type Step = 1 | 2 | 3;

export function EnviarAlerta() {
  const [step, setStep] = useState<Step>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("30 segundos");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const matchingDevices = selectAll
    ? allDevices
    : allDevices.filter((d) => d.tags.some((t) => selectedTags.includes(t)));

  const devicesGridRef = useRef<HTMLDivElement>(null);
  useGridAnimation(devicesGridRef, { effect: "hapi", deps: [matchingDevices.map((d) => d.id).join()] });

  const stepCircleRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const prevStepRef = useRef<Step>(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;

    const activeCircle = stepCircleRefs.current[step - 1];
    if (activeCircle) {
      animate(activeCircle, {
        scale: [0.5, 1],
        duration: 500,
        ease: "spring(1, 80, 12, 0)",
      });
    }

    if (step > prev) {
      for (let idx = prev - 1; idx < step - 1; idx++) {
        const connector = connectorRefs.current[idx];
        if (connector) {
          animate(connector, { scaleX: [0, 1], duration: 450, ease: "outExpo" });
        }
      }
    } else if (step < prev) {
      for (let idx = step - 1; idx < prev - 1; idx++) {
        const connector = connectorRefs.current[idx];
        if (connector) {
          animate(connector, { scaleX: [1, 0], duration: 300, ease: "inExpo" });
        }
      }
    }
  }, [step]);

  useEffect(() => {
    const container = previewContainerRef.current;
    const card = previewCardRef.current;
    if (!container || !card) return;

    if (showPreview) {
      container.style.display = "flex";
      animate(container, {
        scaleY: [0.03, 1],
        opacity: [0.6, 1],
        duration: 480,
        ease: "outExpo",
      });
      animate(card, {
        opacity: [0, 1],
        scale: [0.88, 1],
        duration: 420,
        delay: 160,
        ease: "outBack(1.4)",
      });
    } else {
      animate(card, {
        opacity: [1, 0],
        scale: [1, 0.92],
        duration: 180,
        ease: "inExpo",
      });
      animate(container, {
        scaleY: [1, 0.03],
        opacity: [1, 0],
        duration: 320,
        delay: 100,
        ease: "inExpo",
        onComplete: () => { container.style.display = "none"; },
      });
    }
  }, [showPreview]);

  const toggleTag = (tag: string) => {
    setSelectAll(false);
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
  };

  const reset = () => {
    setStep(1);
    setSelectedTags([]);
    setSelectAll(false);
    setAlertType("info");
    setTitle("");
    setMessage("");
    setDuration("30 segundos");
    setSent(false);
  };

  const currentType = alertTypes.find((t) => t.id === alertType)!;
  const TypeIcon = currentType.icon;

  if (sent) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-96 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-slate-800 text-xl mb-2">Alerta enviado!</h2>
        <p className="text-slate-500 text-sm mb-2">
          <strong>"{title}"</strong> foi enviado para{" "}
          <strong>{matchingDevices.length} dispositivo{matchingDevices.length !== 1 ? "s" : ""}</strong>.
        </p>
        <p className="text-slate-400 text-sm mb-8">{matchingDevices.filter((d) => d.online).length} online · {matchingDevices.filter((d) => !d.online).length} offline</p>
        <div className="flex gap-3 w-full">
          <button onClick={reset} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            Enviar outro alerta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-slate-800">Enviar Alerta</h1>
        <p className="text-slate-500 text-sm mt-0.5">Envie mensagens para grupos de televisores por tags</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { if (s < step || (s === 2 && selectedTags.length > 0) || (s === 1)) setStep(s); }}
              className={`flex items-center gap-2 shrink-0 ${s <= step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                ref={(el) => { stepCircleRefs.current[i] = el; }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s < step ? "bg-blue-600 text-white" : s === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-200 text-slate-500"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs hidden sm:block ${s === step ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                {["Destino", "Mensagem", "Enviar"][i]}
              </span>
            </button>
            {i < 2 && (
              <div className="h-0.5 flex-1 rounded bg-slate-200 overflow-hidden">
                <div
                  ref={(el) => { connectorRefs.current[i] = el; }}
                  className="h-full bg-blue-600 origin-left"
                  style={{ transform: s < step ? "scaleX(1)" : "scaleX(0)" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select tags */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 mb-1">Selecionar destino por Tags</h3>
            <p className="text-slate-500 text-sm mb-4">Os alertas serão enviados para todos os dispositivos com as tags selecionadas.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => { setSelectAll(true); setSelectedTags(allTags); }}
                className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all ${
                  selectAll ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span className="font-medium">Todos</span>
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all text-left ${
                    selectedTags.includes(tag) && !selectAll
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tag}</span>
                </button>
              ))}
            </div>

            {/* Matching devices preview */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {matchingDevices.length > 0
                  ? `${matchingDevices.length} dispositivo${matchingDevices.length !== 1 ? "s" : ""} serão notificados`
                  : "Nenhum dispositivo selecionado"}
              </p>
              <div ref={devicesGridRef} className="flex flex-wrap gap-2">
                {matchingDevices.map((d) => (
                  <div key={d.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border ${d.online ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                    <Monitor className="w-3 h-3 shrink-0" />
                    {d.name}
                    {d.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={matchingDevices.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Próximo: Compor mensagem →
          </button>
        </div>
      )}

      {/* Step 2: Compose */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-slate-800 mb-1">Tipo de alerta</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {alertTypes.map(({ id, label, icon: Icon, color, border }) => (
                  <button
                    key={id}
                    onClick={() => setAlertType(id)}
                    className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all ${
                      alertType === id ? `${border} bg-slate-50 text-slate-800` : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-5 h-5 ${color} rounded-md flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Título <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião em 10 minutos"
                maxLength={60}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/60</p>
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Mensagem</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Texto adicional que aparecerá na tela..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/200</p>
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Duração na tela
              </label>
              <div className="relative">
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-slate-700">
                  {durations.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-600">Prévia na TV</label>
                <button
                  onClick={() => {
                    const opening = !showPreview;
                    setShowPreview(opening);
                    if (opening) {
                      setTimeout(() => {
                        previewContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 80);
                    }
                  }}
                  className="text-xs text-blue-600 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "Ocultar" : "Visualizar"}
                </button>
              </div>
              <div
                ref={previewContainerRef}
                className="bg-slate-900 rounded-xl overflow-hidden aspect-video items-center justify-center shadow-lg origin-center"
                style={{ display: "none" }}
              >
                <div ref={previewCardRef} className={`w-[80%] max-w-xs rounded-xl p-4 sm:p-6 shadow-2xl border ${currentType.light}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${currentType.color} rounded-lg flex items-center justify-center shadow`}>
                      <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-60">{currentType.label}</p>
                      <p className="font-bold text-sm sm:text-base leading-tight">{title || "Título do alerta"}</p>
                    </div>
                  </div>
                  {message && <p className="text-xs sm:text-sm opacity-80 leading-relaxed">{message}</p>}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current/10">
                    <Clock className="w-3 h-3 opacity-50" />
                    <span className="text-[10px] opacity-50">{duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              ← Voltar
            </button>
            <button onClick={() => setStep(3)} disabled={!title}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors">
              Próximo: Revisar e enviar →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Alert preview */}
            <div className={`p-5 border-l-4 ${currentType.border} ${currentType.light}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${currentType.color} rounded-xl flex items-center justify-center shrink-0 shadow`}>
                  <TypeIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${currentType.textColor}`}>{currentType.label}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-base">{title}</p>
                  {message && <p className="text-slate-600 text-sm mt-1">{message}</p>}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Dispositivos</p>
                  <p className="font-semibold text-slate-800">{matchingDevices.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs text-emerald-600 mb-1">Online agora</p>
                  <p className="font-semibold text-emerald-700">{matchingDevices.filter((d) => d.online).length}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Duração</p>
                  <p className="font-semibold text-slate-800 text-sm">{duration}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Tags selecionadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                  {selectAll && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">todos os dispositivos</span>}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Dispositivos que receberão</p>
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                  {matchingDevices.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-sm">
                      <Monitor className={`w-3.5 h-3.5 shrink-0 ${d.online ? "text-emerald-500" : "text-slate-400"}`} />
                      <span className={d.online ? "text-slate-700" : "text-slate-400"}>{d.name}</span>
                      {!d.online && <span className="text-xs text-slate-400">(offline)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {matchingDevices.some((d) => !d.online) && (
            <div className="flex items-start gap-2 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{matchingDevices.filter((d) => !d.online).length} dispositivo(s) estão offline e receberão o alerta quando reconectarem.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              ← Voltar
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                alertType === "critical" ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30" : "bg-blue-600 hover:bg-blue-700 text-white"
              } disabled:opacity-70`}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "Enviando..." : `Enviar para ${matchingDevices.length} dispositivo${matchingDevices.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
