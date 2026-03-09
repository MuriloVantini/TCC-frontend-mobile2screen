import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  Layers,
  Filter,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Navigation,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Info,
  Cpu,
  Tv,
} from "lucide-react";
import { useMockMapApi } from "../hooks/api/useMockMapApi";
import type { MapPoint } from "../interfaces/types/map";

const MAP_CENTER: [number, number] = [-22.6604, -50.4188];
const INITIAL_ZOOM = 14;

const typeIcon = {
  rpi: Cpu,
  tv: Tv,
};

const typeColor: Record<string, string> = {
  rpi: "var(--color-success)",
  tv: "var(--color-primary)",
};

const typeLayerKey: Record<string, string> = {
  rpi: "rpi",
  tv: "tv",
};

const statusBadge = {
  active: { label: "Ativo", cls: "bg-secondary text-success" },
  alert: { label: "Atenção", cls: "bg-secondary text-warning" },
  inactive: { label: "Inativo", cls: "bg-muted text-muted-foreground" },
};

function makeMarkerIcon(color: string, isAlert: boolean): L.DivIcon {
  const pulse = isAlert
    ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.4;animation:lf-ping 1.4s cubic-bezier(0,0,.2,1) infinite;"></div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid var(--color-card);box-shadow:0 1px 6px color-mix(in oklab, var(--color-foreground) 35%, transparent);"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

export function MapaInterativo() {
  const { mapPoints, layerDefs } = useMockMapApi();
  const [search, setSearch] = useState("");
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layerDefs.map((l) => [l.id, l.active]))
  );
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAP_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const groups: Record<string, L.LayerGroup> = { rpi: L.layerGroup(), tv: L.layerGroup() };

    mapPoints.forEach((point) => {
      const marker = L.marker([point.lat, point.lng], {
        icon: makeMarkerIcon(typeColor[point.type], point.status === "alert"),
      });
      marker.on("click", () => setSelectedPoint(point));
      groups[typeLayerKey[point.type]].addLayer(marker);
    });

    layerDefs.forEach(({ id, active }) => {
      if (active) groups[id].addTo(map);
    });

    layerGroupsRef.current = groups;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(activeLayers).forEach(([key, active]) => {
      const group = layerGroupsRef.current[key];
      if (!group) return;
      if (active && !map.hasLayer(group)) group.addTo(map);
      if (!active && map.hasLayer(group)) map.removeLayer(group);
    });
  }, [activeLayers]);

  useEffect(() => {
    if (!selectedPoint || !mapRef.current) return;
    mapRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 16, {
      animate: true,
      duration: 0.8,
    });
  }, [selectedPoint]);

  useEffect(() => {
    if (!panelRef.current) return;
    animate(panelRef.current, {
      translateX: [-20, 0],
      opacity: [0, 1],
      duration: 550,
      ease: "outExpo",
    });
  }, []);

  const filtered = mapPoints.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLayer = (id: string) =>
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: "100%" }}>
      {/* Mobile toggle */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-card border-b border-border shrink-0">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"
        >
          <Filter className="w-4 h-4" />
          {showPanel ? "Ocultar Filtros" : "Filtros e Resultados"}
        </button>
        <span className="text-xs text-muted-foreground">{filtered.length} pontos encontrados</span>
      </div>

      {/* Left panel */}
      <aside
        ref={panelRef}
        className={`
          ${showPanel ? "flex" : "hidden"} md:flex
          flex-col w-full md:w-72 lg:w-80 bg-card border-b md:border-b-0 md:border-r border-border
          overflow-y-auto shrink-0 md:h-full
          max-h-72 md:max-h-full
        `}
      >
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar pontos..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Layers */}
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Camadas
          </p>
          <div className="space-y-2">
            {layerDefs.map(({ id, label, icon: Icon, color }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <button
                  onClick={() => toggleLayer(id)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${activeLayers[id] ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                    }`}
                >
                  {activeLayers[id] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {activeLayers[id] ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Resultados ({filtered.length})</p>
          </div>
          <div className="space-y-1 px-2 pb-4">
            {filtered.map((point) => {
              const Icon = typeIcon[point.type as keyof typeof typeIcon];
              const status = statusBadge[point.status as keyof typeof statusBadge];
              return (
                <button
                  key={point.id}
                  onClick={() => { setSelectedPoint(point); setShowPanel(false); }}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted ${selectedPoint?.id === point.id ? "bg-accent border border-border" : ""
                    }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: typeColor[point.type] + "20" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: typeColor[point.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight truncate">{point.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{point.desc}</p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden min-h-64">
        {/* Leaflet mount target */}
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Custom zoom / nav controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2" style={{ zIndex: 1001 }}>
          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="flex items-center justify-center w-9 h-9 hover:bg-muted border-b border-border"
            >
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="flex items-center justify-center w-9 h-9 hover:bg-muted"
            >
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={() => mapRef.current?.flyTo(MAP_CENTER, INITIAL_ZOOM, { animate: true, duration: 0.8 })}
            className="w-9 h-9 bg-card rounded-xl shadow-md border border-border flex items-center justify-center hover:bg-muted"
          >
            <LocateFixed className="w-4 h-4 text-primary" />
          </button>
          <button className="w-9 h-9 bg-card rounded-xl shadow-md border border-border flex items-center justify-center hover:bg-muted">
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Point detail card */}
        {selectedPoint && (
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:left-4 md:translate-x-0 w-72 bg-card rounded-xl shadow-2xl overflow-hidden"
            style={{ zIndex: 1001 }}
          >
            <div className="h-1.5" style={{ background: typeColor[selectedPoint.type] }} />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeIcon[selectedPoint.type as keyof typeof typeIcon];
                    return <Icon className="w-4 h-4" style={{ color: typeColor[selectedPoint.type] }} />;
                  })()}
                  <h4 className="text-foreground text-sm leading-tight">{selectedPoint.label}</h4>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{selectedPoint.desc}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[selectedPoint.status as keyof typeof statusBadge].cls}`}>
                  {statusBadge[selectedPoint.status as keyof typeof statusBadge].label}
                </span>
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Info className="w-3 h-3" />
                  Ver detalhes
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <p className="text-muted-foreground">Coordenadas</p>
                  <p className="text-foreground">
                    {Math.abs(selectedPoint.lat).toFixed(4)}°S, {Math.abs(selectedPoint.lng).toFixed(4)}°O
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="text-foreground">PT-{String(selectedPoint.id).padStart(4, "0")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

