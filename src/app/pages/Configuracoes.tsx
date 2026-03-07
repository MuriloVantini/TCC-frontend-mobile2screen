import { useEffect, useState } from "react";
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
  CheckCircle2,
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
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";

const sections = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "api", label: "API & Integração", icon: Webhook },
];

const fakeApiKey = "atv_prod_sk_4f8a2b1c9d3e7f6g5h0i1j2k3l4m5n6o7p8q9r";

export function Configuracoes() {
  const [active, setActive] = useState("perfil");
  const [saved, setSaved] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookEvents, setWebhookEvents] = useState<Record<string, boolean>>({
    "Alerta entregue": true,
    "Alerta falhou": true,
    "Dispositivo online": false,
    "Dispositivo offline": false,
  });

  const [profile, setProfile] = useState({ name: "João Silva", email: "joao@empresa.com.br", phone: "(11) 99999-0000", company: "Empresa Ltda" });

  const [notifs, setNotifs] = useState({
    alertFailed: true,
    deviceOffline: true,
    weeklyReport: false,
    deviceConnected: true,
    limitReached: true,
  });

  const handleSave = (section: string) => {
    setSaved((p) => [...p, section]);
    setTimeout(() => setSaved((p) => p.filter((s) => s !== section)), 2500);
  };

  const copyApiKey = () => {
    navigator.clipboard?.writeText(fakeApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    animate(".js-settings-section", {
      opacity: [0, 1],
      translateY: [0, 16],
      duration: 380,
      ease: "outCubic",
    });
  }, [active]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-slate-800">Configuracoes</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Gerencie sua conta e preferencias
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
          <Card className="js-settings-section rounded-2xl border-slate-100 shadow-sm gap-0">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">JS</span>
                </div>
                <div>
                  <CardTitle className="text-slate-800">{profile.name}</CardTitle>
                  <CardDescription className="text-sm">{profile.email}</CardDescription>
                  <Button variant="link" className="h-auto p-0 text-xs mt-0.5">
                    Alterar foto
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{label}</Label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
            <CardFooter className="justify-end border-t border-slate-100 mt-6">
              <Button onClick={() => handleSave("perfil")}>
                {saved.includes("perfil") ? (
                  <>
                    <Check className="w-4 h-4" /> Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Salvar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card className="js-settings-section rounded-2xl border-slate-100 shadow-sm gap-0">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800">Notificacoes</CardTitle>
              <CardDescription>
                Quando voce quer ser notificado por e-mail
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              {[
                {
                  key: "alertFailed",
                  label: "Alerta nao entregue",
                  desc: "Quando um alerta falha ao ser entregue",
                },
                {
                  key: "deviceOffline",
                  label: "Dispositivo desconectado",
                  desc: "Quando um TV/Raspberry perde conexao",
                },
                {
                  key: "deviceConnected",
                  label: "Dispositivo conectado",
                  desc: "Quando um novo dispositivo fica online",
                },
                {
                  key: "weeklyReport",
                  label: "Relatorio semanal",
                  desc: "Resumo de atividades toda segunda-feira",
                },
                {
                  key: "limitReached",
                  label: "Limite atingido",
                  desc: "Quando o plano esta proximo do limite",
                },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
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
            <CardFooter className="justify-end border-t border-slate-100 mt-2">
              <Button onClick={() => handleSave("notificacoes")}>
                {saved.includes("notificacoes") ? (
                  <>
                    <Check className="w-4 h-4" /> Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Salvar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="js-settings-section rounded-2xl border-slate-100 shadow-sm gap-0">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800">Alterar Senha</CardTitle>
              <CardDescription>
                Recomendamos uma senha forte com 8+ caracteres
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Senha atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="current-password" type="password" className="pl-9" placeholder="********" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="********"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="confirm-password" type="password" className="pl-9" placeholder="********" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 mt-2">
              <Button onClick={() => handleSave("seguranca")}>
                {saved.includes("seguranca") ? (
                  <>
                    <Check className="w-4 h-4" /> Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Alterar senha
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <Card className="js-settings-section rounded-2xl border-slate-100 shadow-sm gap-0">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800">API e Integracao</CardTitle>
              <CardDescription>
                Use a API para integrar o AlertaTV com seus sistemas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="p-4 bg-slate-900 rounded-xl">
                <p className="text-xs text-slate-400 mb-2 font-mono">Sua chave de API</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-emerald-400 text-xs font-mono break-all">
                    {showApiKey
                      ? fakeApiKey
                      : fakeApiKey.replace(/./g, "*").slice(0, 48)}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyApiKey}
                    className="text-slate-400 hover:text-white"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50 text-amber-700">
                <KeyRound className="h-4 w-4" />
                <AlertTitle>Chave sensivel</AlertTitle>
                <AlertDescription>
                  Mantenha sua chave em sigilo. Nao compartilhe em repositorios ou clientes publicos.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="text-slate-700">Exemplo de uso</h4>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
                  {`POST https://api.alertatv.io/v1/alerts
Authorization: Bearer ${fakeApiKey.slice(0, 20)}...

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
                <Button variant="outline" className="sm:w-auto w-full">
                  <RefreshCw className="w-4 h-4" /> Gerar nova chave
                </Button>
                <Button className="sm:w-auto w-full">
                  <Webhook className="w-4 h-4" /> Ver documentacao completa
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-slate-700">Webhooks</h4>
                <div className="space-y-1.5">
                  <Label htmlFor="webhook-url">URL de callback</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://seusite.com.br/webhook/alertatv"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.keys(webhookEvents).map((eventName) => (
                    <Label
                      key={eventName}
                      htmlFor={`event-${eventName}`}
                      className="border rounded-md px-2.5 py-1.5 cursor-pointer font-normal"
                    >
                      <Checkbox
                        id={`event-${eventName}`}
                        checked={webhookEvents[eventName]}
                        onCheckedChange={(checked) =>
                          setWebhookEvents((previous) => ({
                            ...previous,
                            [eventName]: Boolean(checked),
                          }))
                        }
                      />
                      {eventName}
                    </Label>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Badge variant={copied ? "default" : "outline"} className="gap-1.5">
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Webhook className="w-3 h-3" />}
                    {copied ? "Chave copiada" : "Webhook ativo"}
                  </Badge>
                  <Button onClick={() => handleSave("api")}>
                    {saved.includes("api") ? (
                      <>
                        <Check className="w-4 h-4" /> Salvo!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Salvar webhook
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
