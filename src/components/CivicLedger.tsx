import React, { useState, useMemo } from 'react';
import { LedgerTransaction, AidCategory } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Fingerprint, 
  Key,
  Layers,
  FileText
} from 'lucide-react';

interface CivicLedgerProps {
  ledger: LedgerTransaction[];
  onInspectBlock: (tx: LedgerTransaction) => void;
  onExportSuccess?: () => void;
}

export const CivicLedger: React.FC<CivicLedgerProps> = ({
  ledger,
  onInspectBlock,
  onExportSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);

  // Filtered transactions
  const filteredLedger = useMemo(() => {
    return ledger.filter(tx => {
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesHash = tx.blockHash.toLowerCase().includes(query) || tx.txHash.toLowerCase().includes(query);
        const matchesNode = tx.recipientNode.toLowerCase().includes(query);
        const matchesItems = tx.itemsDelivered.toLowerCase().includes(query);
        const matchesSource = tx.supplySource.toLowerCase().includes(query);
        const matchesHeight = tx.blockHeight.toString().includes(query);
        if (!matchesHash && !matchesNode && !matchesItems && !matchesSource && !matchesHeight) {
          return false;
        }
      }
      return true;
    });
  }, [ledger, searchQuery, selectedCategory]);

  // Structured CSV Export for External Audit Verification
  const exportLedgerCSV = () => {
    setIsExporting(true);
    
    // Structured RFC-4180 headers for external compliance and auditor tooling
    const headers = [
      'Block_Height',
      'Block_Hash',
      'Transaction_Hash',
      'Verification_Timestamp',
      'Aid_Category',
      'Recipient_Community_Node',
      'Supply_Source_Donor',
      'Delivered_Items_Description',
      'Quantity_Delivered',
      'Packaging_Unit',
      'Witness_Consensus_Ratio',
      'Witness_Attestation_Signatures',
      'GPS_Geofence_Lock',
      'Verification_Protocol_Method',
      'Cryptographic_Receipt_Proof_SHA256',
      'Audit_Validation_Status',
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = filteredLedger.map(tx => {
      const witnessList = tx.witnessSignatures
        .map(w => `[${w.role}: ${w.address} @ ${w.timestamp}]`)
        .join('; ');

      return [
        tx.blockHeight,
        escapeCsv(tx.blockHash),
        escapeCsv(tx.txHash),
        escapeCsv(tx.timestamp),
        escapeCsv(tx.category),
        escapeCsv(tx.recipientNode),
        escapeCsv(tx.supplySource),
        escapeCsv(tx.itemsDelivered),
        tx.quantity,
        escapeCsv(tx.unit),
        escapeCsv(`${tx.witnessSignatures.length}-of-3 Multi-Sig`),
        escapeCsv(witnessList),
        escapeCsv(tx.gpsLock),
        escapeCsv(tx.verificationMethod),
        escapeCsv(tx.receiptProofHash),
        escapeCsv('VERIFIED_TAMPER_PROOF'),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resilinet_civic_ledger_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      onExportSuccess?.();
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Decentralized Consensus Ledger</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Block Height #{ledger[0]?.blockHeight ?? 14208}</span>
            <span aria-hidden="true">·</span>
            <span>2-of-3 Multi-Sig Attestation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Civic Accountability & Verification Ledger
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            A public, tamper-resistant record of every fulfilled community aid delivery. Signed by on-the-ground volunteer drivers, receiving clinic leads, and civic guardians.
          </p>
        </div>

        {/* Primary Download CSV Audit Button in Header */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={exportLedgerCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Download structured CSV file formatted for external audit systems"
          >
            {isExporting ? (
              <>
                <FileText className="w-4 h-4 animate-pulse" />
                <span>Generating Audit CSV...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Audit CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust & Consensus Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Immutable Chain of Custody
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Every delivery requires a digital handover token signed by both dispatch courier and the receiving facility coordinator.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Geofenced Drop-off Validation
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              GPS telemetry verifies recipient proximity within ±5 meters before cryptographic signature blocks are committed.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Zero Dark Money or Ghost Supplies
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Donors and community auditors can verify item serials, batch receipts, and recipient acknowledgments directly.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Block Hash, Tx, Recipient, or Item..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Aid Categories</option>
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="Food & Nutrition">Food & Nutrition</option>
              <option value="Emergency Shelter">Emergency Shelter</option>
              <option value="Potable Water">Potable Water</option>
              <option value="Power & Heating">Power & Heating</option>
            </select>
          </div>
        </div>

        {/* Structured Audit Verification Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              RFC 4180 Audit Format: Includes complete SHA-256 hashes, GPS lat/lon locks, and witness public keys.
            </span>
          </div>

          <button
            type="button"
            onClick={exportLedgerCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 disabled:opacity-50 py-1 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit CSV ({filteredLedger.length} Records)</span>
          </button>
        </div>
      </div>

      {/* Read-Only Ledger Table Simulation */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">Block / Hash</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Recipient Node</th>
                <th className="py-3 px-3">Supply Source</th>
                <th className="py-3 px-3">Delivered Aid</th>
                <th className="py-3 px-3">Witness Consensus</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {filteredLedger.map((tx) => (
                <tr key={tx.txHash} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  
                  {/* Block Height & Hash */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                      #{tx.blockHeight}
                    </div>
                    <div className="text-slate-400 text-[10px] truncate max-w-[120px]" title={tx.blockHash}>
                      {tx.blockHash}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {tx.timestamp}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 font-sans">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {tx.category}
                    </span>
                  </td>

                  {/* Recipient Node */}
                  <td className="py-3 px-3 font-sans max-w-[160px] truncate font-medium text-slate-800 dark:text-slate-200" title={tx.recipientNode}>
                    {tx.recipientNode}
                  </td>

                  {/* Supply Source */}
                  <td className="py-3 px-3 font-sans max-w-[140px] truncate text-slate-600 dark:text-slate-400" title={tx.supplySource}>
                    {tx.supplySource}
                  </td>

                  {/* Items Delivered */}
                  <td className="py-3 px-3 font-sans">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {tx.quantity} {tx.unit}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {tx.itemsDelivered}
                    </div>
                  </td>

                  {/* Witness Signatures */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{tx.witnessSignatures.length}-of-3 Attested</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.verificationMethod}
                    </div>
                  </td>

                  {/* Verify Action */}
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => onInspectBlock(tx)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700 transition-colors inline-flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Proof</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
