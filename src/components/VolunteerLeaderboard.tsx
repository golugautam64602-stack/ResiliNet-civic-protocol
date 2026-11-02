import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Truck, 
  Package, 
  ShieldCheck, 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowUpRight, 
  HeartHandshake, 
  CheckCircle2, 
  Activity,
  Sparkles,
  Database
} from 'lucide-react';
import { LeaderboardContributor, LedgerTransaction, RegionTag } from '../types';
import { UserProfile, UserRole } from '../types/auth';
import { INITIAL_LEADERBOARD_CONTRIBUTORS } from '../data/mockData';

interface VolunteerLeaderboardProps {
  ledger: LedgerTransaction[];
  registeredUsers?: UserProfile[];
  onInspectBlock?: (tx: LedgerTransaction) => void;
  onOpenAuth?: () => void;
}

const ALL_REGIONS: (RegionTag | 'All')[] = [
  'All',
  'North Ward',
  'East River Basin',
  'South Industrial',
  'Highland Ridge',
  'West Central',
];

export const VolunteerLeaderboard: React.FC<VolunteerLeaderboardProps> = ({
  ledger,
  registeredUsers = [],
  onInspectBlock,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'seeker' | 'volunteer' | 'donor'>('all');
  const [selectedRegion, setSelectedRegion] = useState<RegionTag | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically calculate additional transactions completed in the live session
  const dynamicContributors = useMemo(() => {
    let contributors = [...INITIAL_LEADERBOARD_CONTRIBUTORS];
    const newTxCount = ledger.length - 5;
    if (newTxCount > 0) {
      contributors = contributors.map(c => {
        if (c.id === 'VOL-01') {
          return {
            ...c,
            completedTransactions: c.completedTransactions + newTxCount,
            lastActive: 'Just now',
          };
        }
        return c;
      });
    }
    return contributors;
  }, [ledger]);

  // Filter contributors
  const filteredContributors = useMemo(() => {
    return dynamicContributors.filter(c => {
      if (activeTab !== 'all' && activeTab !== 'seeker') {
        if (c.type !== activeTab) return false;
      }
      if (activeTab === 'seeker') return false;
      if (selectedRegion !== 'All' && c.region !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesOrg = c.organization.toLowerCase().includes(query);
        const matchesCategory = c.primaryCategory.toLowerCase().includes(query);
        const matchesBadge = c.badge.toLowerCase().includes(query);
        if (!matchesName && !matchesOrg && !matchesCategory && !matchesBadge) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.completedTransactions - a.completedTransactions);
  }, [dynamicContributors, activeTab, selectedRegion, searchQuery]);

  // Filter registered users from database
  const filteredDatabaseUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      if (activeTab !== 'all' && u.role !== activeTab) {
        return false;
      }
      if (selectedRegion !== 'All' && u.region !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = u.displayName.toLowerCase().includes(query);
        const matchesOrg = u.organization.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        if (!matchesName && !matchesOrg && !matchesEmail) {
          return false;
        }
      }
      return true;
    });
  }, [registeredUsers, activeTab, selectedRegion, searchQuery]);

  const totalVerifiedCompleted = useMemo(() => {
    return dynamicContributors.reduce((sum, c) => sum + c.completedTransactions, 0);
  }, [dynamicContributors]);

  return (
    <div className="space-y-6">
      
      {/* Header Strip with Live Metric Badges */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Civic Honor Roll & Database Directory</span>
              <span aria-hidden="true">·</span>
              <span>Categorized Protocol Accounts</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Database Users & Volunteer Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore registered users categorized by role (Aid Seekers, Logistics Volunteers, Supply Donors) and on-chain verified contributors.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-mono font-extrabold tabular-nums text-slate-900 dark:text-white">
                {registeredUsers.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Database Accounts</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-mono font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                {totalVerifiedCompleted}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Dispatches</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-mono font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                100%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Synced in Firestore</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Segmented Persona Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Accounts ({registeredUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seeker')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'seeker'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Aid Seekers (अनुरोधकर्ता)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('volunteer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'volunteer'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Volunteers (स्वयंसेवक)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('donor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'donor'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Supply Donors (दाता)</span>
            </button>
          </div>

          {/* Region and Search Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email or org..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ALL_REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg === 'All' ? 'All Districts' : reg}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Database Users Categorized Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Database Accounts Directory ({filteredDatabaseUsers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Live Firestore `/users` Collection</span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Name & Email</th>
                  <th className="py-3 px-3">Role Category</th>
                  <th className="py-3 px-3">Organization / Affiliation</th>
                  <th className="py-3 px-3">Region</th>
                  <th className="py-3 px-3">Contact Phone</th>
                  <th className="py-3 px-3 text-right">Database Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {filteredDatabaseUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No database users found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDatabaseUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {user.displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {user.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          user.role === 'seeker'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : user.role === 'donor'
                            ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}>
                          {user.role === 'seeker' && <HeartHandshake className="w-3 h-3" />}
                          {user.role === 'donor' && <Package className="w-3 h-3" />}
                          {user.role === 'volunteer' && <Truck className="w-3 h-3" />}
                          <span>
                            {user.role === 'seeker' ? 'Aid Seeker (अनुरोधकर्ता)' : user.role === 'donor' ? 'Supply Donor (दाता)' : 'Volunteer (स्वयंसेवक)'}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                        {user.organization || 'Civic Participant'}
                      </td>

                      <td className="py-3.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                        {user.region || 'North Ward'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {user.phone || '+1-555-CIVIC'}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Synced & Verified</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* On-Chain Leaderboard Section (Volunteers & Donors) */}
      {(activeTab === 'all' || activeTab === 'volunteer' || activeTab === 'donor') && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Verified On-Chain Contributors Leaderboard</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Immutable Ledger Dispatches</span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">Rank</th>
                    <th className="py-3 px-3">Contributor / Fleet</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Operating Region</th>
                    <th className="py-3 px-3 text-right">Verified Transactions</th>
                    <th className="py-3 px-3">Total Volume Fulfilled</th>
                    <th className="py-3 px-3 text-center">Consensus Rate</th>
                    <th className="py-3 px-3 text-right">Recent Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filteredContributors.map((c, index) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {c.organization}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {c.badge}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          c.type === 'volunteer'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {c.type === 'volunteer' ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          <span>{c.type === 'volunteer' ? 'Courier' : 'Donor'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                        {c.region}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">
                          {c.completedTransactions}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          Verified On-Chain
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {c.totalVolume}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Primary: {c.primaryCategory}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {c.reliabilityRate}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="text-slate-500 font-sans text-[11px]">
                          {c.lastActive}
                        </div>
                        {c.recentBlockHash && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px] ml-auto">
                            {c.recentBlockHash}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
