import React, { useState } from 'react';
import { 
  SupplyBatch, 
  SupplyNode, 
  MatchingLogEntry, 
  AidRequest, 
  AidCategory, 
  RegionTag 
} from '../types';
import { 
  PackagePlus, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  AlertCircle, 
  Layers, 
  Building2, 
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

import { UserProfile } from '../types/auth';

interface SupplyCoordinationProps {
  batches: SupplyBatch[];
  matchingLogs: MatchingLogEntry[];
  nodes: SupplyNode[];
  requests: AidRequest[];
  onRegisterBatch: (batch: Omit<SupplyBatch, 'id' | 'allocated' | 'readyForPickup' | 'registeredAt'>) => void;
  onApproveDispatch: (logId: string) => void;
  onAssignCourier: (logId: string, courierName: string) => void;
  onConfirmDelivery: (logId: string) => void;
  onViewRequest: (requestId: string) => void;
  currentUser?: UserProfile | null;
}

const ALL_CATEGORIES: AidCategory[] = [
  'Medical Supplies',
  'Food & Nutrition',
  'Emergency Shelter',
  'Potable Water',
  'Power & Heating',
  'Infant & Elder Care',
];

const ALL_REGIONS: RegionTag[] = [
  'North Ward',
  'East River Basin',
  'South Industrial',
  'Highland Ridge',
  'West Central',
];

export const SupplyCoordination: React.FC<SupplyCoordinationProps> = ({
  batches,
  matchingLogs,
  nodes,
  requests,
  onRegisterBatch,
  onApproveDispatch,
  onAssignCourier,
  onConfirmDelivery,
  onViewRequest,
  currentUser,
}) => {
  // Form state
  const [donorName, setDonorName] = useState(
    currentUser?.role === 'donor' 
      ? `${currentUser.displayName} (${currentUser.organization})` 
      : ''
  );
  const [donorType, setDonorType] = useState<SupplyBatch['donorType']>(
    currentUser?.role === 'donor' ? 'Local Merchant' : 'Community Donor'
  );
  const [category, setCategory] = useState<AidCategory>('Medical Supplies');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('Packs');
  const [condition, setCondition] = useState<SupplyBatch['condition']>('Sterile / Certified');
  const [hubLocation, setHubLocation] = useState(nodes[0]?.name || 'Metro Regional Logistics Hub');
  const [region, setRegion] = useState<RegionTag>('North Ward');
  const [notes, setNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Filter for matching logs
  const [statusFilter, setStatusFilter] = useState<'All' | 'Automated Match' | 'Approved' | 'Dispatched' | 'Delivered'>('All');

  const filteredLogs = matchingLogs.filter(log => {
    if (statusFilter !== 'All' && log.status !== statusFilter) return false;
    return true;
  });

  // Sync donor name when currentUser changes
  React.useEffect(() => {
    if (currentUser?.displayName) {
      setDonorName(`${currentUser.displayName}${currentUser.organization ? ` (${currentUser.organization})` : ''}`);
      if (currentUser.role === 'donor') {
        setDonorType('Local Merchant');
      }
    }
  }, [currentUser]);

  const handleSubmitSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || quantity <= 0) return;

    const resolvedDonor = donorName.trim() || currentUser?.displayName || 'Community Donor';

    onRegisterBatch({
      donorName: resolvedDonor,
      donorType,
      category,
      itemName,
      quantity,
      unit,
      condition,
      hubLocation,
      region,
      notes,
    });

    // Reset fields
    setItemName('');
    setNotes('');
    setQuantity(50);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Logistics & Resource Allocation Engine</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{batches.length} Registered Batches</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{matchingLogs.length} Match Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Supply Coordination & Matching Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Register available surplus goods, medical supplies, and shelter resources. Automated algorithms pair inventory with active community beacons.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Continuous algorithmic reconciliation active</span>
        </div>
      </div>

      {/* Top Section: Split Form + Staging Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Intake Form (Left 7 Cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Register New Supply Batch
                </h2>
                {currentUser ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Donor: {currentUser.displayName}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Sign In required on submit
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Supplies are immediately broadcasted to nearest community relief nodes.
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
          </div>

          {formSubmitted && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Supply batch successfully registered! The matching engine has initiated proximity reconciliation.</span>
            </div>
          )}

          <form onSubmit={handleSubmitSupply} className="space-y-4">
            
            {/* Donor & Donor Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Donor / Vendor / Co-op Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Co-op / Valley Bakery"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Donor Classification
                </label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Community Donor">Community Donor / Individual</option>
                  <option value="Local Merchant">Local Merchant / Grocery</option>
                  <option value="Pharmacy Reserve">Pharmacy / Healthcare Reserve</option>
                  <option value="Municipal Depository">Municipal Depository</option>
                  <option value="Mutual Aid Network">Mutual Aid Network</option>
                </select>
              </div>
            </div>

            {/* Category & Specific Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Aid Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Specific Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sterile Pediatric Gauze & Saline"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quantity, Unit & Condition */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Batch Quantity
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Packaging Unit
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crates, Boxes, Liters"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Condition / Storage
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sterile / Certified">Sterile / Certified</option>
                  <option value="Shelf-Stable Ambient">Shelf-Stable Ambient</option>
                  <option value="Cold-Chain Refrigerated">Cold-Chain Refrigerated</option>
                  <option value="Clean Packed">Clean Packed</option>
                </select>
              </div>
            </div>

            {/* Drop-off Staging Hub & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Drop-off / Storage Node Location
                </label>
                <select
                  value={hubLocation}
                  onChange={(e) => setHubLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.name}>{n.name} ({n.region})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  District Sector
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Special Handling */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Logistics Notes & Handling Constraints
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Palletized with liftgate required. Contact security guard on arrival."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Register Supply Batch & Run Automated Match</span>
            </button>
          </form>
        </div>

        {/* Right Column: Visual Staging Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="aspect-[4/3] relative">
              <img
                src="/src/assets/images/civic_hub_logistics_1793552858800.jpg"
                alt="Civic supply staging hub and volunteer coordinator tracking intake totes and delivery manifests"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                <div className="font-semibold text-sm">Verified Intake Protocol</div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Physical goods are verified upon arrival by depot guardians before dispatch lock.
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="font-medium">Active Depot Utilization</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">68% Average</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '68%' }} />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Instant Pairing</div>
                  <div>No broker fees or middleman latency</div>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Cryptographic Proof</div>
                  <div>Chain-of-custody recorded on-chain</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Automated Matching Engine Log */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Automated Matching Engine & Dispatch Log
              </h2>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                Live Pairing
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Smart algorithm automatically pairs supply batches with open aid requests based on item category, batch capacity, and travel distance.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {(['All', 'Automated Match', 'Approved', 'Dispatched', 'Delivered'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Matching Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">Match Event</th>
                <th className="py-3 px-3">Paired Aid Request</th>
                <th className="py-3 px-3">Committed Supply</th>
                <th className="py-3 px-3 text-right">Volume</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Coordination Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    
                    {/* Event ID & Time */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">{log.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.timestamp}</div>
                    </td>

                    {/* Paired Request */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>{log.requestId}</span>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {log.requestTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Destination: {log.recipientNode}
                      </div>
                    </td>

                    {/* Committed Supply */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <span>{log.supplyId}</span>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {log.supplyName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Donor: {log.donorName}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {log.quantityMatched} {log.unit}
                    </td>

                    {/* Compatibility Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {log.compatibilityScore}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        log.status === 'Delivered'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : log.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : log.status === 'Approved'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}>
                        {log.status}
                      </span>
                      {log.assignedCourier && (
                        <div className="text-[11px] text-slate-500 mt-1 truncate">
                          {log.assignedCourier}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {log.status === 'Automated Match' && (
                          <button
                            type="button"
                            onClick={() => onApproveDispatch(log.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                          >
                            Approve Match
                          </button>
                        )}

                        {log.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => onAssignCourier(log.id, 'Volunteer Van #08')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch Courier</span>
                          </button>
                        )}

                        {log.status === 'Dispatched' && (
                          <button
                            type="button"
                            onClick={() => onConfirmDelivery(log.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700 transition-colors"
                          >
                            Confirm Delivery & Log
                          </button>
                        )}

                        {log.status === 'Delivered' && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Locked on Ledger
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Available Supply Batches Inventory Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Registered Batches in Municipal Stock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live inventory ready for immediate pickup and distribution.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{batches.length} Batches Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Donor / Provider</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Available / Total</th>
                <th className="py-2.5 px-3">Staging Hub</th>
                <th className="py-2.5 px-3">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{b.id}</td>
                  <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300 font-medium">{b.donorName}</td>
                  <td className="py-3 px-3 font-sans text-slate-900 dark:text-white font-semibold">{b.itemName}</td>
                  <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-400">{b.category}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-900 dark:text-white font-semibold">
                    {b.quantity - b.allocated} / {b.quantity} {b.unit}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-400">{b.hubLocation}</td>
                  <td className="py-3 px-3 font-sans text-[11px] text-slate-500">{b.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
