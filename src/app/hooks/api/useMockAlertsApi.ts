import type { AlertsApiHookContract } from "../../interfaces/contracts/api-hooks";

export function useMockAlertsApi(): AlertsApiHookContract {
  return {
    activityData: [
      { hora: "08h", alertas: 2 },
      { hora: "09h", alertas: 5 },
      { hora: "10h", alertas: 3 },
      { hora: "11h", alertas: 8 },
      { hora: "12h", alertas: 1 },
      { hora: "13h", alertas: 4 },
      { hora: "14h", alertas: 6 },
      { hora: "15h", alertas: 9 },
      { hora: "16h", alertas: 3 },
      { hora: "17h", alertas: 7 },
    ],
    recentAlerts: [
      { id: 1, title: "Reuniao em 10 minutos", type: "info", tags: ["sala-reuniao", "diretoria"], devices: 3, status: "delivered", time: "ha 5 min" },
      { id: 2, title: "ALERTA: Saida de emergencia bloqueada", type: "critical", tags: ["producao", "seguranca"], devices: 8, status: "delivered", time: "ha 23 min" },
      { id: 3, title: "Sistema em manutencao as 18h", type: "warning", tags: ["ti", "todos"], devices: 12, status: "delivered", time: "ha 1h" },
      { id: 4, title: "Bem-vindo ao novo colaborador", type: "success", tags: ["recepcao"], devices: 2, status: "failed", time: "ha 2h" },
    ],
    alertHistory: [
      { id: 1, title: "Reuniao em 10 minutos - Sala A", message: "Confirme sua presenca com o organizador.", type: "info", tags: ["sala-reuniao", "diretoria"], devices: 3, delivered: 3, failed: 0, duration: "1 minuto", sentAt: "28/02/2026 14:52" },
      { id: 2, title: "EMERGENCIA: Saida bloqueada", message: "A saida da Linha 1 esta bloqueada. Evacuar imediatamente.", type: "critical", tags: ["producao", "seguranca"], devices: 6, delivered: 5, failed: 1, duration: "Indefinido", sentAt: "28/02/2026 13:30" },
      { id: 3, title: "Sistema em manutencao as 18h", message: "O sistema ficara indisponivel das 18h as 19h.", type: "warning", tags: ["ti", "todos"], devices: 12, delivered: 10, failed: 2, duration: "10 minutos", sentAt: "28/02/2026 11:00" },
      { id: 4, title: "Bem-vindo, Rafael", message: "Nosso novo colega Rafael inicia hoje no setor de TI.", type: "success", tags: ["recepcao"], devices: 2, delivered: 2, failed: 0, duration: "5 minutos", sentAt: "28/02/2026 09:15" },
    ],
  };
}
