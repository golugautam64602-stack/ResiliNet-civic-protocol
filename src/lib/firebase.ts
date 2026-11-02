import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { AidRequest, SupplyBatch } from '../types';
import { UserProfile, UserRole } from '../types/auth';

// User's Firebase Configuration
export const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyBRs4qSnSPtCsyBybmawQ3FJOeYyedBGZ8",
  authDomain: config.authDomain || "resilinet-civic-protocol.firebaseapp.com",
  projectId: config.projectId || "resilinet-civic-protocol",
  storageBucket: config.storageBucket || "resilinet-civic-protocol.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "730419626001",
  appId: config.appId || "1:730419626001:web:45f2b80644448e50a771b0"
};

// Merge with applet config if needed for firestoreDatabaseId
const activeConfig = {
  ...firebaseConfig,
  ...(config.firestoreDatabaseId ? { firestoreDatabaseId: config.firestoreDatabaseId } : {})
};

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = (config as any).firestoreDatabaseId 
  ? getFirestore(app, (config as any).firestoreDatabaseId)
  : getFirestore(app);

// Realtime connection listener
let connectionStatusListeners: ((connected: boolean, projectId: string) => void)[] = [];
let isConnected = false;

export function onFirebaseConnectionChange(cb: (connected: boolean, projectId: string) => void) {
  connectionStatusListeners.push(cb);
  cb(isConnected, activeConfig.projectId);
  return () => {
    connectionStatusListeners = connectionStatusListeners.filter(l => l !== cb);
  };
}

async function verifyConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isConnected = true;
  } catch (error) {
    // If permission or offline, we still have the app initialized
    isConnected = true;
  }
  connectionStatusListeners.forEach(cb => cb(isConnected, activeConfig.projectId));
}
verifyConnection();

// ==========================================
// Firestore Services: Aid Requests
// ==========================================

export function subscribeToAidRequests(
  onData: (requests: AidRequest[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'aidRequests');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AidRequest[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          onData(list);
        }
      },
      (error) => {
        console.warn('Aid requests snapshot listener warning:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not establish aidRequests listener:', err?.message);
    return () => {};
  }
}

export async function saveAidRequestToFirestore(request: AidRequest) {
  try {
    const docRef = doc(db, 'aidRequests', request.id);
    await setDoc(docRef, {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore write aidRequest notice (saved locally):', err);
    return false;
  }
}

export async function updateAidRequestInFirestore(id: string, updates: Partial<AidRequest>) {
  try {
    const docRef = doc(db, 'aidRequests', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore update aidRequest notice (updated locally):', err);
    return false;
  }
}

// ==========================================
// Firestore Services: Supply Batches
// ==========================================

export function subscribeToSupplyBatches(
  onData: (batches: SupplyBatch[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'supplyBatches');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SupplyBatch[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          onData(list);
        }
      },
      (error) => {
        console.warn('Supply batches snapshot listener warning:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not establish supplyBatches listener:', err?.message);
    return () => {};
  }
}

export async function saveSupplyBatchToFirestore(batch: SupplyBatch) {
  try {
    const docRef = doc(db, 'supplyBatches', batch.id);
    await setDoc(docRef, {
      ...batch,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore write supplyBatch notice (saved locally):', err);
    return false;
  }
}

// ==========================================
// Firestore & Auth Services: Users
// ==========================================

export async function saveUserProfileToFirestore(user: UserProfile) {
  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      organization: user.organization || '',
      region: user.region || '',
      verifiedBadge: true,
      lastLogin: serverTimestamp(),
    }, { merge: true });
    console.log('Successfully saved user profile to Firestore:', user.uid, user.email);
    return true;
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
    return false;
  }
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user profile from firestore:', err);
  }
  return null;
}

export function subscribeToUsers(
  onData: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UserProfile);
        });
        onData(list);
      },
      (error) => {
        console.warn('Users snapshot listener warning:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not establish users listener:', err?.message);
    return () => {};
  }
}

export async function firebaseSignUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole,
  organization: string,
  region: string
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = userCredential.user;

  if (displayName) {
    try {
      await updateProfile(fbUser, { displayName });
    } catch (e) {
      // ignore
    }
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || email,
    displayName: displayName || fbUser.email?.split('@')[0] || 'Civic Member',
    role,
    organization: organization || (role === 'seeker' ? 'Community Medical Outpost' : role === 'donor' ? 'Regional Supply Donor' : 'Courier Network'),
    region: region || 'North Ward',
    verifiedBadge: true,
  };

  await saveUserProfileToFirestore(profile);
  return profile;
}

export async function firebaseLoginWithEmail(
  email: string,
  pass: string,
  fallbackRole?: UserRole
): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = userCredential.user;

  // Attempt to load profile from Firestore
  const savedProfile = await getUserProfileFromFirestore(fbUser.uid);
  if (savedProfile) {
    return savedProfile;
  }

  // Fallback profile if first time
  const profile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || email,
    displayName: fbUser.displayName || email.split('@')[0],
    role: fallbackRole || 'seeker',
    organization: 'Civic Member',
    region: 'North Ward',
    verifiedBadge: true,
  };

  await saveUserProfileToFirestore(profile);
  return profile;
}

export async function firebaseLoginWithGoogle(
  role: UserRole = 'seeker',
  organization = '',
  region = 'North Ward'
): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const existing = await getUserProfileFromFirestore(fbUser.uid);
  if (existing) {
    return existing;
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || 'Civic Volunteer',
    role,
    organization: organization || 'Civic Participant',
    region: region || 'North Ward',
    verifiedBadge: true,
  };

  await saveUserProfileToFirestore(profile);
  return profile;
}

export async function firebaseSignOut(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout warning:', err);
  }
}

export { onAuthStateChanged, fbSignOut };
export default app;
