/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { AidDashboard } from './components/AidDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { SupplyCoordination } from './components/SupplyCoordination';
import { CivicLedger } from './components/CivicLedger';
import { NewRequestModal } from './components/modals/NewRequestModal';
import { RequestDetailModal } from './components/modals/RequestDetailModal';
import { VerifyLedgerModal } from './components/modals/VerifyLedgerModal';
import { AuthModal, RequiredAuthContext } from './components/modals/AuthModal';
import { Profile } from './components/Profile';
import { ToastContainer, ToastMessage } from './components/Toast';
import { UserProfile, UserRole, PRESET_ACCOUNTS } from './types/auth';

import { 
  INITIAL_AID_REQUESTS, 
  INITIAL_SUPPLY_BATCHES, 
  INITIAL_SUPPLY_NODES, 
  INITIAL_MATCHING_LOG, 
  INITIAL_LEDGER, 
  INITIAL_STATS,
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

import { 
  AidRequest, 
  SupplyBatch, 
  SupplyNode, 
  MatchingLogEntry, 
  LedgerTransaction, 
  CivicStats, 
  CivicNotification 
} from './types';
import { 
  subscribeToAidRequests, 
  saveAidRequestToFirestore, 
  updateAidRequestInFirestore, 
  subscribeToSupplyBatches, 
  saveSupplyBatchToFirestore, 
  saveUserProfileToFirestore,
  subscribeToUsers,
  onFirebaseConnectionChange,
  firebaseConfig,
  onAuthStateChanged,
  firebaseSignOut,
  getUserProfileFromFirestore,
  auth
} from './lib/firebase';
import { ShieldCheck, Heart, Radio, Github } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'requests' | 'map' | 'coordination' | 'ledger' | 'profile'>('home');

  // Application Data States
  const [requests, setRequests] = useState<AidRequest[]>(INITIAL_AID_REQUESTS);
  const [batches, setBatches] = useState<SupplyBatch[]>(INITIAL_SUPPLY_BATCHES);
  const [nodes, setNodes] = useState<SupplyNode[]>(INITIAL_SUPPLY_NODES);
  const [matchingLogs, setMatchingLogs] = useState<MatchingLogEntry[]>(INITIAL_MATCHING_LOG);
  const [ledger, setLedger] = useState<LedgerTransaction[]>(INITIAL_LEDGER);
  const [stats, setStats] = useState<CivicStats>(INITIAL_STATS);

  // User Authentication & Role State - Unauthenticated by default so gating activates
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resilinet_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(PRESET_ACCOUNTS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authContext, setAuthContext] = useState<RequiredAuthContext | null>(null);
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<(() => void) | null>(null);

  // Modal States
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AidRequest | null>(null);
  const [selectedLedgerTx, setSelectedLedgerTx] = useState<LedgerTransaction | null>(null);

  // Real-time updates & notifications state
  const [notifications, setNotifications] = useState<CivicNotification[]>(INITIAL_NOTIFICATIONS);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Firebase connection & state
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [firebaseProject, setFirebaseProject] = useState(firebaseConfig.projectId);

  // Dismissed Emergency Alerts
  const [dismissedEmergencyIds, setDismissedEmergencyIds] = useState<string[]>([]);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
        if (firestoreProfile) {
          setCurrentUser(firestoreProfile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('resilinet_user', JSON.stringify(firestoreProfile));
          }
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Sync with Firestore in real-time
  useEffect(() => {
    // Seed preset accounts to Firestore on mount
    PRESET_ACCOUNTS.forEach(acc => saveUserProfileToFirestore(acc));

    const unsubConn = onFirebaseConnectionChange((connected, projId) => {
      setFirebaseConnected(connected);
      setFirebaseProject(projId);
    });

    const unsubUsers = subscribeToUsers((remoteUsers) => {
      const map = new Map<string, UserProfile>();
      PRESET_ACCOUNTS.forEach(acc => map.set(acc.uid, acc));
      if (remoteUsers) {
        remoteUsers.forEach(u => map.set(u.uid, u));
      }
      setRegisteredUsers(Array.from(map.values()));
    });

    const unsubReqs = subscribeToAidRequests((remoteReqs) => {
      if (remoteReqs && remoteReqs.length > 0) {
        setRequests(prev => {
          const map = new Map<string, AidRequest>();
          prev.forEach(r => map.set(r.id, r));
          remoteReqs.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    });

    const unsubBatches = subscribeToSupplyBatches((remoteBatches) => {
      if (remoteBatches && remoteBatches.length > 0) {
        setBatches(prev => {
          const map = new Map<string, SupplyBatch>();
          prev.forEach(b => map.set(b.id, b));
          remoteBatches.forEach(b => map.set(b.id, b));
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubConn();
      unsubUsers();
      unsubReqs();
      unsubBatches();
    };
  }, []);

  // Determine active high-urgency emergency alert
  const urgentRequestCandidate = requests.find(
    r => r.urgency === 'High' && r.status === 'Open' && !dismissedEmergencyIds.includes(r.id)
  );

  const emergencyAlert = urgentRequestCandidate
    ? {
        id: urgentRequestCandidate.id,
        title: `${urgentRequestCandidate.title} - ${urgentRequestCandidate.quantityNeeded} ${urgentRequestCandidate.unit} urgently needed!`,
        message: urgentRequestCandidate.description,
        region: urgentRequestCandidate.region,
        requestId: urgentRequestCandidate.id,
      }
    : null;

  const handleDismissEmergencyAlert = () => {
    if (urgentRequestCandidate) {
      setDismissedEmergencyIds(prev => [...prev, urgentRequestCandidate.id]);
    }
  };

  const handleSelectEmergencyAlert = (requestId: string) => {
    setCurrentTab('requests');
    const target = requests.find(r => r.id === requestId);
    if (target) {
      setSelectedRequest(target);
    }
  };

  // Add new notification helper
  const pushNotification = (
    type: CivicNotification['type'],
    title: string,
    message: string,
    targetTab?: CivicNotification['targetTab'],
    targetId?: string
  ) => {
    const newNotif: CivicNotification = {
      id: `NOTIF-${Date.now().toString(36)}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      targetTab,
      targetId,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleNotificationClick = (notif: CivicNotification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );

    // Navigate to target tab
    if (notif.targetTab) {
      setCurrentTab(notif.targetTab);
    }

    // Open target modal if applicable
    if (notif.targetTab === 'requests' && notif.targetId) {
      const targetReq = requests.find(r => r.id === notif.targetId);
      if (targetReq) {
        setSelectedRequest(targetReq);
      }
    } else if (notif.targetTab === 'ledger' && notif.targetId) {
      const targetTx = ledger.find(tx => tx.blockHeight.toString() === notif.targetId);
      if (targetTx) {
        setSelectedLedgerTx(targetTx);
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Marked Read', 'All real-time protocol updates are up to date.');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resilinet_user', JSON.stringify(user));
    }
    // Sync to Firebase Firestore
    saveUserProfileToFirestore(user);
    addToast(
      'success',
      `Welcome, ${user.displayName}!`,
      `Signed in as ${user.role === 'seeker' ? 'Aid Seeker (अनुरोधकर्ता)' : user.role === 'donor' ? 'Supply Donor (दाता)' : 'Logistics Volunteer (स्वयंसेवक)'} · ${user.organization}`
    );

    // If there was a pending gated action (e.g. open request modal, donate, or volunteer dispatch), run it
    if (pendingActionAfterAuth) {
      const action = pendingActionAfterAuth;
      setPendingActionAfterAuth(null);
      setAuthContext(null);
      setTimeout(() => {
        action();
      }, 150);
    } else {
      setAuthContext(null);
    }
  };

  const handleLogout = async () => {
    await firebaseSignOut();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resilinet_user');
    }
    addToast('info', 'Logged Out', 'You have been signed out. Please sign in before requesting, donating, or volunteering.');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    // Require authentication before changing role (no direct role switching without authentication)
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resilinet_user');
    }
    setAuthContext({
      action: 'general',
      targetRole: newRole,
      title: `Sign In Required to Switch Role (${newRole === 'seeker' ? 'Aid Seeker' : newRole === 'donor' ? 'Supply Donor' : 'Volunteer'})`,
      message: 'Protocol security requires authentication before changing roles. Please sign in or register with your credentials.',
    });
    setPendingActionAfterAuth(() => () => {
      const preset = PRESET_ACCOUNTS.find(p => p.role === newRole) || PRESET_ACCOUNTS[0];
      const targetUser = { ...preset, role: newRole };
      setCurrentUser(targetUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('resilinet_user', JSON.stringify(targetUser));
      }
      saveUserProfileToFirestore(targetUser);
    });
    setIsAuthModalOpen(true);
    addToast('info', 'Authentication Required', 'Please sign in or authenticate before changing protocol roles.');
  };

  // ========================================================
  // Action Gating: Sign In / Sign Up Before Requesting Aid
  // ========================================================
  const handleGateRequestAid = () => {
    if (!currentUser) {
      setAuthContext({
        action: 'request',
        targetRole: 'seeker',
        title: 'Sign In Required to Request Aid (अनुरोध से पहले साइन इन)',
        message: 'Please sign in or create an account as an Aid Seeker (Clinic, Shelter, or Community Lead) before broadcasting an aid beacon.',
      });
      setPendingActionAfterAuth(() => () => setIsNewRequestOpen(true));
      setIsAuthModalOpen(true);
      addToast(
        'info',
        'Authentication Required',
        'Please sign in or register before posting a community aid beacon.'
      );
      return;
    }

    // Role check: Only Aid Seekers can request aid
    if (currentUser.role !== 'seeker') {
      addToast(
        'warning',
        'Role Restricted: Aid Seeker Required',
        `You are currently signed in as a ${currentUser.role === 'donor' ? 'Supply Donor' : 'Logistics Volunteer'}. Only registered Aid Seekers can broadcast aid beacons.`
      );
      setAuthContext({
        action: 'request',
        targetRole: 'seeker',
        title: 'Aid Seeker Persona Required',
        message: 'Only Aid Seekers (Clinic, Shelter, or Community Lead) are authorized to post emergency aid requests. Please authenticate as an Aid Seeker.',
      });
      setPendingActionAfterAuth(() => () => {
        const updated = { ...currentUser, role: 'seeker' as UserRole };
        setCurrentUser(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('resilinet_user', JSON.stringify(updated));
        }
        saveUserProfileToFirestore(updated);
        setIsNewRequestOpen(true);
      });
      setIsAuthModalOpen(true);
      return;
    }

    setIsNewRequestOpen(true);
  };

  // ========================================================
  // Action Gating: Sign In / Sign Up Before Donating Supplies
  // ========================================================
  const handleGateDonateSupplies = (onProceed: () => void) => {
    if (!currentUser) {
      setAuthContext({
        action: 'donate',
        targetRole: 'donor',
        title: 'Sign In Required to Donate Supplies (दान से पहले साइन इन)',
        message: 'Please sign in or create an account as a Supply Donor before registering inventory or pledging community donations.',
      });
      setPendingActionAfterAuth(() => onProceed);
      setIsAuthModalOpen(true);
      addToast(
        'info',
        'Authentication Required',
        'Please sign in or register as a Donor before contributing supplies.'
      );
      return false;
    }
    onProceed();
    return true;
  };

  // ========================================================
  // Action Gating: Sign In / Sign Up Before Volunteering
  // ========================================================
  const handleGateVolunteer = (onProceed: () => void) => {
    if (!currentUser) {
      setAuthContext({
        action: 'volunteer',
        targetRole: 'volunteer',
        title: 'Sign In Required to Volunteer (स्वयंसेवा से पहले साइन इन)',
        message: 'Please sign in or register as a Logistics Volunteer Courier before claiming dispatches, verifying routes, or confirming deliveries.',
      });
      setPendingActionAfterAuth(() => onProceed);
      setIsAuthModalOpen(true);
      addToast(
        'info',
        'Authentication Required',
        'Please sign in or register as a Volunteer Courier to accept logistics dispatches.'
      );
      return false;
    }
    onProceed();
    return true;
  };

  // Aid Request Submission
  const handleCreateAidRequest = (
    newReqData: Omit<AidRequest, 'id' | 'quantityPledged' | 'status' | 'postedAt' | 'endorsements' | 'coordinates'>
  ) => {
    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: AidRequest = {
      ...newReqData,
      id: newId,
      quantityPledged: 0,
      status: 'Open',
      postedAt: 'Just now',
      endorsements: 1,
      coordinates: {
        x: Math.floor(20 + Math.random() * 60),
        y: Math.floor(20 + Math.random() * 60),
      },
    };

    setRequests(prev => [newRequest, ...prev]);

    // Persist to Firebase Firestore
    saveAidRequestToFirestore(newRequest);

    // Push real-time notification for community
    pushNotification(
      'request',
      'New aid request in your region',
      `New beacon in ${newReqData.region}: ${newReqData.title} (${newReqData.quantityNeeded} ${newReqData.unit} needed).`,
      'requests',
      newId
    );

    // Check for potential instant automated match
    const candidateBatch = batches.find(
      b => b.category === newReqData.category && (b.quantity - b.allocated) > 0
    );

    if (candidateBatch) {
      const matchQty = Math.min(newReqData.quantityNeeded, candidateBatch.quantity - candidateBatch.allocated);
      const matchLogId = `MATCH-${Math.floor(700 + Math.random() * 300)}`;
      const newLog: MatchingLogEntry = {
        id: matchLogId,
        timestamp: 'Just now',
        requestId: newId,
        requestTitle: newReqData.title,
        supplyId: candidateBatch.id,
        supplyName: candidateBatch.itemName,
        donorName: candidateBatch.donorName,
        quantityMatched: matchQty,
        unit: newReqData.unit,
        recipientNode: newReqData.location,
        compatibilityScore: 97,
        status: 'Automated Match',
      };
      setMatchingLogs(prev => [newLog, ...prev]);

      // Push real-time match notification
      pushNotification(
        'match',
        'Your supply batch was matched',
        `Batch ${candidateBatch.id} (${candidateBatch.itemName}) paired with request ${newId} at 97% compatibility.`,
        'coordination',
        matchLogId
      );

      addToast(
        'success',
        `Aid Beacon ${newId} Broadcasted!`,
        `Immediate algorithmic match candidate identified with batch ${candidateBatch.id} (${candidateBatch.itemName}).`
      );
    } else {
      addToast(
        'info',
        `Aid Beacon ${newId} Active`,
        `Broadcasted across ${nodes.length} regional depots and volunteer courier radios.`
      );
    }
  };

  // Supply Batch Registration
  const handleRegisterSupplyBatch = (
    newBatchData: Omit<SupplyBatch, 'id' | 'allocated' | 'readyForPickup' | 'registeredAt'>
  ) => {
    const newId = `SUP-${Math.floor(4000 + Math.random() * 1000)}`;
    const newBatch: SupplyBatch = {
      ...newBatchData,
      id: newId,
      allocated: 0,
      readyForPickup: true,
      registeredAt: 'Just now',
    };

    setBatches(prev => [newBatch, ...prev]);

    // Persist to Firebase Firestore
    saveSupplyBatchToFirestore(newBatch);

    // Find open requests that match this category
    const matchingRequest = requests.find(
      r => r.category === newBatchData.category && r.quantityPledged < r.quantityNeeded
    );

    if (matchingRequest) {
      const remainingNeeded = matchingRequest.quantityNeeded - matchingRequest.quantityPledged;
      const matchedQty = Math.min(newBatchData.quantity, remainingNeeded);

      const newLogId = `MATCH-${Math.floor(700 + Math.random() * 300)}`;
      const newLog: MatchingLogEntry = {
        id: newLogId,
        timestamp: 'Just now',
        requestId: matchingRequest.id,
        requestTitle: matchingRequest.title,
        supplyId: newId,
        supplyName: newBatchData.itemName,
        donorName: newBatchData.donorName,
        quantityMatched: matchedQty,
        unit: newBatchData.unit,
        recipientNode: matchingRequest.location,
        compatibilityScore: 98,
        status: 'Automated Match',
      };
      setMatchingLogs(prev => [newLog, ...prev]);

      // Push real-time match notification
      pushNotification(
        'match',
        'Your supply batch was matched',
        `Batch ${newId} (${newBatchData.itemName}) paired with request ${matchingRequest.id} at 98% score.`,
        'coordination',
        newLogId
      );

      addToast(
        'success',
        `Supply Batch ${newId} Registered`,
        `Paired with urgent open beacon ${matchingRequest.id} (${matchingRequest.title}).`
      );
    } else {
      addToast(
        'success',
        `Supply Batch ${newId} In Stock`,
        `${newBatchData.quantity} ${newBatchData.unit} of ${newBatchData.itemName} logged into depot inventory.`
      );
    }
  };

  // Endorse an aid request
  const handleEndorseRequest = (requestId: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, endorsements: r.endorsements + 1 } : r))
    );
    addToast('info', 'Need Beacon Endorsed', 'Civic credibility score updated for local prioritization.');
  };

  // Direct manual pledge to request
  const handlePledgeToRequest = (requestId: string, pledgeAmount: number) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const newPledged = Math.min(r.quantityNeeded, r.quantityPledged + pledgeAmount);
          const newStatus = newPledged >= r.quantityNeeded ? 'Matched' : 'In Staging';
          return {
            ...r,
            quantityPledged: newPledged,
            status: newStatus,
          };
        }
        return r;
      })
    );

    addToast(
      'success',
      'Pledge Confirmed',
      `Allocated +${pledgeAmount} items toward fulfillment.`
    );
  };

  // Match request with batch directly from modal
  const handleMatchWithBatch = (requestId: string, batchId: string, quantityToMatch: number) => {
    // Update batch allocated
    setBatches(prev =>
      prev.map(b => (b.id === batchId ? { ...b, allocated: b.allocated + quantityToMatch } : b))
    );

    // Update request pledged
    let matchedReq: AidRequest | undefined;
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          matchedReq = r;
          const newPledged = Math.min(r.quantityNeeded, r.quantityPledged + quantityToMatch);
          return {
            ...r,
            quantityPledged: newPledged,
            status: newPledged >= r.quantityNeeded ? 'Matched' : 'In Staging',
            matchedSupplyId: batchId,
          };
        }
        return r;
      })
    );

    // Create match log
    const batch = batches.find(b => b.id === batchId);
    if (batch && matchedReq) {
      const newLogId = `MATCH-${Math.floor(700 + Math.random() * 300)}`;
      const newLog: MatchingLogEntry = {
        id: newLogId,
        timestamp: 'Just now',
        requestId,
        requestTitle: matchedReq.title,
        supplyId: batchId,
        supplyName: batch.itemName,
        donorName: batch.donorName,
        quantityMatched: quantityToMatch,
        unit: batch.unit,
        recipientNode: matchedReq.location,
        compatibilityScore: 99,
        status: 'Approved',
        assignedCourier: 'Express Volunteer Transport #02',
      };
      setMatchingLogs(prev => [newLog, ...prev]);
    }

    addToast(
      'success',
      'Direct Pairing Approved',
      `Batch ${batchId} matched with beacon ${requestId}. Transport scheduled.`
    );
  };

  // Approve a match in coordinator log
  const handleApproveDispatch = (logId: string) => {
    setMatchingLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, status: 'Approved' } : l))
    );
    addToast('info', 'Dispatch Approved', 'Staging hub notified to prepare palletization.');
  };

  // Assign courier in coordinator log
  const handleAssignCourier = (logId: string, courierName: string) => {
    let targetLog: MatchingLogEntry | undefined;
    setMatchingLogs(prev =>
      prev.map(l => {
        if (l.id === logId) {
          targetLog = l;
          return {
            ...l,
            status: 'Dispatched',
            assignedCourier: courierName,
          };
        }
        return l;
      })
    );

    if (targetLog) {
      setRequests(prev =>
        prev.map(r => (r.id === targetLog?.requestId ? { ...r, status: 'En Route' } : r))
      );
    }

    addToast('info', 'Courier Assigned', `${courierName} is en route to pick up at staging hub.`);
  };

  // Confirm delivery & commit to civic ledger
  const handleConfirmDelivery = (logId: string) => {
    const log = matchingLogs.find(l => l.id === logId);
    if (!log) return;

    // Update log status
    setMatchingLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, status: 'Delivered' } : l))
    );

    // Update request status
    setRequests(prev =>
      prev.map(r => (r.id === log.requestId ? { ...r, status: 'Fulfilled' } : r))
    );

    // Create new ledger transaction block
    const newBlockHeight = (ledger[0]?.blockHeight ?? 14208) + 1;
    const blockHashShort = '0x' + Math.random().toString(16).substring(2, 9) + '...' + Math.random().toString(16).substring(2, 8);
    const txHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const proofHash = 'sha256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: LedgerTransaction = {
      blockHeight: newBlockHeight,
      blockHash: blockHashShort,
      txHash: txHash,
      timestamp: 'Just now, ' + new Date().toLocaleTimeString(),
      category: 'Medical Supplies', // default fallback
      recipientNode: log.recipientNode,
      supplySource: log.donorName,
      itemsDelivered: `${log.quantityMatched} ${log.unit} (${log.supplyName})`,
      quantity: log.quantityMatched,
      unit: log.unit,
      witnessSignatures: [
        { role: 'Receiving Site Coordinator', address: '0xCoord...71B4', timestamp: new Date().toLocaleTimeString() },
        { role: 'Volunteer Courier Envoy', address: '0xEnvoy...29A0', timestamp: new Date().toLocaleTimeString() },
        { role: 'Civic Protocol Node Validator', address: '0xValidator...88FC', timestamp: new Date().toLocaleTimeString() },
      ],
      gpsLock: '37.7790° N, 122.4120° W (Radius ±2m)',
      verificationMethod: 'Multi-Sig Witness Attestation',
      receiptProofHash: proofHash,
    };

    setLedger(prev => [newTx, ...prev]);

    // Push real-time ledger commit notification
    pushNotification(
      'ledger',
      'Delivery committed to Civic Ledger',
      `Block #${newBlockHeight} locked with 3-of-3 witness cryptographic signatures for ${log.recipientNode}.`,
      'ledger',
      newBlockHeight.toString()
    );

    // Update stats counters
    setStats(prev => ({
      ...prev,
      medicalPacksDeployed: prev.medicalPacksDeployed + (log.unit.includes('Pack') ? log.quantityMatched : 10),
      foodDistributedKg: prev.foodDistributedKg + (log.unit.includes('Crate') ? log.quantityMatched * 15 : 0),
      fulfillmentRatePercent: 97.2,
    }));

    addToast(
      'success',
      'Delivery Committed to Civic Ledger!',
      `Block #${newBlockHeight} locked with 3-of-3 witness cryptographic signatures.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Universal Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenNewRequest={handleGateRequestAid}
        onOpenDonate={() => {
          handleGateDonateSupplies(() => setCurrentTab('coordination'));
        }}
        onOpenVolunteer={() => {
          handleGateVolunteer(() => setCurrentTab('requests'));
        }}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthContext({
            action: 'general',
            title: 'Civic Protocol Login / नया खाता',
            message: 'Sign in or create an account to request aid, donate surplus supplies, or dispatch as a courier.',
          });
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onDismissNotification={handleDismissNotification}
        emergencyAlert={emergencyAlert}
        onDismissEmergencyAlert={handleDismissEmergencyAlert}
        onSelectEmergencyAlert={handleSelectEmergencyAlert}
        firebaseConnected={firebaseConnected}
        firebaseProjectId={firebaseProject}
        onSelectProfile={() => setCurrentTab('profile')}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingHero
            stats={stats}
            darkMode={darkMode}
            onRequestAid={handleGateRequestAid}
            onCoordinateSupplies={() => setCurrentTab('coordination')}
            onExploreDashboard={() => setCurrentTab('requests')}
            onExploreMap={() => setCurrentTab('map')}
          />
        )}

        {currentTab === 'profile' && (
          <div className="pt-6">
            <Profile
              currentUser={currentUser}
              onOpenAuth={() => {
                setAuthContext({
                  action: 'general',
                  title: 'Civic Protocol Login',
                  message: 'Sign in to view your profile and Firestore database records.',
                });
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
              onUpdateUser={(updated) => setCurrentUser(updated)}
            />
          </div>
        )}

        {currentTab === 'requests' && (
          <div className="pt-6">
            <AidDashboard
              requests={requests}
              ledger={ledger}
              registeredUsers={registeredUsers}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onOpenNewRequest={handleGateRequestAid}
              onEndorseRequest={handleEndorseRequest}
              onInspectBlock={(tx) => setSelectedLedgerTx(tx)}
              onOpenAuth={() => {
                setAuthContext({
                  action: 'volunteer',
                  targetRole: 'volunteer',
                  title: 'Join Civic Roster as Volunteer or Donor',
                  message: 'Sign in or register as a Volunteer Courier or Supply Donor to join the leaderboard and fulfill local community aid requests.',
                });
                setIsAuthModalOpen(true);
              }}
            />
          </div>
        )}

        {currentTab === 'map' && (
          <div className="pt-6">
            <InteractiveMap
              nodes={nodes}
              requests={requests}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onOpenCoordinationWithNode={() => setCurrentTab('coordination')}
            />
          </div>
        )}

        {currentTab === 'coordination' && (
          <div className="pt-6">
            <SupplyCoordination
              batches={batches}
              matchingLogs={matchingLogs}
              nodes={nodes}
              requests={requests}
              onRegisterBatch={(batch) => {
                handleGateDonateSupplies(() => handleRegisterSupplyBatch(batch));
              }}
              onApproveDispatch={(logId) => {
                handleGateVolunteer(() => handleApproveDispatch(logId));
              }}
              onAssignCourier={(logId, courierName) => {
                handleGateVolunteer(() => handleAssignCourier(logId, courierName));
              }}
              onConfirmDelivery={(logId) => {
                handleGateVolunteer(() => handleConfirmDelivery(logId));
              }}
              onViewRequest={(id) => {
                const r = requests.find(item => item.id === id);
                if (r) setSelectedRequest(r);
              }}
              currentUser={currentUser}
            />
          </div>
        )}

        {currentTab === 'ledger' && (
          <div className="pt-6">
            <CivicLedger
              ledger={ledger}
              onInspectBlock={(tx) => setSelectedLedgerTx(tx)}
              onExportSuccess={() => {
                addToast(
                  'success',
                  'Civic Ledger Exported',
                  'Structured audit CSV downloaded with cryptographic hashes, 2-of-3 witness attestations, and geofence coordinates.'
                );
              }}
            />
          </div>
        )}
      </main>

      {/* Clean Civic Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">ResiliNet Civic Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Decentralized Community Aid Matching Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">Firebase: {firebaseProject}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">Consensus: 2-of-3 Attestation</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">Zero Middleman Extraction</span>
            <span aria-hidden="true">·</span>
            <span>Open Civic Protocol</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleCreateAidRequest}
        currentUser={currentUser}
      />

      <RequestDetailModal
        isOpen={Boolean(selectedRequest)}
        request={selectedRequest}
        batches={batches}
        onClose={() => setSelectedRequest(null)}
        onPledge={(reqId, qty) => {
          handleGateDonateSupplies(() => handlePledgeToRequest(reqId, qty));
        }}
        onEndorse={handleEndorseRequest}
        onMatchWithBatch={(reqId, bId, qty) => {
          handleGateDonateSupplies(() => handleMatchWithBatch(reqId, bId, qty));
        }}
      />

      <VerifyLedgerModal
        isOpen={Boolean(selectedLedgerTx)}
        tx={selectedLedgerTx}
        onClose={() => setSelectedLedgerTx(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        authContext={authContext}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthContext(null);
          setPendingActionAfterAuth(null);
        }}
        onLogin={handleLogin}
      />

      {/* Reactive Toast Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
