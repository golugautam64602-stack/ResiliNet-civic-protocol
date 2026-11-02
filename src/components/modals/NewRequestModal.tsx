import React, { useState } from 'react';
import { X, Plus, AlertCircle, ShieldAlert } from 'lucide-react';
import { AidRequest, AidCategory, UrgencyLevel, RegionTag } from '../../types';

import { UserProfile } from '../../types/auth';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<AidRequest, 'id' | 'quantityPledged' | 'status' | 'postedAt' | 'endorsements' | 'coordinates'>) => void;
  currentUser?: UserProfile | null;
}

const CATEGORIES: AidCategory[] = [
  'Medical Supplies',
  'Food & Nutrition',
  'Emergency Shelter',
  'Potable Water',
  'Power & Heating',
  'Infant & Elder Care',
];

const URGENCIES: UrgencyLevel[] = ['High', 'Medium', 'Low'];

const REGIONS: RegionTag[] = [
  'North Ward',
  'East River Basin',
  'South Industrial',
  'Highland Ridge',
  'West Central',
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AidCategory>('Medical Supplies');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');
  const [region, setRegion] = useState<RegionTag>(
    (currentUser?.region as RegionTag) || 'North Ward'
  );
  const [location, setLocation] = useState(
    currentUser?.role === 'seeker' ? `${currentUser.organization}, ${currentUser.region}` : ''
  );
  const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
  const [quantityNeeded, setQuantityNeeded] = useState<number>(50);
  const [unit, setUnit] = useState('Sterile Packs');
  const [description, setDescription] = useState('');
  const [contactChannel, setContactChannel] = useState(
    currentUser?.role === 'seeker' ? `${currentUser.displayName} (${currentUser.phone || currentUser.email})` : ''
  );
  const [neededBy, setNeededBy] = useState('Within 12 hours');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || quantityNeeded <= 0) return;

    onSubmit({
      title,
      category,
      urgency,
      region,
      location,
      targetBeneficiaries: targetBeneficiaries || 'Local displaced community members',
      quantityNeeded,
      unit,
      description,
      contactChannel: contactChannel || 'Local Civic Node Dispatch',
      neededBy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 my-8 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span>Civic Beacon Broadcast</span>
              <span aria-hidden="true">·</span>
              <span>Peer-to-Peer Intake</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Broadcast Community Aid Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Primary Aid Need Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Critical Infant Formula & Clean Drinking Water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Aid Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="High">High (Immediate &lt; 6h)</option>
                <option value="Medium">Medium (Urgent &lt; 24h)</option>
                <option value="Low">Low (Replenish 48h+)</option>
              </select>
            </div>
          </div>

          {/* Region & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                District Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REGIONS.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Delivery Location / Facility *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. North Ward Senior Center, 840 Maple St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quantity, Unit & Deadline */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quantity Needed
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantityNeeded}
                onChange={(e) => setQuantityNeeded(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Unit Type
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Crates, Sets, Packs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Needed By
              </label>
              <input
                type="text"
                placeholder="e.g. Tonight 20:00"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Target Beneficiaries & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Beneficiaries Count & Profile
              </label>
              <input
                type="text"
                placeholder="e.g. 60 elderly residents displaced"
                value={targetBeneficiaries}
                onChange={(e) => setTargetBeneficiaries(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Contact Mesh / Phone / Signal
              </label>
              <input
                type="text"
                placeholder="e.g. Radio Ch 3 / Signal #northward"
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Detailed Context & Urgency Specifics
            </label>
            <textarea
              rows={3}
              placeholder="Provide clinical details, refrigeration requirements, or access constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Request to Protocol</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
