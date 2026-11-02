import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Moon, 
  Sun, 
  Plus, 
  User, 
  LogOut, 
  HeartHandshake, 
  Package, 
  Truck, 
  ChevronDown,
  Bell,
  CheckCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  MapPin,
  FileText
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/auth';
import { CivicNotification } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'requests' | 'map' | 'coordination' | 'ledger' | 'profile';
  setCurrentTab: (tab: 'home' | 'requests' | 'map' | 'coordination' | 'ledger' | 'profile') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenNewRequest: () => void;
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  notifications: CivicNotification[];
  onNotificationClick: (notif: CivicNotification) => void;
  onMarkAllNotificationsRead: () => void;
  onDismissNotification: (id: string) => void;
  emergencyAlert?: { id: string; title: string; message: string; region?: string; requestId?: string } | null;
  onDismissEmergencyAlert?: () => void;
  onSelectEmergencyAlert?: (requestId: string) => void;
  firebaseConnected?: boolean;
  firebaseProjectId?: string;
  onSelectProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  onOpenNewRequest,
  onOpenDonate,
  onOpenVolunteer,
  currentUser,
  onOpenAuth,
  onLogout,
  onSwitchRole,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onDismissNotification,
  emergencyAlert,
  onDismissEmergencyAlert,
  onSelectEmergencyAlert,
  firebaseConnected = true,
  firebaseProjectId = 'resilinet-civic-protocol',
  onSelectProfile,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => (notifFilter === 'all' ? true : !n.read));

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      
      {/* High-Priority Emergency Aid Alert Banner */}
      {emergencyAlert && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white px-4 py-2 text-xs transition-all duration-300 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">
                🚨 Emergency Alert
              </span>
              <span className="font-semibold truncate">{emergencyAlert.title}</span>
              {emergencyAlert.region && (
                <span className="hidden sm:inline-block opacity-90 text-[11px] bg-black/20 px-2 py-0.5 rounded-full shrink-0">
                  📍 {emergencyAlert.region}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {emergencyAlert.requestId && onSelectEmergencyAlert && (
                <button
                  type="button"
                  onClick={() => onSelectEmergencyAlert(emergencyAlert.requestId!)}
                  className="text-[11px] font-bold bg-white text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded shadow-xs transition-colors"
                >
                  Coordinate Now →
                </button>
              )}
              {onDismissEmergencyAlert && (
                <button
                  type="button"
                  onClick={onDismissEmergencyAlert}
                  className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
                  title="Dismiss Alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md py-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                ResiliNet Civic
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase -mt-1">
                Emergency Protocol
              </span>
            </div>
          </button>
        </div>

        {/* Center: Full Navigation Tabs (All options present together) */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'home'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setCurrentTab('requests')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Aid Matching</span>
          </button>
          <button
            onClick={() => setCurrentTab('map')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'map'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Supply Map</span>
          </button>
          <button
            onClick={() => setCurrentTab('coordination')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'coordination'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Coordinator</span>
          </button>
          <button
            onClick={() => setCurrentTab('ledger')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Civic Ledger</span>
          </button>
        </nav>

        {/* Right: Quick Action Buttons & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Donate Supplies Quick Action */}
          <button
            type="button"
            onClick={onOpenDonate}
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors whitespace-nowrap"
            title="Donate Surplus Supplies"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Donate</span>
          </button>

          {/* Volunteer Quick Action */}
          <button
            type="button"
            onClick={onOpenVolunteer}
            className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors whitespace-nowrap"
            title="Volunteer Courier Roster"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Volunteer</span>
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
              }}
              aria-label="View notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 transition-colors shadow-2xs"
              title="Real-time Protocol Feed"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden text-xs">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">Real-Time Updates</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkAllNotificationsRead()}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="px-3.5 pt-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      notifFilter === 'all'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('unread')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      notifFilter === 'unread'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <Bell className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">All caught up</div>
                      <div className="text-[11px] text-slate-400">No unread protocol notifications.</div>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onNotificationClick(notif);
                          setIsNotifOpen(false);
                        }}
                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                          !notif.read
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === 'match'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : notif.type === 'request'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : notif.type === 'dispatch'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                        }`}>
                          {notif.type === 'match' && <Sparkles className="w-3.5 h-3.5" />}
                          {notif.type === 'request' && <AlertCircle className="w-3.5 h-3.5" />}
                          {notif.type === 'dispatch' && <Truck className="w-3.5 h-3.5" />}
                          {notif.type === 'ledger' && <ShieldCheck className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 space-y-1 pr-4">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {notif.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 absolute right-3 top-4 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Badge */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotifOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  currentUser.role === 'seeker'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : currentUser.role === 'donor'
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                    : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                }`}
                title="Account Settings & Role Switcher"
              >
                {currentUser.role === 'seeker' && <HeartHandshake className="w-3.5 h-3.5 shrink-0" />}
                {currentUser.role === 'donor' && <Package className="w-3.5 h-3.5 shrink-0" />}
                {currentUser.role === 'volunteer' && <Truck className="w-3.5 h-3.5 shrink-0" />}
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.displayName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 space-y-2 z-50 text-xs"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.organization}</div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
                      Role: {currentUser.role}
                    </div>
                  </div>

                  <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onSelectProfile && onSelectProfile()}
                      className="w-full text-left px-2 py-1.5 rounded flex items-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Database Profile</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Switch Role:
                    </div>
                    <button
                      type="button"
                      onClick={() => onSwitchRole('seeker')}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                        currentUser.role === 'seeker'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Aid Seeker (अनुरोधकर्ता)</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchRole('donor')}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                        currentUser.role === 'donor'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Supply Donor (दाता)</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchRole('volunteer')}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                        currentUser.role === 'volunteer'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Volunteer (स्वयंसेवक)</span>
                      </span>
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full text-left px-2 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Roles</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle color theme"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 transition-colors shadow-2xs"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Plus className="w-4 h-4" />
            <span>Request Aid</span>
          </button>
        </div>

      </div>

      {/* Mobile & Tablet navigation row (ensuring all options are always accessible) */}
      <div className="xl:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-2 overflow-x-auto text-xs font-semibold text-slate-600 dark:text-slate-300 gap-1 bg-slate-50/80 dark:bg-slate-900/80">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${currentTab === 'home' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setCurrentTab('requests')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${currentTab === 'requests' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Aid Matching
        </button>
        <button
          onClick={() => setCurrentTab('map')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${currentTab === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Supply Map
        </button>
        <button
          onClick={() => setCurrentTab('coordination')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${currentTab === 'coordination' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Coordinator
        </button>
        <button
          onClick={() => setCurrentTab('ledger')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${currentTab === 'ledger' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Ledger
        </button>
        <button
          onClick={onOpenDonate}
          className="px-3 py-1 rounded-lg whitespace-nowrap bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        >
          + Donate
        </button>
        <button
          onClick={onOpenVolunteer}
          className="px-3 py-1 rounded-lg whitespace-nowrap bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
        >
          + Volunteer
        </button>
      </div>
    </header>
  );
};
