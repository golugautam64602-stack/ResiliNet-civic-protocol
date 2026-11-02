import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Layers, 
  MapPin, 
  PackageCheck, 
  Activity, 
  Users, 
  CheckCircle2, 
  Clock, 
  Lock,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CivicStats } from '../types';

interface LandingHeroProps {
  stats: CivicStats;
  onRequestAid: () => void;
  onCoordinateSupplies: () => void;
  onExploreDashboard: () => void;
  onExploreMap: () => void;
  darkMode?: boolean;
}

interface WeeklyImpactPoint {
  week: string;
  dateRange: string;
  requestsReceived: number;
  aidDelivered: number;
  fulfillmentRate: number;
}

const IMPACT_DATA_BY_CATEGORY: Record<string, WeeklyImpactPoint[]> = {
  all: [
    { week: 'Wk 1', dateRange: 'Sep 01 - 07', requestsReceived: 820, aidDelivered: 710, fulfillmentRate: 86.6 },
    { week: 'Wk 2', dateRange: 'Sep 08 - 14', requestsReceived: 1040, aidDelivered: 950, fulfillmentRate: 91.3 },
    { week: 'Wk 3', dateRange: 'Sep 15 - 21', requestsReceived: 1290, aidDelivered: 1210, fulfillmentRate: 93.8 },
    { week: 'Wk 4', dateRange: 'Sep 22 - 28', requestsReceived: 1680, aidDelivered: 1590, fulfillmentRate: 94.6 },
    { week: 'Wk 5', dateRange: 'Sep 29 - Oct 05', requestsReceived: 1950, aidDelivered: 1890, fulfillmentRate: 96.9 },
    { week: 'Wk 6', dateRange: 'Oct 06 - 12', requestsReceived: 2150, aidDelivered: 2090, fulfillmentRate: 97.2 },
    { week: 'Wk 7', dateRange: 'Oct 13 - 19', requestsReceived: 2420, aidDelivered: 2360, fulfillmentRate: 97.5 },
    { week: 'Wk 8', dateRange: 'Oct 20 - 26', requestsReceived: 2680, aidDelivered: 2630, fulfillmentRate: 98.1 },
  ],
  medical: [
    { week: 'Wk 1', dateRange: 'Sep 01 - 07', requestsReceived: 310, aidDelivered: 260, fulfillmentRate: 83.9 },
    { week: 'Wk 2', dateRange: 'Sep 08 - 14', requestsReceived: 420, aidDelivered: 380, fulfillmentRate: 90.5 },
    { week: 'Wk 3', dateRange: 'Sep 15 - 21', requestsReceived: 510, aidDelivered: 480, fulfillmentRate: 94.1 },
    { week: 'Wk 4', dateRange: 'Sep 22 - 28', requestsReceived: 630, aidDelivered: 600, fulfillmentRate: 95.2 },
    { week: 'Wk 5', dateRange: 'Sep 29 - Oct 05', requestsReceived: 720, aidDelivered: 700, fulfillmentRate: 97.2 },
    { week: 'Wk 6', dateRange: 'Oct 06 - 12', requestsReceived: 810, aidDelivered: 790, fulfillmentRate: 97.5 },
    { week: 'Wk 7', dateRange: 'Oct 13 - 19', requestsReceived: 920, aidDelivered: 900, fulfillmentRate: 97.8 },
    { week: 'Wk 8', dateRange: 'Oct 20 - 26', requestsReceived: 1050, aidDelivered: 1030, fulfillmentRate: 98.1 },
  ],
  food: [
    { week: 'Wk 1', dateRange: 'Sep 01 - 07', requestsReceived: 360, aidDelivered: 320, fulfillmentRate: 88.9 },
    { week: 'Wk 2', dateRange: 'Sep 08 - 14', requestsReceived: 430, aidDelivered: 400, fulfillmentRate: 93.0 },
    { week: 'Wk 3', dateRange: 'Sep 15 - 21', requestsReceived: 540, aidDelivered: 510, fulfillmentRate: 94.4 },
    { week: 'Wk 4', dateRange: 'Sep 22 - 28', requestsReceived: 710, aidDelivered: 680, fulfillmentRate: 95.8 },
    { week: 'Wk 5', dateRange: 'Sep 29 - Oct 05', requestsReceived: 840, aidDelivered: 820, fulfillmentRate: 97.6 },
    { week: 'Wk 6', dateRange: 'Oct 06 - 12', requestsReceived: 920, aidDelivered: 900, fulfillmentRate: 97.8 },
    { week: 'Wk 7', dateRange: 'Oct 13 - 19', requestsReceived: 1030, aidDelivered: 1010, fulfillmentRate: 98.1 },
    { week: 'Wk 8', dateRange: 'Oct 20 - 26', requestsReceived: 1140, aidDelivered: 1120, fulfillmentRate: 98.2 },
  ],
  shelter: [
    { week: 'Wk 1', dateRange: 'Sep 01 - 07', requestsReceived: 150, aidDelivered: 130, fulfillmentRate: 86.7 },
    { week: 'Wk 2', dateRange: 'Sep 08 - 14', requestsReceived: 190, aidDelivered: 170, fulfillmentRate: 89.5 },
    { week: 'Wk 3', dateRange: 'Sep 15 - 21', requestsReceived: 240, aidDelivered: 220, fulfillmentRate: 91.7 },
    { week: 'Wk 4', dateRange: 'Sep 22 - 28', requestsReceived: 340, aidDelivered: 310, fulfillmentRate: 91.2 },
    { week: 'Wk 5', dateRange: 'Sep 29 - Oct 05', requestsReceived: 390, aidDelivered: 370, fulfillmentRate: 94.9 },
    { week: 'Wk 6', dateRange: 'Oct 06 - 12', requestsReceived: 420, aidDelivered: 400, fulfillmentRate: 95.2 },
    { week: 'Wk 7', dateRange: 'Oct 13 - 19', requestsReceived: 470, aidDelivered: 450, fulfillmentRate: 95.7 },
    { week: 'Wk 8', dateRange: 'Oct 20 - 26', requestsReceived: 490, aidDelivered: 480, fulfillmentRate: 98.0 },
  ],
};

