import type { MapApiHookContract } from "../../interfaces/contracts/api-hooks";
import { Cpu, Tv } from "lucide-react";

export function useMockMapApi(): MapApiHookContract {
  return {
    mapPoints: [
      { id: 1, lat: -22.6574, lng: -50.4176, type: "tv", label: "TV #1082", desc: "Canal: 12 - Online", status: "active" },
      { id: 2, lat: -22.6521, lng: -50.423, type: "rpi", label: "Raspberry #B-14", desc: "CPU: 43% - Temperatura normal", status: "active" },
      { id: 3, lat: -22.6648, lng: -50.4105, type: "tv", label: "TV #205", desc: "Canal: 7 - Sinal instavel", status: "alert" },
      { id: 4, lat: -22.671, lng: -50.4252, type: "rpi", label: "Raspberry #14", desc: "Carga: 61% - Ativo", status: "active" },
      { id: 5, lat: -22.6583, lng: -50.432, type: "rpi", label: "Raspberry #RES-02", desc: "Memoria: 58% - Normal", status: "active" },
      { id: 6, lat: -22.669, lng: -50.405, type: "tv", label: "TV #3301", desc: "Canal: sem sinal", status: "inactive" },
      { id: 7, lat: -22.675, lng: -50.414, type: "rpi", label: "Raspberry #CENTRAL", desc: "CPU: 72% - Monitorando", status: "active" },
    ],
    layerDefs: [
      { id: "rpi", label: "Raspberry", icon: Cpu, color: "text-emerald-600", active: true },
      { id: "tv", label: "TV", icon: Tv, color: "text-blue-600", active: true },
    ],
  };
}
