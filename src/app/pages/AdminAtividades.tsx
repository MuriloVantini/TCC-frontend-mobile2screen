import { useCallback, useEffect, useMemo, useState } from "react";
import { format as formatCalendarDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, CalendarDays, RefreshCw, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router";
import { useActivityLogsApi, useUsersApi } from "../hooks/api/entities";
import type { ActivityLogResource, UserResource } from "../hooks/api/laravel-api.types";
import { useRealtimeRefresh } from "../hooks/useRealtimeRefresh";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { cn } from "../components/ui/utils";

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function toApiDate(date: Date | undefined) {
  return date ? formatCalendarDate(date, "yyyy-MM-dd") : "";
}

export function AdminAtividades() {
  const api = useMemo(() => useActivityLogsApi(), []);
  const usersApi = useMemo(() => useUsersApi(), []);
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState<ActivityLogResource[]>([]);
  const [users, setUsers] = useState<UserResource[]>([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(searchParams.get("user_id") ?? "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!fromDate) return undefined;

    return {
      from: new Date(`${fromDate}T00:00:00`),
      to: toDate ? new Date(`${toDate}T00:00:00`) : undefined,
    };
  }, [fromDate, toDate]);

  const handleRangeChange = (range: DateRange | undefined) => {
    setFromDate(toApiDate(range?.from));
    setToDate(toApiDate(range?.to));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLogs(await api.list({
        action: search || undefined,
        userId: userId ? Number(userId) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }));
    } catch {
      setError("Não foi possível carregar os registros de atividade.");
    } finally {
      setLoading(false);
    }
  }, [api, fromDate, search, toDate, userId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void usersApi.list().then(setUsers).catch(() => setUsers([])); }, [usersApi]);
  useRealtimeRefresh(() => void load(), true);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-foreground">Logs de atividade</h1><p className="text-sm text-muted-foreground">Auditoria das alterações realizadas no sistema</p></div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Atualizar</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrar por ação..." /></div>
        <Select value={userId || "all"} onValueChange={(value) => setUserId(value === "all" ? "" : value)}>
          <SelectTrigger aria-label="Filtrar por usuário">
            <SelectValue placeholder="Todos os usuários" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {users.filter((user) => user.id != null).map((user) => (
              <SelectItem key={String(user.id)} value={String(user.id)}>
                {String(user.name ?? user.email ?? `Usuário ${user.id}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-label="Selecionar intervalo de datas"
              className={cn("justify-start text-left font-normal md:col-span-2", !selectedRange?.from && "text-muted-foreground")}
            >
              <CalendarDays className="size-4" />
              {selectedRange?.from ? (
                selectedRange.to ? (
                  <span>{formatCalendarDate(selectedRange.from, "dd/MM/yyyy")} – {formatCalendarDate(selectedRange.to, "dd/MM/yyyy")}</span>
                ) : (
                  <span>{formatCalendarDate(selectedRange.from, "dd/MM/yyyy")}</span>
                )
              ) : (
                <span>Selecionar período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={handleRangeChange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Card className="gap-0 overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b border-border"><CardTitle className="flex items-center gap-2"><Activity className="size-5" /> Atividades recentes</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {!loading && logs.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nenhum registro encontrado.</p>}
            {logs.map((log) => (
              <div key={String(log.id)} className="grid gap-2 p-4 text-sm sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_150px] sm:items-center">
                <div><p className="font-medium text-foreground">{String(log.action ?? "-")}</p><p className="text-xs text-muted-foreground">{String(log.resource_type ?? "-")} {log.resource_id ? `#${log.resource_id}` : ""}</p></div>
                <div><p className="text-foreground">{String(log.user?.name ?? "Sistema")}</p><p className="text-xs text-muted-foreground">{String(log.user?.email ?? log.ip_address ?? "-")}</p></div>
                <p className="text-xs text-muted-foreground sm:text-right">{formatDate(log.created_at)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
