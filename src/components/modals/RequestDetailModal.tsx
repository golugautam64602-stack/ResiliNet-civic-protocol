import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Heart, 
  Package, 
  CheckCircle2, 
  Share2, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { AidRequest, SupplyBatch } from '../../types';

interface RequestDetailModalProps {
  request: AidRequest | null;
  batches: SupplyBatch[];
  isOpen: boolean;
  onClose: () => void;
  onPledge: (requestId: string, quantityPledged: number) => void;
  onEndorse: (requestId: string) => void;
  onMatchWithBatch: (requestId: string, batchId: string, quantityToMatch: number) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  batches,
  isOpen,
  onClose,
  onPledge,
  onEndorse,
  onMatchWithBatch,
}) => {
  const [pledgeAmount, setPledgeAmount] = useState<number>(10);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [showPledgeSuccess, setShowPledgeSuccess] = useState(false);

  if (!isOpen || !request) return null;

  const remainingNeeded = Math.max(0, request.quantityNeeded - request.quantityPledged);
  const percentPledged = Math.min(100, Math.round((request.quantityPledged / request.quantityNeeded) * 100));

  // Find matching batches by category or region
  const matchingBatches = batches.filter(
    b => b.category === request.category && (b.quantity - b.allocated) > 0
  );

  const handleQuickPledge = (amt: number) => {
    onPledge(request.id, amt);
    setShowPledgeSuccess(true);
    setTimeout(() => setShowPledgeSuccess(false), 3000);
  };

  const handleBatchMatch = (batch: SupplyBatch) => {
    const available = batch.quantity - batch.allocated;
    const matchQty = Math.min(remainingNeeded, available);
    onMatchWithBatch(request.id, batch.id, matchQty);
    setShowPledgeSuccess(true);
    setTimeout(() => setShowPledgeSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-6 my-8 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{request.id}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans font-medium text-slate-700 dark:text-slate-300">{request.category}</span>
              <span aria-hidden="true">·</span>
              <span className={
                request.urgency === 'High' ? 'font-bold text-rose-600' : 'text-slate-600 dark:text-slate-400'
              }>
                {request.urgency} Urgency
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {request.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {showPledgeSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Supply commitment registered! The beacon fulfillment has been updated.</span>
          </div>
        )}

        {/* Metadata Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Facility / Location:</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{request.location}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Beneficiaries:</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{request.targetBeneficiaries}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Municipal District:</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{request.region}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Deadline / Timeline:</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{request.neededBy}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Dispatch Contact Channel:</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{request.contactChannel}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Protocol Status:</span>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{request.status}</div>
            </div>
          </div>
        </div>

        {/* Detailed Need Description */}
        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Situational Context & Clinical Urgency
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
            {request.description}
          </p>
        </div>

        {/* Fulfillment Volume Status */}
        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Community Fulfillment Progress
            </span>
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
              {request.quantityPledged} of {request.quantityNeeded} {request.unit} ({percentPledged}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${percentPledged}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>Remaining required: {remainingNeeded} {request.unit}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEndorse(request.id)}
                className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{request.endorsements} Community Vouchers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Smart Matching Candidates from Available Inventory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Supply Batches for Direct Pairing</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {matchingBatches.length} Compatible Batches
            </span>
          </div>

          {matchingBatches.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {matchingBatches.map(batch => {
                const available = batch.quantity - batch.allocated;
                return (
                  <div
                    key={batch.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {batch.itemName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {batch.donorName} · {batch.hubLocation} ({batch.condition})
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                        {available} {batch.unit} avail
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBatchMatch(batch)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
                      >
                        Pair Batch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
              No exact category inventory currently staged at local hubs. You can pledge direct quantities below.
            </div>
          )}
        </div>

        {/* Quick Manual Pledge Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Quick Pledge:</span>
            <button
              type="button"
              onClick={() => handleQuickPledge(10)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handleQuickPledge(25)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              +25
            </button>
            {remainingNeeded > 0 && (
              <button
                type="button"
                onClick={() => handleQuickPledge(remainingNeeded)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
              >
                Fulfill All ({remainingNeeded})
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Close Inspection
          </button>
        </div>

      </div>
    </div>
  );
};
