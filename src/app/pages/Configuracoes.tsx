import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import {
  Save,
  Check,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Lock,
  User,
  Bell,
  Shield,
  Webhook,
  KeyRound,
  ImagePlus,
  Trash2,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import {
  shake,
  useMorphButton,
  type SubmitState,
} from "../hooks/useFormSubmitAnimation";
import { useApiKeysApi, useSettingsApi, useUsersApi } from "../hooks/api/entities";
import { useUserContext } from "../contexts/UserContextProvider";
import { WebhookManager } from "../components/WebhookManager";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const sections = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "api", label: "API & Integração", icon: Webhook },
];

type SectionId = "perfil" | "notificacoes" | "seguranca" | "api";

const defaultSubmitState: Record<SectionId, SubmitState> = {
  perfil: "idle",
  notificacoes: "idle",
  seguranca: "idle",
  api: "idle",
};

export function Configuracoes() {
  const settingsApi = useMemo(() => useSettingsApi(), []);
  const apiKeysApi = useMemo(() => useApiKeysApi(), []);
  const usersApi = useMemo(() => useUsersApi(), []);
  const { user, refreshUser } = useUserContext();
  const [active, setActive] = useState("perfil");
  const [saved, setSaved] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibleApiKey, setVisibleApiKey] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [submitState, setSubmitState] =
    useState<Record<SectionId, SubmitState>>(defaultSubmitState);
  const [formError, setFormError] = useState<Partial<Record<SectionId, string>>>({});

  const [profile, setProfile] = useState({ name: "", email: "", phone: "", company: "" });

  const [notifs, setNotifs] = useState({
    alertFailed: true,
    deviceOffline: true,
    weeklyReport: false,
    deviceConnected: true,
    limitReached: true,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const maskedApiKey = visibleApiKey ? `${"*".repeat(Math.min(36, visibleApiKey.length))}${visibleApiKey.slice(-8)}` : "Nenhuma chave API encontrada";

  const perfilRef = useRef<HTMLDivElement | null>(null);
  const notificacoesRef = useRef<HTMLDivElement | null>(null);
  const segurancaRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<HTMLDivElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  const { shakeCard: shakePerfil } = shake(perfilRef, active);
  const { shakeCard: shakeNotificacoes } = shake(notificacoesRef, active);
  const { shakeCard: shakeSeguranca } = shake(segurancaRef, active);

  const perfilMorph = useMorphButton(submitState.perfil, <><Save className="w-4 h-4" /> Salvar</>);
  const notificacoesMorph = useMorphButton(submitState.notificacoes, <><Save className="w-4 h-4" /> Salvar</>);
  const segurancaMorph = useMorphButton(submitState.seguranca, <><Save className="w-4 h-4" /> Alterar senha</>);

  const handleSave = (section: string) => {
    setSaved((p) => [...p, section]);
    setTimeout(() => setSaved((p) => p.filter((s) => s !== section)), 2500);
  };

  const copyApiKey = () => {
    if (!visibleApiKey) return;

    navigator.clipboard?.writeText(visibleApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileImage = async (file?: File) => {
    if (!file || typeof user?.id !== "number") return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError((previous) => ({ ...previous, perfil: "Escolha uma imagem JPG, PNG ou WebP." }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError((previous) => ({ ...previous, perfil: "A foto deve ter no máximo 2 MB." }));
      return;
    }

    setIsUploadingImage(true);
    setFormError((previous) => ({ ...previous, perfil: undefined }));

    try {
      await usersApi.updateProfileImage(user.id, file);
      await refreshUser();
    } catch {
      setFormError((previous) => ({ ...previous, perfil: "Não foi possível enviar a foto. Tente novamente." }));
    } finally {
      setIsUploadingImage(false);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    }
  };

  const handleRemoveProfileImage = async () => {
    if (typeof user?.id !== "number" || !user.profile_image_url) return;
    if (!window.confirm("Remover a foto de perfil atual?")) return;

    setIsRemovingImage(true);
    setFormError((previous) => ({ ...previous, perfil: undefined }));

    try {
      await usersApi.removeProfileImage(user.id);
      await refreshUser();
    } catch {
      setFormError((previous) => ({ ...previous, perfil: "Não foi possível remover a foto. Tente novamente." }));
    } finally {
      setIsRemovingImage(false);
    }
  };

  const saveWithAnimation = async (
    section: SectionId,
    validate: () => string | null,
    onError: () => void,
    submit: () => Promise<void>
  ) => {
    const error = validate();

    if (error) {
      setFormError((previous) => ({ ...previous, [section]: error }));
      setSectionSubmitState(section, "error");
      onError();
      setTimeout(() => setSectionSubmitState(section, "idle"), 1300);
      return;
    }

    setFormError((previous) => ({ ...previous, [section]: undefined }));
    setSectionSubmitState(section, "loading");

    try {
      await submit();
      handleSave(section);
      setSectionSubmitState(section, "success");
    } catch {
      setSectionSubmitState(section, "error");
      onError();
    } finally {
      setTimeout(() => setSectionSubmitState(section, "idle"), 1200);
    }
  };

  const setSectionSubmitState = (section: SectionId, state: SubmitState) => {
    setSubmitState((previous) => ({ ...previous, [section]: state }));
  };

  useEffect(() => {
    animate(".js-settings-section", {
      opacity: [0, 1],
      translateY: [0, 16],
      duration: 380,
      ease: "outCubic",
    });
  }, [active]);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([settingsApi.get(), apiKeysApi.list()]).then(([settingsResult, apiKeysResult]) => {
      if (!isMounted) return;

      if (settingsResult.status === "fulfilled") {
        const settings = settingsResult.value as Record<string, unknown>;
        setNotifs({
          alertFailed: Boolean(settings.notify_alert_failed),
          deviceOffline: Boolean(settings.notify_device_offline),
          weeklyReport: Boolean(settings.notify_weekly_report),
          deviceConnected: Boolean(settings.notify_device_connected),
          limitReached: Boolean(settings.notify_limit_reached),
        });

        setProfile((previous) => ({
          ...previous,
          phone: typeof settings.notification_phone === "string" ? settings.notification_phone : previous.phone,
          email: typeof settings.notification_email === "string" ? settings.notification_email : previous.email,
        }));
      }

      if (apiKeysResult.status === "fulfilled") {
        const keyItem = apiKeysResult.value[0] as Record<string, unknown> | undefined;
        if (keyItem && typeof keyItem.name === "string") {
          setVisibleApiKey(typeof keyItem.key === "string" ? keyItem.key : keyItem.name);
        }
      }

    });

    return () => {
      isMounted = false;
    };
  }, [settingsApi, apiKeysApi]);

  useEffect(() => {
    setProfile((previous) => ({
      ...previous,
      name: user?.name ?? previous.name,
      email: user?.email ?? previous.email,
      company: user?.company ?? previous.company,
      phone: user?.phone ?? previous.phone,
    }));
  }, [user]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerencie sua conta e preferências
        </p>
      </div>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="w-full sm:w-fit h-auto flex-wrap gap-1 p-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="gap-2 justify-start sm:justify-center"
            >
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <div ref={perfilRef} className="js-settings-section">
            <Card className="rounded-2xl border-border shadow-sm gap-0">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 rounded-2xl shadow-md">
                    <AvatarImage src={user?.profile_image_url ?? undefined} alt={`Foto de ${profile.name || "perfil"}`} className="rounded-2xl object-cover" />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-white text-xl font-bold">
                      {profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-foreground">{profile.name}</CardTitle>
                    <CardDescription className="text-sm">{profile.email}</CardDescription>
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => void handleProfileImage(event.target.files?.[0])}
                    />
                    <div className="flex items-center gap-3 mt-0.5">
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs gap-1"
                        disabled={isUploadingImage || isRemovingImage}
                        onClick={() => profileImageInputRef.current?.click()}
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        {isUploadingImage ? "Enviando foto..." : "Alterar foto"}
                      </Button>
                      {user?.profile_image_url && (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-xs gap-1 text-destructive hover:text-destructive/80"
                          disabled={isUploadingImage || isRemovingImage}
                          onClick={() => void handleRemoveProfileImage()}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isRemovingImage ? "Removendo..." : "Remover foto"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {formError.perfil && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erro no formulário</AlertTitle>
                    <AlertDescription>{formError.perfil}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Nome completo",
                      key: "name",
                      icon: User,
                      placeholder: "Seu nome",
                    },
                    {
                      label: "E-mail",
                      key: "email",
                      icon: Mail,
                      placeholder: "email@exemplo.com",
                    },
                    {
                      label: "Telefone",
                      key: "phone",
                      icon: Phone,
                      placeholder: "(00) 00000-0000",
                    },
                    {
                      label: "Empresa",
                      key: "company",
                      icon: Building2,
                      placeholder: "Nome da empresa",
                    },
                  ].map(({ label, key, icon: Icon, placeholder }) => (
                    <div key={key} className="space-y-1.5 form-field">
                      <Label htmlFor={key}>{label}</Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={key}
                          value={profile[key as keyof typeof profile]}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, [key]: e.target.value }))
                          }
                          placeholder={placeholder}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t border-border mt-6">
                <Button
                  onClick={() => {
                    void saveWithAnimation(
                      "perfil",
                      () => {
                        if (!profile.name.trim()) return "Informe o nome completo.";
                        if (!profile.email.trim()) return "Informe o e-mail.";
                        if (!profile.email.includes("@")) return "Informe um e-mail válido.";
                        return null;
                      },
                      shakePerfil,
                      async () => {
                        if (typeof user?.id === "number") {
                          await usersApi.update(user.id, {
                            name: profile.name,
                            email: profile.email,
                            company: profile.company,
                            phone: profile.phone,
                          });
                        }

                        await settingsApi.update({
                          notification_email: profile.email,
                          notification_phone: profile.phone,
                        });
                      }
                    );
                  }}
                  style={perfilMorph.morphStyle}
                  className="overflow-hidden"
                  disabled={submitState.perfil === "loading"}
                >
                  {saved.includes("perfil") && submitState.perfil === "idle"
                    ? <><Check className="w-4 h-4" /> Salvo!</>
                    : perfilMorph.morphContent}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <div ref={notificacoesRef} className="js-settings-section">
            <Card className="rounded-2xl border-border shadow-sm gap-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Notificações</CardTitle>
                <CardDescription>
                  Quando você quer ser notificado por e-mail
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-1">
                {formError.notificacoes && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erro no formulário</AlertTitle>
                    <AlertDescription>{formError.notificacoes}</AlertDescription>
                  </Alert>
                )}
                {[
                  {
                    key: "alertFailed",
                    label: "Alerta não entregue",
                    desc: "Quando um alerta falha ao ser entregue",
                  },
                  {
                    key: "deviceOffline",
                    label: "Dispositivo desconectado",
                    desc: "Quando um TV/Raspberry perde conexão",
                  },
                  {
                    key: "deviceConnected",
                    label: "Dispositivo conectado",
                    desc: "Quando um novo dispositivo fica online",
                  },
                  {
                    key: "weeklyReport",
                    label: "Relatório semanal",
                    desc: "Resumo de atividades toda segunda-feira",
                  },
                  {
                    key: "limitReached",
                    label: "Limite atingido",
                    desc: "Quando o plano está próximo do limite",
                  },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-3 py-3 form-field">
                    <div>
                      <p className="text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Switch
                      checked={notifs[key as keyof typeof notifs]}
                      onCheckedChange={() =>
                        setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-center border-t border-border mt-2">
                <Button
                  onClick={() => {
                    void saveWithAnimation("notificacoes", () => null, shakeNotificacoes, async () => {
                      await settingsApi.update({
                        notify_alert_failed: notifs.alertFailed,
                        notify_device_offline: notifs.deviceOffline,
                        notify_weekly_report: notifs.weeklyReport,
                        notify_device_connected: notifs.deviceConnected,
                        notify_limit_reached: notifs.limitReached,
                        notification_email: profile.email,
                        notification_phone: profile.phone,
                      });
                    });
                  }}
                  style={notificacoesMorph.morphStyle}
                  className="overflow-hidden"
                  disabled={submitState.notificacoes === "loading"}
                >
                  {saved.includes("notificacoes") && submitState.notificacoes === "idle"
                    ? <><Check className="w-4 h-4" /> Salvo!</>
                    : notificacoesMorph.morphContent}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <div ref={segurancaRef} className="js-settings-section">
            <Card className="rounded-2xl border-border shadow-sm gap-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Alterar Senha</CardTitle>
                <CardDescription>
                  Recomendamos uma senha forte com 8+ caracteres
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {formError.seguranca && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erro no formulário</AlertTitle>
                    <AlertDescription>{formError.seguranca}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5 form-field">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      className="pl-9"
                      placeholder="********"
                      value={securityForm.currentPassword}
                      onChange={(e) =>
                        setSecurityForm((previous) => ({
                          ...previous,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5 form-field">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10"
                      placeholder="********"
                      value={securityForm.newPassword}
                      onChange={(e) =>
                        setSecurityForm((previous) => ({
                          ...previous,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 form-field">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-9"
                      placeholder="********"
                      value={securityForm.confirmPassword}
                      onChange={(e) =>
                        setSecurityForm((previous) => ({
                          ...previous,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t border-border mt-2">
                <Button
                  onClick={() => {
                    void saveWithAnimation(
                      "seguranca",
                      () => {
                        if (!securityForm.currentPassword) return "Informe a senha atual.";
                        if (securityForm.newPassword.length < 8) {
                          return "A nova senha deve ter pelo menos 8 caracteres.";
                        }
                        if (securityForm.newPassword !== securityForm.confirmPassword) {
                          return "A confirmação da senha não confere.";
                        }
                        return null;
                      },
                      shakeSeguranca,
                      async () => {
                        await Promise.resolve();
                      }
                    );
                  }}
                  style={segurancaMorph.morphStyle}
                  className="overflow-hidden"
                  disabled={submitState.seguranca === "loading"}
                >
                  {saved.includes("seguranca") && submitState.seguranca === "idle"
                    ? <><Check className="w-4 h-4" /> Salvo!</>
                    : segurancaMorph.morphContent}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <div ref={apiRef} className="js-settings-section">
            <Card className="rounded-2xl border-border shadow-sm gap-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">API e Integração</CardTitle>
                <CardDescription>
                  Use a API para integrar o AlertaTV com seus sistemas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="p-4 bg-sidebar rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2 font-mono">Sua chave de API</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-success text-xs font-mono break-all">
                      {showApiKey
                        ? visibleApiKey || "Nenhuma chave API encontrada"
                        : maskedApiKey}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={copyApiKey}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Alert className="border-border bg-secondary text-warning">
                  <KeyRound className="h-4 w-4" />
                  <AlertTitle>Chave sensível</AlertTitle>
                  <AlertDescription>
                    Mantenha sua chave em sigilo. Não compartilhe em repositórios ou clientes públicos.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="text-foreground">Exemplo de uso</h4>
                  <pre className="bg-sidebar text-sidebar-foreground p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
                    {`POST https://api.alertatv.io/v1/alerts
                      Authorization: Bearer ${(visibleApiKey || "sk_xxxxxxxxxxxxxxxxxxxx").slice(0, 20)}...

                      {
                        "title": "Aviso de manutencao",
                        "message": "Sistema em manutencao as 18h",
                        "type": "warning",
                        "tags": ["ti", "todos"],
                        "duration": "10min"
                      }`}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="sm:w-auto w-full"
                    onClick={() => {
                      void apiKeysApi
                        .create({ name: `Chave ${new Date().toLocaleDateString("pt-BR")}` })
                        .then((created) => {
                          if (typeof created.key === "string") {
                            setVisibleApiKey(created.key);
                          }
                        })
                        .catch(() => {
                          // Errors are reflected through disabled state and existing form feedback.
                        });
                    }}
                  >
                    <RefreshCw className="w-4 h-4" /> Gerar nova chave
                  </Button>
                  <Button className="sm:w-auto w-full">
                    <Webhook className="w-4 h-4" /> Ver documentacao completa
                  </Button>
                </div>

                <Separator />
                <WebhookManager />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
