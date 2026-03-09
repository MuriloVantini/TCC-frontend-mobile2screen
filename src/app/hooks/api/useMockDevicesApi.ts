import type { DevicesApiHookContract } from "../../interfaces/contracts/api-hooks";

export function useMockDevicesApi(): DevicesApiHookContract {
  return {
    devices: [
      { id: 1, name: "TV Recepcao Principal", type: "tv", online: true, tags: ["recepcao", "todos"], location: "Terreo", lastSeen: "agora", ip: "192.168.1.101" },
      { id: 2, name: "RPi Sala Reuniao A", type: "rpi", online: true, tags: ["sala-reuniao", "diretoria"], location: "2o Andar", lastSeen: "ha 2 min", ip: "192.168.1.102" },
      { id: 3, name: "TV Producao Linha 1", type: "tv", online: false, tags: ["producao", "seguranca"], location: "Galpao", lastSeen: "ha 3h", ip: "192.168.1.103" },
      { id: 4, name: "TV RH", type: "tv", online: true, tags: ["rh", "todos"], location: "3o Andar", lastSeen: "ha 1 min", ip: "192.168.1.104" },
      { id: 5, name: "RPi Portaria", type: "rpi", online: true, tags: ["portaria", "seguranca", "todos"], location: "Entrada", lastSeen: "agora", ip: "192.168.1.105" },
      { id: 6, name: "TV Refeitorio", type: "tv", online: false, tags: ["refeitorio", "todos"], location: "Subsolo", lastSeen: "ha 1 dia", ip: "192.168.1.106" },
    ],
  };
}
