import React, { useState } from 'react';
import { 
  SupplyNode, 
  AidRequest, 
  RegionTag 
} from '../types';
import { 
  Building2, 
  Cross, 
  Home, 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Layers, 
  Compass, 
  AlertTriangle,
  ArrowRight,
  Shield,
  X
} from 'lucide-react';

interface InteractiveMapProps {
  nodes: SupplyNode[];
  requests: AidRequest[];
  onSelectRequest: (req: AidRequest) => void;
  onOpenCoordinationWithNode?: (node: SupplyNode) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  requests,
  onSelectRequest,
  onOpenCoordinationWithNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<SupplyNode | null>(nodes[0] || null);
  const [selectedRequestBeacon, setSelectedRequestBeacon] = useState<AidRequest | null>(null);
  const [activeRegionFilter, setActiveRegionFilter] = useState<RegionTag | 'All'>('All');
  
  // Layer toggles
  const [showHubs, setShowHubs] = useState(true);
  const [showDepots, setShowDepots] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showMobiles, setShowMobiles] = useState(true);
  const [showBeacons, setShowBeacons] = useState(true);
  const [showCoverageRadius, setShowCoverageRadius] = useState(true);

  // Filtered nodes
  const filteredNodes = nodes.filter(n => {
    if (activeRegionFilter !== 'All' && n.region !== activeRegionFilter) return false;
    if (n.type === 'Regional Storage Hub' && !showHubs) return false;
    if (n.type === 'Community Depot' && !showDepots) return false;
    if (n.type === 'Medical Relief Cache' && !showMedical) return false;
    if (n.type === 'Mobile Dispatch Unit' && !showMobiles) return false;
    return true;
  });

  const filteredRequests = requests.filter(r => {
    if (!showBeacons) return false;
    if (activeRegionFilter !== 'All' && r.region !== activeRegionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Spatial Logistics Topology</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{nodes.length} Nodes</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{requests.length} Relief Points</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Interactive Local Supply Map
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Simulated vector telemetry of regional stockpiles, neighborhood distribution points, and active transit corridors.
          </p>
        </div>

        {/* Region Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">District:</span>
          <select
            value={activeRegionFilter}
            onChange={(e) => setActiveRegionFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Municipal Districts</option>
            <option value="North Ward">North Ward</option>
            <option value="East River Basin">East River Basin</option>
            <option value="South Industrial">South Industrial</option>
            <option value="Highland Ridge">Highland Ridge</option>
            <option value="West Central">West Central</option>
          </select>
        </div>
      </div>

      {/* Layer Controls Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">Map Layers:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHubs(!showHubs)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showHubs
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Regional Hubs
          </button>

          <button
            type="button"
            onClick={() => setShowMedical(!showMedical)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showMedical
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Medical Caches
          </button>

          <button
            type="button"
            onClick={() => setShowDepots(!showDepots)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showDepots
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Community Depots
          </button>

          <button
            type="button"
            onClick={() => setShowMobiles(!showMobiles)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showMobiles
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Mobile Units
          </button>

          <button
            type="button"
            onClick={() => setShowBeacons(!showBeacons)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showBeacons
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Aid Need Beacons
          </button>

          <button
            type="button"
            onClick={() => setShowCoverageRadius(!showCoverageRadius)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showCoverageRadius
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            Coverage Radii
          </button>
        </div>
      </div>

      {/* Main Map Viewport + Sidebar Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Map Visual (SVG Graphic Topography) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden relative shadow-md">
          
          {/* Map Top Bar Information Overlay */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">District Grid Mesh</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono text-[11px]">WGS-84 Local Coordinates</span>
          </div>

          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-300">
            <span>LAT 37.774 · LON -122.419</span>
          </div>

          {/* SVG Canvas Map */}
          <div className="relative w-full aspect-[16/11] select-none">
            <svg 
              viewBox="0 0 1000 700" 
              className="w-full h-full cursor-crosshair"
              aria-label="Civic Aid Vector Map"
            >
              <defs>
                {/* Radial gradients for node pulses */}
                <radialGradient id="pulse-hub" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulse-beacon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulse-coverage" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>

                {/* Grid pattern */}
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Background dark grid */}
              <rect width="1000" height="700" fill="#0b1120" />
              <rect width="1000" height="700" fill="url(#map-grid)" />

              {/* District Territory Polygons */}
              {/* Highland Ridge (North) */}
              <path
                d="M 50 20 L 500 20 L 600 200 L 200 240 Z"
                fill="#1e293b"
                fillOpacity="0.3"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="180" y="80" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="2">
                HIGHLAND RIDGE SECTOR
              </text>

              {/* North Ward */}
              <path
                d="M 50 200 L 380 220 L 350 420 L 60 380 Z"
                fill="#1e293b"
                fillOpacity="0.3"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="100" y="280" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="2">
                NORTH WARD
              </text>

              {/* West Central */}
              <path
                d="M 60 400 L 460 420 L 420 680 L 80 660 Z"
                fill="#1e293b"
                fillOpacity="0.35"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="120" y="520" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="2">
                WEST CENTRAL DISTRICT
              </text>

              {/* South Industrial */}
              <path
                d="M 460 460 L 920 480 L 900 680 L 450 680 Z"
                fill="#1e293b"
                fillOpacity="0.3"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="620" y="620" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="2">
                SOUTH INDUSTRIAL CORRIDOR
              </text>

              {/* East River Basin */}
              <path
                d="M 600 80 L 950 120 L 920 460 L 580 440 Z"
                fill="#1e293b"
                fillOpacity="0.3"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="700" y="240" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="2">
                EAST RIVER BASIN
              </text>

              {/* River Channel (Fluid Organic Flow) */}
              <path
                d="M 520 0 Q 560 180 510 320 T 570 540 Q 610 640 590 700"
                fill="none"
                stroke="#0284c7"
                strokeWidth="32"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
              <path
                d="M 520 0 Q 560 180 510 320 T 570 540 Q 610 640 590 700"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="12"
                strokeOpacity="0.8"
                strokeLinecap="round"
              />
              <text x="560" y="340" fill="#38bdf8" fontSize="11" fontWeight="600" letterSpacing="1" transform="rotate(78 560 340)">
                MUNICIPAL WATER CHANNEL
              </text>

              {/* River Bridges */}
              <line x1="480" y1="260" x2="560" y2="280" stroke="#f1f5f9" strokeWidth="4" strokeDasharray="6 3" />
              <line x1="510" y1="460" x2="600" y2="475" stroke="#f1f5f9" strokeWidth="4" strokeDasharray="6 3" />

              {/* Arterial Transport Corridors (Highways / Relief Corridors) */}
              <path
                d="M 100 240 L 480 260 L 760 220 L 940 300"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />
              <path
                d="M 380 50 L 360 360 L 510 460 L 640 680"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <path
                d="M 120 580 L 460 520 L 780 550"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Coverage Radii (Simulated Reach of Storage Hubs) */}
              {showCoverageRadius && filteredNodes.map((node) => {
                if (node.type === 'Regional Storage Hub' || node.type === 'Medical Relief Cache') {
                  const cx = node.coordinates.x * 10;
                  const cy = node.coordinates.y * 7;
                  return (
                    <g key={`cov-${node.id}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="140"
                        fill="url(#pulse-coverage)"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        strokeOpacity="0.4"
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* Active Mobile Courier Route Vectors */}
              {showMobiles && (
                <g>
                  {/* Route trail from East Basin Depot to St. Jude */}
                  <path
                    d="M 780 280 Q 720 310 640 336"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                  />
                  <line x1="640" y1="336" x2="630" y2="340" stroke="#38bdf8" strokeWidth="3" />
                </g>
              )}

              {/* Supply Node Markers */}
              {filteredNodes.map((node) => {
                const cx = node.coordinates.x * 10;
                const cy = node.coordinates.y * 7;
                const isSelected = selectedNode?.id === node.id;

                let iconColor = '#8b5cf6'; // Hub (Purple)
                if (node.type === 'Medical Relief Cache') iconColor = '#14b8a6'; // Teal
                if (node.type === 'Community Depot') iconColor = '#f59e0b'; // Amber
                if (node.type === 'Mobile Dispatch Unit') iconColor = '#38bdf8'; // Blue

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-150 hover:scale-110"
                    onClick={() => {
                      setSelectedNode(node);
                      setSelectedRequestBeacon(null);
                    }}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="24"
                        fill="none"
                        stroke={iconColor}
                        strokeWidth="2"
                        strokeOpacity="0.8"
                      />
                    )}

                    {/* Outer circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="#0f172a"
                      stroke={iconColor}
                      strokeWidth="2.5"
                    />

                    {/* Inner glyph */}
                    {node.type === 'Regional Storage Hub' && (
                      <rect x={cx - 5} y={cy - 5} width="10" height="10" fill={iconColor} rx="1" />
                    )}
                    {node.type === 'Medical Relief Cache' && (
                      <path
                        d={`M ${cx - 2} ${cy - 6} h 4 v 4 h 4 v 4 h -4 v 4 h -4 v -4 h -4 v -4 h 4 Z`}
                        fill={iconColor}
                      />
                    )}
                    {node.type === 'Community Depot' && (
                      <circle cx={cx} cy={cy} r="5" fill={iconColor} />
                    )}
                    {node.type === 'Mobile Dispatch Unit' && (
                      <polygon
                        points={`${cx},${cy - 6} ${cx + 6},${cy + 5} ${cx},${cy + 2} ${cx - 6},${cy + 5}`}
                        fill={iconColor}
                      />
                    )}

                    {/* Label Tag */}
                    <text
                      x={cx}
                      y={cy + 26}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                    </text>
                  </g>
                );
              })}

              {/* Active Aid Request Beacons (Distress pins with beacon waves) */}
              {showBeacons && filteredRequests.map((req) => {
                const cx = req.coordinates.x * 10;
                const cy = req.coordinates.y * 7;
                const isSelected = selectedRequestBeacon?.id === req.id;
                const isHigh = req.urgency === 'High';

                return (
                  <g
                    key={`beacon-${req.id}`}
                    className="cursor-pointer transition-transform duration-150 hover:scale-110"
                    onClick={() => {
                      setSelectedRequestBeacon(req);
                      setSelectedNode(null);
                    }}
                  >
                    {/* Pulsing distress radar circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHigh ? '20' : '15'}
                      fill="url(#pulse-beacon)"
                      stroke="#ef4444"
                      strokeWidth={isHigh ? '1.5' : '1'}
                      strokeOpacity="0.7"
                    />

                    {/* Beacon Pin */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill={isHigh ? '#dc2626' : '#ea580c'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    <circle cx={cx} cy={cy} r="3" fill="#ffffff" />

                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="28"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    <text
                      x={cx}
                      y={cy - 14}
                      fill="#fca5a5"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {req.id}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>

          {/* Map Footer Legend */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                <span>Regional Hub</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>Medical Relief Cache</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Community Depot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Mobile Dispatch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Aid Need Beacon</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Click any node or beacon to inspect live capacity
            </div>
          </div>
        </div>

        {/* Sidebar Inspection Drawer (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          
          {selectedNode ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedNode.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedNode.type}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedNode.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    selectedNode.status === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : selectedNode.status === 'High Capacity'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
              </div>

              {/* Location & Coordinator Contacts */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedNode.address} ({selectedNode.region})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedNode.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedNode.coordinator} · {selectedNode.phone}</span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Storage Capacity</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {selectedNode.capacityPercent}% Full
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedNode.capacityPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedNode.capacityPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  {selectedNode.activeDispatchesCount} active dispatches originating from this point.
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Current Stocked Inventory
                </h4>
                <div className="space-y-1.5">
                  {selectedNode.inventorySummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {item.count.toLocaleString()} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onOpenCoordinationWithNode?.(selectedNode)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Stage Supplies at this Node</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : selectedRequestBeacon ? (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <span className="font-mono">{selectedRequestBeacon.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedRequestBeacon.category}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedRequestBeacon.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRequestBeacon(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedRequestBeacon.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div><strong className="text-slate-800 dark:text-slate-200">Location:</strong> {selectedRequestBeacon.location}</div>
                <div><strong className="text-slate-800 dark:text-slate-200">Beneficiaries:</strong> {selectedRequestBeacon.targetBeneficiaries}</div>
                <div><strong className="text-slate-800 dark:text-slate-200">Urgency:</strong> <span className="font-bold text-rose-600">{selectedRequestBeacon.urgency}</span></div>
                <div><strong className="text-slate-800 dark:text-slate-200">Needed Volume:</strong> {selectedRequestBeacon.quantityNeeded} {selectedRequestBeacon.unit}</div>
              </div>

              <button
                type="button"
                onClick={() => onSelectRequest(selectedRequestBeacon)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Full Match Inspection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Select any supply node or aid beacon on the map to inspect details.
            </div>
          )}

          {/* Quick Node Directory list */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-xs">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Local Node Directory
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {nodes.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedNode(n);
                    setSelectedRequestBeacon(null);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedNode?.id === n.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[11px] text-slate-400 mr-1.5">{n.id}</span>
                    <span>{n.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {n.capacityPercent}%
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
