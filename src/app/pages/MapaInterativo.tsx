import { useState } from "react";
import {
  Search,
  Layers,
  MapPin,
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
  Building2,
  TreePine,
  Zap,
  Droplets,
} from "lucide-react";

const mapPoints = [
  { id: 1, x: 25, y: 30, type: "building", label: "Lote Comercial #1082", desc: "Área: 450m² · Zona Comercial", status: "active" },
  { id: 2, x: 55, y: 20, type: "park", label: "Área Verde Setor B", desc: "Área: 2.300m² · Preservação", status: "active" },
  { id: 3, x: 70, y: 45, type: "building", label: "Edifício Residencial #205", desc: "Área: 1.200m² · Zona Residencial", status: "alert" },
  { id: 4, x: 40, y: 60, type: "infrastructure", label: "Estação de Energia #14", desc: "Capacidade: 500kW · Ativo", status: "active" },
  { id: 5, x: 80, y: 70, type: "water", label: "Reservatório Municipal", desc: "Volume: 50.000m³ · Normal", status: "active" },
  { id: 6, x: 15, y: 65, type: "building", label: "Lote Residencial #3301", desc: "Área: 280m² · Zona Residencial", status: "inactive" },
  { id: 7, x: 60, y: 80, type: "park", label: "Parque Ecológico Central", desc: "Área: 8.500m² · Conservação", status: "active" },
];

const layers = [
  { id: "edificacoes", label: "Edificações", icon: Building2, color: "text-blue-600", active: true },
  { id: "areas_verdes", label: "Áreas Verdes", icon: TreePine, color: "text-emerald-600", active: true },
  { id: "infraestrutura", label: "Infraestrutura", icon: Zap, color: "text-amber-600", active: false },
  { id: "hidrografia", label: "Hidrografia", icon: Droplets, color: "text-cyan-600", active: true },
];

const typeIcon = {
  building: Building2,
  park: TreePine,
  infrastructure: Zap,
  water: Droplets,
};

const typeColor = {
  building: "#2563eb",
  park: "#16a34a",
  infrastructure: "#d97706",
  water: "#0891b2",
};

const statusBadge = {
  active: { label: "Ativo", cls: "bg-emerald-100 text-emerald-700" },
  alert: { label: "Atenção", cls: "bg-amber-100 text-amber-700" },
  inactive: { label: "Inativo", cls: "bg-gray-100 text-gray-500" },
};

