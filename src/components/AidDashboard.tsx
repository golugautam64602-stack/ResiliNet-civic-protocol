import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MapPin, 
  Clock, 
  Heart, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Package,
  ArrowUpRight,
  Trophy
} from 'lucide-react';
import { AidRequest, AidCategory, UrgencyLevel, RegionTag, LedgerTransaction } from '../types';
import { UserProfile } from '../types/auth';
import { VolunteerLeaderboard } from './VolunteerLeaderboard';

interface AidDashboardProps {
  requests: AidRequest[];
  ledger: LedgerTransaction[];
  registeredUsers?: UserProfile[];
  onSelectRequest: (request: AidRequest) => void;
  onOpenNewRequest: () => void;
  onEndorseRequest: (requestId: string) => void;
  onInspectBlock?: (tx: LedgerTransaction) => void;
  onOpenAuth?: () => void;
}

const ALL_CATEGORIES: AidCategory[] = [
  'Medical Supplies',
  'Food & Nutrition',
  'Emergency Shelter',
  'Potable Water',
  'Power & Heating',
  'Infant & Elder Care',
];

const ALL_URGENCIES: UrgencyLevel[] = ['High', 'Medium', 'Low'];

const ALL_REGIONS: RegionTag[] = [
  'North Ward',
  'East River Basin',
  'South Industrial',
  'Highland Ridge',
  'West Central',
];

