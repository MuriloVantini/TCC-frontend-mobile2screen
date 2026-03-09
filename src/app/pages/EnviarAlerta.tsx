import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { useGridAnimation } from "../hooks/useGridAnimation";
import { shake, useMorphButton, type SubmitState } from "../hooks/useFormSubmitAnimation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Monitor,
  Tag,
  Send,
  Info,
  AlertTriangle,
  Zap,
  Check,
  CheckCircle2,
  Eye,
  ChevronDown,
  Clock,
  Wifi,
  WifiOff,
  MoveRight,
} from "lucide-react";
import { useAlertsApi, useDevicesApi, useTagsApi } from "../hooks/api/entities";

type AlertType = "info" | "warning" | "critical" | "success";

const alertTypes = [
  { id: "info" as AlertType, label: "Informativo", icon: Info, color: "bg-blue-500", border: "border-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700", textColor: "text-blue-500" },
  { id: "warning" as AlertType, label: "Aviso", icon: AlertTriangle, color: "bg-amber-500", border: "border-amber-500", light: "bg-amber-50 border-amber-200 text-amber-700", textColor: "text-amber-500" },
  { id: "critical" as AlertType, label: "Crítico", icon: Zap, color: "bg-red-500", border: "border-red-500", light: "bg-red-50 border-red-200 text-red-700", textColor: "text-red-500" },
  { id: "success" as AlertType, label: "Sucesso", icon: CheckCircle2, color: "bg-emerald-500", border: "border-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-700", textColor: "text-emerald-500" },
];

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

type AlertDevice = {
  id: number;
  name: string;
  type: "tv" | "rpi";
  online: boolean;
  tags: string[];
};

type AlertTag = {
  id: number;
  name: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractTagNames(source: unknown): string[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => (isRecord(item) && typeof item.name === "string" ? item.name : null))
    .filter((item): item is string => typeof item === "string");
}

function durationToSeconds(value: string): number | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "indefinido") return null;

  const [rawAmount, rawUnit] = normalized.split(" ");
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) return 30;

  if (rawUnit?.startsWith("min")) {
    return amount * 60;
  }

  return amount;
}