const CATEGORY_TABS = [
  { key: 'all', label: 'All Supplies' },
  { key: 'medical', label: 'Medical & First Aid' },
  { key: 'food', label: 'Food & Water' },
  { key: 'shelter', label: 'Emergency Shelter' },
];

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as WeeklyImpactPoint;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs space-y-2 backdrop-blur-md min-w-[220px]">
        <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
          <span className="font-bold text-slate-100">{label}</span>
          <span className="text-[10px] text-slate-400 font-mono">{data.dateRange}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
              <span>Requests Received:</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-indigo-300">
              {data.requestsReceived.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              <span>Aid Delivered:</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-emerald-300">
              {data.aidDelivered.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Weekly Fulfillment:</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            {data.fulfillmentRate}%
          </span>
        </div>
        <div className="text-[9px] text-emerald-400/90 flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>2-of-3 Witness Attested</span>
        </div>
      </div>
    );
  }
  return null;
};

export const LandingHero: React.FC<LandingHeroProps> = ({
  stats,
  onRequestAid,
  onCoordinateSupplies,
  onExploreDashboard,
  onExploreMap,
  darkMode = true,
}) => {
  const [activePersona, setActivePersona] = useState<'seeker' | 'coordinator'>('seeker');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const chartData = useMemo(() => {
    return IMPACT_DATA_BY_CATEGORY[selectedCategory] || IMPACT_DATA_BY_CATEGORY.all;
  }, [selectedCategory]);

  const totals = useMemo(() => {
    const req = chartData.reduce((acc, curr) => acc + curr.requestsReceived, 0);
    const del = chartData.reduce((acc, curr) => acc + curr.aidDelivered, 0);
    const rate = req > 0 ? ((del / req) * 100).toFixed(1) : '0';
    return { requests: req, delivered: del, rate };
  }, [chartData]);

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const axisColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                <span>Civic Resilience Infrastructure</span>
                <span aria-hidden="true">·</span>
                <span>Peer-to-Peer Mutual Aid</span>
                <span aria-hidden="true">·</span>
                <span>Open Protocol</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-2xl">
                Decentralized Community Aid & Local Supply Coordination
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                ResiliNet bypasses centralized bureaucratic delays by connecting hyper-local community aid needs directly with nearby donors, storage depots, and mutual aid couriers. Every dispatch is transparently coordinated and verified on an immutable civic ledger.
              </p>

              {/* Two Clear Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onRequestAid}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
                >
                  <span>Request Urgent Aid</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onCoordinateSupplies}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Coordinate Supplies</span>
                </button>
              </div>

              {/* Core Protocol Trust Points */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Zero Intermediaries</div>
                  <div>Direct peer matching between clinics, shelters, and donors</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Algorithmic Pairing</div>
                  <div>Inventory matched by distance, shelf life, and urgent need</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">2-of-3 Witness Ledger</div>
                  <div>Immutable proof of delivery with GPS coordinates & signatures</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Authentic Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
                <img
                  src="/src/assets/images/resilinet_hero_network_1793552859509.jpg"
                  alt="Civic mutual aid volunteers coordinating emergency crates, potable water, and medical aid kits in an organized local distribution staging hub"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onError={(e) => {
                    // Styled resilient fallback if image asset is unavailable
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Fallback container if image cannot load */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-slate-900/60 pointer-events-none" />

                {/* Live Node Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700/60 shadow-md">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Activity className="w-3.5 h-3.5" />
                      Protocol Live Mesh
                    </span>
                    <span className="font-mono tabular-nums text-slate-300">36 Active Nodes</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Latest verified delivery: 30x Trauma Saline Packs delivered to North Ward Outpost.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quantitative Rigor: Statistics Counters Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Civic Impact & Verified Delivery Metrics · Real-time Attestations
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.foodDistributedKg.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">kg</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Food Rations Dispatched</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.medicalPacksDeployed.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Medical Packs Deployed</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.cleanWaterLiters.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">L</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Potable Water Delivered</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.emergencyShelterNights.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bedding Units Provided</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {stats.fulfillmentRatePercent}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Request Fulfillment Rate</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.avgMatchTimeHours} <span className="text-xs font-sans text-slate-500 font-normal">hrs</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Average Match Latency</div>
            </div>

          </div>
        </div>
      </section>

      {/* Community Impact Over Time: Weekly Volume vs Requests Received */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Civic Ledger Longitudinal Telemetry</span>
                <span aria-hidden="true">·</span>
                <span>Weekly Volume Throughput</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Community Impact Over Time
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Weekly comparison of emergency aid requests broadcast across municipal districts compared to verified volume delivered by local donors and mutual aid courier fleets.
              </p>
            </div>

            {/* Category Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      selectedCategory === tab.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Requests Received</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                {totals.requests.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-[10px] text-slate-400">Past 8 weeks across all districts</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Aid Delivered</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {totals.delivered.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">100% Attested on Ledger</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Average Fulfillment Rate</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {totals.rate}%
              </div>
              <div className="text-[10px] text-slate-400">Delta reduced by 11.5%</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Consensus Standard</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 inline" />
                <span>2-of-3</span>
              </div>
              <div className="text-[10px] text-slate-400">Recipient + Courier + Staging Hub</div>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-72 sm:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="week" 
                  stroke={axisColor} 
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={axisColor} 
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: '14px' }}
                  content={() => (
                    <div className="flex items-center justify-end gap-5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-indigo-500 dark:bg-indigo-400 inline-block" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Requests Received</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-400 inline-block" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Aid Delivered (On-Chain)</span>
                      </div>
                    </div>
                  )}
                />
                <Bar 
                  dataKey="requestsReceived" 
                  name="Requests Received" 
                  fill={darkMode ? '#818cf8' : '#6366f1'} 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="aidDelivered" 
                  name="Aid Delivered" 
                  fill={darkMode ? '#34d399' : '#10b981'} 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subtext Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synchronized with Civic Ledger Blocks #14,000 – #14,892</span>
            </div>
            <button
              onClick={onExploreDashboard}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore live active beacons on Aid Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Persona Workflows: Aid Seekers vs Supply Coordinators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Dual Civic Workflows
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Engineered for immediate ease of use during emergencies and long-term community resilience.
              </p>
            </div>

            {/* Segmented Persona Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActivePersona('seeker')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activePersona === 'seeker'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                For Aid Seekers
              </button>
              <button
                type="button"
                onClick={() => setActivePersona('coordinator')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activePersona === 'coordinator'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                For Coordinators & Donors
              </button>
            </div>
          </div>

          {/* Persona Content */}
          {activePersona === 'seeker' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Broadcast Need Beacon
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submit critical shortages (insulin, potable water, blankets, baby formula). Specify quantity, urgency level, and safe delivery coordinates.
                </p>
                <div className="pt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Takes less than 60 seconds
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Automated Smart Matching
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The protocol cross-references regional warehouses, pharmacy stockpiles, and mutual aid depots to pair your beacon with ready inventory.
                </p>
                <div className="pt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Proximity & urgency prioritized
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Verified Local Delivery
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Community couriers deliver supplies. A digital 2-of-3 witness signature and photo attestation logs delivery onto the public ledger.
                </p>
                <div className="pt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Tamper-proof receipt generated
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Register Available Batches
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Vendors, pharmacies, food co-ops, and private donors list surplus supplies with batch sizes, storage condition, and pickup depot location.
                </p>
                <div className="pt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Direct intake portal
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Approve Matches & Dispatch
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inspect algorithmic compatibility scores, accept paired requests, and assign vetted volunteer transport or neighborhood cargo bikes.
                </p>
                <div className="pt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Live transit map routing
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Civic Audit & Traceability
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor live inventory turnover across all 5 municipal regions. Generate transparent delivery receipts and community impact reports.
                </p>
                <div className="pt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Immutable public audit trail
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Navigation within persona card */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Decentralized node consensus · No single point of failure</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onExploreDashboard}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>View Live Aid Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={onExploreMap}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>Open Supply Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Protocol Architecture: 4 Pillars of Decentralized Civic Resilience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            How ResiliNet Decentralized Matching Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A resilient architecture designed for disaster relief, community supply crunches, and civic mutual aid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              01. Need Beacon
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clinics, food banks, and neighborhood shelters publish encrypted need signals broadcast across mesh and web protocols.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              02. Smart Supply Pairing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Proximity, batch volume, temperature compatibility, and urgency weights are calculated client-side to find optimal supply nodes.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              03. Staging & Dispatch
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Local distribution points and volunteer delivery teams receive clear chain-of-custody routing with zero centralized dispatch fees.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              04. Civic Ledger Lock
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Recipients and couriers generate cryptographic receipt blocks with dual attestations, ensuring public accountability and donor trust.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