export const AidDashboard: React.FC<AidDashboardProps> = ({
  requests,
  ledger,
  registeredUsers = [],
  onSelectRequest,
  onOpenNewRequest,
  onEndorseRequest,
  onInspectBlock,
  onOpenAuth,
}) => {
  const [dashboardView, setDashboardView] = useState<'beacons' | 'leaderboard'>('beacons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AidCategory[]>([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState<UrgencyLevel[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionTag[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Matched' | 'In Staging' | 'En Route' | 'Fulfilled'>('All');
  const [sortBy, setSortBy] = useState<'urgency' | 'newest' | 'needed-soon' | 'progress'>('urgency');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Toggle helpers for multi-select
  const toggleCategory = (cat: AidCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleUrgency = (urg: UrgencyLevel) => {
    setSelectedUrgencies(prev =>
      prev.includes(urg) ? prev.filter(u => u !== urg) : [...prev, urg]
    );
  };

  const toggleRegion = (reg: RegionTag) => {
    setSelectedRegions(prev =>
      prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedUrgencies([]);
    setSelectedRegions([]);
    setStatusFilter('All');
  };

  // Filter & sort logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(query);
        const matchesDesc = req.description.toLowerCase().includes(query);
        const matchesLocation = req.location.toLowerCase().includes(query);
        const matchesCategory = req.category.toLowerCase().includes(query);
        const matchesId = req.id.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesCategory && !matchesId) {
          return false;
        }
      }

      // Multi-select category
      if (selectedCategories.length > 0 && !selectedCategories.includes(req.category)) {
        return false;
      }

      // Multi-select urgency
      if (selectedUrgencies.length > 0 && !selectedUrgencies.includes(req.urgency)) {
        return false;
      }

      // Multi-select region
      if (selectedRegions.length > 0 && !selectedRegions.includes(req.region)) {
        return false;
      }

      // Status
      if (statusFilter !== 'All' && req.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyWeight = { High: 3, Medium: 2, Low: 1 };
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      }
      if (sortBy === 'progress') {
        const progA = a.quantityPledged / a.quantityNeeded;
        const progB = b.quantityPledged / b.quantityNeeded;
        return progA - progB; // show most in need first
      }
      // default newest / fallback
      return b.id.localeCompare(a.id);
    });
  }, [requests, searchQuery, selectedCategories, selectedUrgencies, selectedRegions, statusFilter, sortBy]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedUrgencies.length +
    selectedRegions.length +
    (statusFilter !== 'All' ? 1 : 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Decentralized Beacon Registry</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredRequests.length} Active Beacons</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Community Aid Matching Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Live mutual aid beacons broadcast by local shelters, triage clinics, and neighborhood associations awaiting supply match.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Segmented View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDashboardView('beacons')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                dashboardView === 'beacons'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active Beacons ({filteredRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setDashboardView('leaderboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                dashboardView === 'leaderboard'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Volunteer Leaderboard</span>
            </button>
          </div>

          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post Aid Request</span>
          </button>
        </div>
      </div>

      {dashboardView === 'leaderboard' ? (
        <VolunteerLeaderboard
          ledger={ledger}
          registeredUsers={registeredUsers}
          onInspectBlock={onInspectBlock}
          onOpenAuth={onOpenAuth}
        />
      ) : (
        <>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
        
        {/* Row 1: Search & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beacons by item, medical need, location..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="urgency">Sort: Highest Urgency</option>
              <option value="progress">Sort: Lowest Pledged First</option>
              <option value="newest">Sort: Recent Beacons</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Multi-select Category Filters */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Aid Category (Multi-select)
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Urgency Level & Local Region Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Urgency */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Urgency Level
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ALL_URGENCIES.map((urg) => {
                const isSelected = selectedUrgencies.includes(urg);
                return (
                  <button
                    key={urg}
                    type="button"
                    onClick={() => toggleUrgency(urg)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? urg === 'High'
                          ? 'bg-rose-600 text-white'
                          : urg === 'Medium'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-white dark:bg-slate-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {urg === 'High' && 'Immediate (< 6h)'}
                    {urg === 'Medium' && 'Urgent (< 24h)'}
                    {urg === 'Low' && 'Replenish (48h+)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Tags */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Local Municipal Regions
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ALL_REGIONS.map((reg) => {
                const isSelected = selectedRegions.includes(reg);
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => toggleRegion(reg)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {reg}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Active Filters Clear Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'} applied
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}

      </div>

      {/* Aid Requests Container (Grid or List View) */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900 space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No matching aid beacons found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing specific category and region filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear active filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => {
            const percentPledged = Math.min(100, Math.round((req.quantityPledged / req.quantityNeeded) * 100));
            const isFullyPledged = req.quantityPledged >= req.quantityNeeded;

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                {/* Header Metadata (Clean unboxed text, no pill envelopes per anti-slop rules) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>{req.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans font-medium text-slate-700 dark:text-slate-300">{req.category}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={
                        req.urgency === 'High' 
                          ? 'font-bold text-rose-600 dark:text-rose-400' 
                          : req.urgency === 'Medium' 
                          ? 'font-semibold text-amber-600 dark:text-amber-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }>
                        {req.urgency} Urgency
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{req.region} · {req.location}</span>
                  </div>
                </div>

                {/* Progress & Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  
                  {/* Fulfillment Metric Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Pledged Volume</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                        {req.quantityPledged} / {req.quantityNeeded} {req.unit}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFullyPledged ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentPledged}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEndorseRequest(req.id);
                        }}
                        className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Vouch / Endorse Beacon"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="font-mono tabular-nums">{req.endorsements}</span>
                      </button>

                      <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                        {req.postedAt}
                      </span>
                    </div>

                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      <span>Match Supply</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          {filteredRequests.map((req) => {
            const percentPledged = Math.min(100, Math.round((req.quantityPledged / req.quantityNeeded) * 100));

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 md:max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium">{req.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className={
                      req.urgency === 'High' ? 'font-bold text-rose-600' : 'text-slate-600 dark:text-slate-400'
                    }>
                      {req.urgency} Urgency
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{req.region}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {req.location} · {req.description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  <div className="text-right space-y-1">
                    <div className="text-xs font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {req.quantityPledged} / {req.quantityNeeded} {req.unit}
                    </div>
                    <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${percentPledged}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEndorseRequest(req.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Vouch"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                    >
                      Match
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

    </div>
  );
};
