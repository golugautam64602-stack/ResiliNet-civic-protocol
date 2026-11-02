import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  MapPin, 
  Clock, 
  Lock, 
  FileCheck2,
  ExternalLink 
} from 'lucide-react';
import { LedgerTransaction } from '../../types';

interface VerifyLedgerModalProps {
  tx: LedgerTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerifyLedgerModal: React.FC<VerifyLedgerModalProps> = ({
  tx,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !tx) return null;

  const handleCopyProof = () => {
    navigator.clipboard.writeText(JSON.stringify(tx, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographic Proof of Delivery Verification</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Block #{tx.blockHeight} Verification Attestation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>State Consensus: Valid & Tamper-Proof</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            This aid delivery was cryptographically signed and confirmed by {tx.witnessSignatures.length} independent node validators and local witnesses.
          </p>
        </div>

        {/* Transaction Hashes */}
        <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-slate-500 font-sans font-medium text-[11px]">Block Hash:</div>
            <div className="text-slate-900 dark:text-white font-semibold select-all break-all">{tx.blockHash}</div>
          </div>
          <div>
            <div className="text-slate-500 font-sans font-medium text-[11px]">Transaction Manifest Hash:</div>
            <div className="text-slate-900 dark:text-white select-all break-all">{tx.txHash}</div>
          </div>
          <div>
            <div className="text-slate-500 font-sans font-medium text-[11px]">SHA-256 Receipt Proof:</div>
            <div className="text-emerald-600 dark:text-emerald-400 select-all break-all">{tx.receiptProofHash}</div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Delivered Aid Package</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {tx.quantity} {tx.unit}
            </div>
            <div className="text-slate-600 dark:text-slate-300">{tx.itemsDelivered}</div>
            <div className="text-[11px] text-slate-400">Category: {tx.category}</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Physical Delivery Coordinates</div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tx.gpsLock}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">Recipient: {tx.recipientNode}</div>
            <div className="text-[11px] text-slate-400">Timestamp: {tx.timestamp}</div>
          </div>
        </div>

        {/* 2-of-3 Multi-Sig Witness Attestations */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Verified Witness Attestation Signatures (2-of-3 Multi-Sig)
          </h4>
          <div className="space-y-2">
            {tx.witnessSignatures.map((witness, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{witness.role}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 select-all">
                    Key: {witness.address}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {witness.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyProof}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Proof Copied!' : 'Copy Verification JSON'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
