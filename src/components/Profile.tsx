import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Building, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  HeartHandshake, 
  Package, 
  Truck,
  Database,
  Lock,
  Sparkles,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { getUserProfileFromFirestore, saveUserProfileToFirestore } from '../lib/firebase';

interface ProfileProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onUpdateUser,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [organization, setOrganization] = useState(currentUser?.organization || '');
  const [region, setRegion] = useState(currentUser?.region || 'North Ward');
  const [message, setMessage] = useState('');

  // Fetch latest profile from Firestore on mount or when currentUser changes
  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoading(true);
      getUserProfileFromFirestore(currentUser.uid)
        .then((fetched) => {
          if (fetched) {
            setProfile(fetched);
            setDisplayName(fetched.displayName);
            setOrganization(fetched.organization);
            setRegion(fetched.region);
          } else {
            setProfile(currentUser);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setProfile(null);
    }
  }, [currentUser]);

  const handleRefreshFromFirestore = async () => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    try {
      const fetched = await getUserProfileFromFirestore(currentUser.uid);
      if (fetched) {
        setProfile(fetched);
        setMessage('Profile data successfully re-fetched from Firestore database.');
      } else {
        setMessage('Profile document not found in Firestore.');
      }
    } catch (err: any) {
      setMessage('Error fetching profile: ' + err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsLoading(true);
    const updated: UserProfile = {
      ...profile,
      displayName: displayName.trim(),
      organization: organization.trim(),
      region,
      verifiedBadge: true, // Mark verified upon update
    };
    try {
      await saveUserProfileToFirestore(updated);
      setProfile(updated);
      if (onUpdateUser) onUpdateUser(updated);
      setIsEditing(false);
      setMessage('Profile updated and synchronized to Firestore successfully!');
    } catch (err: any) {
      setMessage('Failed to update profile: ' + err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  if (!currentUser || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please sign in or register to view your authenticated user profile, organization details, and Firestore database records.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Register Now</span>
          </button>
        </div>
      </div>
    );
  }

  // Check if essential fields are missing
  const isProfileIncomplete = !profile.organization || profile.organization.trim() === '' || !profile.displayName || profile.displayName.trim() === '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* 'Complete Your Profile' Warning Banner if essential fields are missing */}
      {isProfileIncomplete && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-sm">Complete Your Profile (प्रोफाइल पूरी करें)</h2>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Essential details such as your Organization Name or Full Name are currently missing. Complete your profile to ensure valid civic attestations and secure supply chain coordination.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
          >
            Update Profile Now →
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0 relative">
            {profile.displayName.charAt(0).toUpperCase()}
            {profile.verifiedBadge && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md" title="System Verified Account">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Firestore Authenticated User</span>
              </span>
              
              {/* System Verification Indicator */}
              {profile.verifiedBadge ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>System Verified (सत्यापित)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Unverified</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {profile.displayName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              UID: {profile.uid}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleRefreshFromFirestore}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5"
            title="Fetch latest from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="p-3.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details & Edit Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Record Details (`users/{profile.uid}`)</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Display Name / Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Organization / Affiliation <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Ward Health Outpost"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Municipal District</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="North Ward">North Ward</option>
                  <option value="East River Basin">East River Basin</option>
                  <option value="South Industrial">South Industrial</option>
                  <option value="Highland Ridge">Highland Ridge</option>
                  <option value="West Central">West Central</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Save Changes to Firestore</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{profile.displayName}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Email Address</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Organization</span>
                <span className={`font-bold font-sans ${!profile.organization ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {profile.organization || '⚠️ Missing organization name'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Municipal District</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{profile.region || 'North Ward'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Database Uid</span>
                <span className="text-emerald-600 dark:text-emerald-400">{profile.uid}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Role & Verification Indicator Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              System Verification & Role
            </h3>
          </div>

          {/* System Verification Badge Card */}
          <div className={`p-4 rounded-xl border ${
            profile.verifiedBadge 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
              : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          } space-y-2`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${profile.verifiedBadge ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                {profile.verifiedBadge ? <BadgeCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold text-xs">
                  {profile.verifiedBadge ? 'System Verified Account' : 'Pending Verification'}
                </div>
                <div className="text-[10px] font-mono opacity-80">
                  {profile.verifiedBadge ? 'Cryptographically Attested' : 'Action required'}
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {profile.verifiedBadge 
                ? 'Your civic account has been verified by the system consensus protocol for trusted dispatches and attestations.'
                : 'Please complete your organization details and verify your email to achieve full system verification.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                {profile.role === 'seeker' && <HeartHandshake className="w-3.5 h-3.5" />}
                {profile.role === 'donor' && <Package className="w-3.5 h-3.5" />}
                {profile.role === 'volunteer' && <Truck className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs capitalize">
                  {profile.role === 'seeker' ? 'Aid Seeker' : profile.role === 'donor' ? 'Supply Donor' : 'Courier Volunteer'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Active Persona
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              {profile.role === 'seeker' && 'Authorized to broadcast community aid beacons and request emergency supplies.'}
              {profile.role === 'donor' && 'Authorized to register surplus inventory batches and pledge donations.'}
              {profile.role === 'volunteer' && 'Authorized to claim dispatches and sign 2-of-3 witness delivery blocks.'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