export function MapaInterativo() {
  const [search, setSearch] = useState("");
  const [activeLayers, setActiveLayers] = useState(
    Object.fromEntries(layers.map((l) => [l.id, l.active]))
  );
  const [selectedPoint, setSelectedPoint] = useState<typeof mapPoints[0] | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [zoom, setZoom] = useState(100);

  const filtered = mapPoints.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePointClick = (point: typeof mapPoints[0]) => {
    setSelectedPoint(point);
  };

  return (
    <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: "100%" }}>
      {/* Mobile toggle for panel */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
        >
          <Filter className="w-4 h-4" />
          {showPanel ? "Ocultar Filtros" : "Filtros e Resultados"}
        </button>
        <span className="text-xs text-gray-500">{filtered.length} pontos encontrados</span>
      </div>

      {/* Left panel */}
      <aside
        className={`
          ${showPanel ? "flex" : "hidden"} md:flex
          flex-col w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200
          overflow-y-auto shrink-0 md:h-full
          max-h-72 md:max-h-full
        `}
      >
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar pontos..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Layers */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Camadas
          </p>
          <div className="space-y-2">
            {layers.map(({ id, label, icon: Icon, color }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <button
                  onClick={() => toggleLayer(id)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                    activeLayers[id]
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {activeLayers[id] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {activeLayers[id] ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Resultados ({filtered.length})
            </p>
          </div>
          <div className="space-y-1 px-2 pb-4">
            {filtered.map((point) => {
              const Icon = typeIcon[point.type as keyof typeof typeIcon];
              const status = statusBadge[point.status as keyof typeof statusBadge];
              return (
                <button
                  key={point.id}
                  onClick={() => { setSelectedPoint(point); setShowPanel(false); }}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-gray-50 ${
                    selectedPoint?.id === point.id ? "bg-blue-50 border border-blue-200" : ""
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: typeColor[point.type as keyof typeof typeColor] + "20" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: typeColor[point.type as keyof typeof typeColor] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-tight truncate">{point.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{point.desc}</p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden bg-[#e8f0e8] min-h-64">
        {/* Map background */}
        <div className="absolute inset-0" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center", transition: "transform 0.2s" }}>
          {/* Road network SVG overlay */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background zones */}
            <rect x="0" y="0" width="100" height="100" fill="#e8ede8" />
            <rect x="5" y="5" width="35" height="40" fill="#dce8dc" rx="1" />
            <rect x="45" y="5" width="50" height="30" fill="#d4e8d4" rx="1" />
            <rect x="5" y="50" width="30" height="45" fill="#dce4dc" rx="1" />
            <rect x="40" y="40" width="55" height="55" fill="#e0e8e0" rx="1" />
            {/* Water */}
            <path d="M70,10 Q75,15 78,20 Q80,25 82,30 L85,40 L88,60" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.7" />
            {/* Roads */}
            <line x1="0" y1="40" x2="100" y2="40" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="70" x2="100" y2="70" stroke="white" strokeWidth="1" />
            <line x1="38" y1="0" x2="38" y2="100" stroke="white" strokeWidth="1.5" />
            <line x1="65" y1="0" x2="65" y2="100" stroke="white" strokeWidth="1" />
            <line x1="10" y1="20" x2="38" y2="40" stroke="white" strokeWidth="0.8" />
            <line x1="65" y1="55" x2="100" y2="50" stroke="white" strokeWidth="0.8" />
            {/* Grid */}
            {[15, 25, 50, 55, 85].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="white" strokeWidth="0.4" opacity="0.4" />
            ))}
            {[10, 30, 55, 80, 90].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeWidth="0.4" opacity="0.4" />
            ))}
            {/* Map points */}
            {mapPoints.map((point) => (
              <g key={point.id} onClick={() => handlePointClick(point)} style={{ cursor: "pointer" }}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={typeColor[point.type as keyof typeof typeColor]}
                  stroke="white"
                  strokeWidth="0.8"
                  opacity={selectedPoint?.id === point.id ? 1 : 0.85}
                />
                {selectedPoint?.id === point.id && (
                  <circle cx={point.x} cy={point.y} r="5" fill={typeColor[point.type as keyof typeof typeColor]} opacity="0.3" />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <button
              onClick={() => setZoom((z) => Math.min(z + 10, 150))}
              className="flex items-center justify-center w-9 h-9 hover:bg-gray-50 border-b border-gray-100"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 10, 60))}
              className="flex items-center justify-center w-9 h-9 hover:bg-gray-50"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button className="w-9 h-9 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <LocateFixed className="w-4 h-4 text-blue-600" />
          </button>
          <button className="w-9 h-9 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Navigation className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
          <div className="w-12 h-1 bg-gray-800 rounded" />
          500m
        </div>

        {/* Coord indicator */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 border border-gray-200 text-xs text-gray-500">
          -15.7801° S · -47.9292° O
        </div>

        {/* Detail Modal */}
        {selectedPoint && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:left-4 md:translate-x-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div
              className="h-1.5"
              style={{ background: typeColor[selectedPoint.type as keyof typeof typeColor] }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeIcon[selectedPoint.type as keyof typeof typeIcon];
                    return <Icon className="w-4 h-4" style={{ color: typeColor[selectedPoint.type as keyof typeof typeColor] }} />;
                  })()}
                  <h4 className="text-gray-800 text-sm leading-tight">{selectedPoint.label}</h4>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{selectedPoint.desc}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusBadge[selectedPoint.status as keyof typeof statusBadge].cls
                  }`}
                >
                  {statusBadge[selectedPoint.status as keyof typeof statusBadge].label}
                </span>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Info className="w-3 h-3" />
                  Ver detalhes
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <p className="text-gray-400">Coordenadas</p>
                  <p className="text-gray-700">{selectedPoint.x}°N, {selectedPoint.y}°O</p>
                </div>
                <div>
                  <p className="text-gray-400">ID</p>
                  <p className="text-gray-700">PT-{String(selectedPoint.id).padStart(4, "0")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}