export function EnviarAlerta() {
  const devicesApi = useMemo(() => useDevicesApi(), []);
  const tagsApi = useMemo(() => useTagsApi(), []);
  const alertsApi = useMemo(() => useAlertsApi(), []);
  const [allDevices, setAllDevices] = useState<AlertDevice[]>([]);
  const [allTags, setAllTags] = useState<AlertTag[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("30 segundos");
  const [showPreview, setShowPreview] = useState(false);
  const [sendState, setSendState] = useState<SubmitState>("idle");
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
  const stepContentRef = useRef<HTMLDivElement>(null);
  const { shakeCard } = shake(stepContentRef, String(step));
  const sendIdleContent = (
    <><Send />{`Enviar para ${matchingDevices.length} dispositivo${matchingDevices.length !== 1 ? "s" : ""}`}</>
  );
  const { morphStyle: sendMorphStyle, morphContent: sendMorphContent } = useMorphButton(sendState, sendIdleContent);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([devicesApi.list(), tagsApi.list()])
      .then(([devicesResult, tagsResult]) => {
        if (!isMounted) return;

        if (devicesResult.status === "fulfilled") {
          const mappedDevices = devicesResult.value.map((resource, index) => ({
            id: typeof resource.id === "number" ? resource.id : index + 1,
            name: typeof resource.name === "string" ? resource.name : `Dispositivo ${index + 1}`,
            type: (resource.type === "rpi" ? "rpi" : "tv") as AlertDevice["type"],
            online: Boolean(resource.is_online),
            tags: extractTagNames(resource.tags),
          }));
          setAllDevices(mappedDevices);
        } else {
          setAllDevices([]);
        }

        if (tagsResult.status === "fulfilled") {
          const mappedTags = tagsResult.value
            .map((tag, index) => ({
              id: typeof tag.id === "number" ? tag.id : index + 1,
              name: typeof tag.name === "string" ? tag.name : `tag-${index + 1}`,
            }))
            .filter((tag) => tag.name.trim().length > 0);

          setAllTags(mappedTags);
        } else {
          setAllTags([]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setAllDevices([]);
        setAllTags([]);
      });

    return () => {
      isMounted = false;
    };
  }, [devicesApi, tagsApi]);

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
    const selectedTagIds = (selectAll ? allTags : allTags.filter((tag) => selectedTags.includes(tag.name))).map((tag) => tag.id);
    if (selectedTagIds.length === 0) {
      setSendState("error");
      shakeCard();
      setTimeout(() => setSendState("idle"), 1500);
      return;
    }

    setSendState("loading");
    try {
      await alertsApi.create({
        title,
        message,
        type: alertType,
        duration_seconds: durationToSeconds(duration),
        priority: 0,
        tags: selectedTagIds,
      });

      setSendState("success");
      setTimeout(() => setSent(true), 700);
    } catch {
      setSendState("error");
      shakeCard();
      setTimeout(() => setSendState("idle"), 1500);
    }
  };

  const reset = () => {
    setTimeout(() => {
      setStep(1);
      setSelectedTags([]);
      setSelectAll(false);
      setAlertType("info");
      setTitle("");
      setMessage("");
      setDuration("30 segundos");
      setShowPreview(false);
      setSendState("idle");
      setSent(false);
    }, 800);
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
          <Button onClick={reset} className="flex-1 rounded-xl">
            Enviar outro alerta
          </Button>
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
      <div className="flex items-center w-full">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => { if (s < step || (s === 2 && selectedTags.length > 0) || (s === 1)) setStep(s); }}
              className={`flex items-center gap-2 shrink-0 ${s <= step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                ref={(el) => { stepCircleRefs.current[i] = el; }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${s < step ? "bg-blue-600 text-white" : s === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-200 text-slate-500"
                  }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs hidden sm:block ${s === step ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                {["Destino", "Mensagem", "Enviar"][i]}
              </span>
            </button>

            {i < 2 && (
              <div className="h-0.5 flex-1 mx-2 rounded bg-slate-200 overflow-hidden">
                <div
                  ref={(el) => { connectorRefs.current[i] = el; }}
                  className="h-full bg-blue-600 origin-left"
                  style={{ transform: s < step ? "scaleX(1)" : "scaleX(0)" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div ref={stepContentRef}>
      {/* Step 1: Select tags */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 mb-1">Selecionar destino por Tags</h3>
            <p className="text-slate-500 text-sm mb-4">Os alertas serão enviados para todos os dispositivos com as tags selecionadas.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => { setSelectAll(true); setSelectedTags(allTags.map((tag) => tag.name)); }}
                className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all ${selectAll ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span className="font-medium">Todos</span>
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.name)}
                  className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all text-left ${selectedTags.includes(tag.name) && !selectAll
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tag.name}</span>
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

          <Button
            onClick={() => matchingDevices.length === 0 ? shakeCard() : setStep(2)}
            className="w-full rounded-xl"
          >
            <>Próximo: Compor mensagem <MoveRight/></>
          </Button>
        </div>
      )}

      {/* Step 2: Compose */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="form-field">
              <h3 className="text-slate-800 mb-1">Tipo de alerta</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {alertTypes.map(({ id, label, icon: Icon, color, border }) => (
                  <button
                    key={id}
                    onClick={() => setAlertType(id)}
                    className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm transition-all ${alertType === id ? `${border} bg-slate-50 text-slate-800` : "border-slate-200 text-slate-500 hover:bg-slate-50"
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

            <div className="form-field space-y-1.5">
              <Label className="text-slate-600">Título <span className="text-red-500">*</span></Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião em 10 minutos"
                maxLength={60}
                className="rounded-xl"
              />
              <p className="text-xs text-slate-400 text-right">{title.length}/60</p>
            </div>

            <div className="form-field space-y-1.5">
              <Label className="text-slate-600">Mensagem</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Texto adicional que aparecerá na tela..."
                rows={3}
                maxLength={200}
                className="rounded-xl"
              />
              <p className="text-xs text-slate-400 text-right">{message.length}/200</p>
            </div>

            <div className="form-field space-y-1.5">
              <Label className="text-slate-600">
                <Clock className="w-3.5 h-3.5" /> Duração na tela
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between rounded-xl font-normal">
                    {duration}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  <DropdownMenuRadioGroup value={duration} onValueChange={setDuration}>
                    {durations.map((d) => (
                      <DropdownMenuRadioItem key={d} value={d}>{d}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Preview */}
            <div className="form-field">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600">Prévia na TV</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const opening = !showPreview;
                    setShowPreview(opening);
                    if (opening) {
                      setTimeout(() => {
                        previewContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 80);
                    }
                  }}
                  className="text-blue-600 h-auto p-0 hover:bg-transparent"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "Ocultar" : "Visualizar"}
                </Button>
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
          <div className="flex">
            <Button onClick={() => !title ? shakeCard() : setStep(3)} className="flex-1 rounded-xl">
              <>Próximo: Revisar e enviar <MoveRight/></>
            </Button>
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
                    <Badge key={tag} variant="outline" className={`rounded-full border-0 font-medium ${getTagColor(tag)}`}>{tag}</Badge>
                  ))}
                  {selectAll && <Badge variant="outline" className="rounded-full border-0 font-medium bg-blue-100 text-blue-700">todos os dispositivos</Badge>}
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
            <Alert className="border-amber-200 bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {matchingDevices.filter((d) => !d.online).length} dispositivo(s) estão offline e receberão o alerta quando reconectarem.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSend}
              disabled={sendState !== "idle"}
              style={sendMorphStyle}
              className="overflow-hidden"
            >
              {sendMorphContent}
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
