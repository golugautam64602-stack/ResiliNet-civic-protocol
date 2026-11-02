export type AidCategory =
  | 'Medical Supplies'
  | 'Food & Nutrition'
  | 'Emergency Shelter'
  | 'Potable Water'
  | 'Power & Heating'
  | 'Infant & Elder Care';

export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export type RegionTag =
  | 'North Ward'
  | 'East River Basin'
  | 'South Industrial'
  | 'Highland Ridge'
  | 'West Central';

export interface AidRequest {
  id: string; // e.g. "REQ-8941"
  title: string;
  category: AidCategory;
  urgency: UrgencyLevel;
  region: RegionTag;
  location: string;
  targetBeneficiaries: string;
  quantityNeeded: number;
  quantityPledged: number;
  unit: string;
  description: string;
  contactChannel: string;
  status: 'Open' | 'Matched' | 'In Staging' | 'En Route' | 'Fulfilled';
  postedAt: string;
  neededBy: string;
  endorsements: number;
  matchedSupplyId?: string;
  coordinates: { x: number; y: number }; // percentage 0-100 on map
}

export interface SupplyBatch {
  id: string; // e.g. "SUP-4029"
  donorName: string;
  donorType: 'Community Donor' | 'Local Merchant' | 'Pharmacy Reserve' | 'Municipal Depository' | 'Mutual Aid Network';
  category: AidCategory;
  itemName: string;
  quantity: number;
  allocated: number;
  unit: string;
  condition: 'Sterile / Certified' | 'Shelf-Stable Ambient' | 'Cold-Chain Refrigerated' | 'Clean Packed';
  hubLocation: string;
  region: RegionTag;
  readyForPickup: boolean;
  registeredAt: string;
  notes?: string;
}

export interface SupplyNode {
  id: string;
  name: string;
  type: 'Regional Storage Hub' | 'Community Depot' | 'Medical Relief Cache' | 'Mobile Dispatch Unit';
  region: RegionTag;
  address: string;
  coordinator: string;
  phone: string;
  capacityPercent: number;
  operatingHours: string;
  activeDispatchesCount: number;
  inventorySummary: { category: AidCategory; count: number; unit: string }[];
  coordinates: { x: number; y: number };
  status: 'Operational' | 'High Capacity' | 'Dispatching';
}

export interface MatchingLogEntry {
  id: string;
  timestamp: string;
  requestId: string;
  requestTitle: string;
  supplyId: string;
  supplyName: string;
  donorName: string;
  quantityMatched: number;
  unit: string;
  recipientNode: string;
  compatibilityScore: number; // e.g. 96 (%)
  status: 'Automated Match' | 'Approved' | 'Dispatched' | 'Delivered';
  assignedCourier?: string;
}

export interface LedgerTransaction {
  blockHeight: number;
  blockHash: string;
  txHash: string;
  timestamp: string;
  category: AidCategory;
  recipientNode: string;
  supplySource: string;
  itemsDelivered: string;
  quantity: number;
  unit: string;
  witnessSignatures: { role: string; address: string; timestamp: string }[];
  gpsLock: string;
  verificationMethod: 'Multi-Sig Witness Attestation' | 'QR Chain-of-Custody Lock' | 'NFC Batch Scan';
  receiptProofHash: string;
}

export interface CivicStats {
  foodDistributedKg: number;
  medicalPacksDeployed: number;
  emergencyShelterNights: number;
  cleanWaterLiters: number;
  activeNodes: number;
  fulfillmentRatePercent: number;
  avgMatchTimeHours: number;
}

export interface CivicNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'match' | 'request' | 'dispatch' | 'ledger';
  read: boolean;
  targetTab?: 'home' | 'requests' | 'map' | 'coordination' | 'ledger';
  targetId?: string;
}

export interface LeaderboardContributor {
  id: string;
  name: string;
  type: 'volunteer' | 'donor';
  organization: string;
  region: RegionTag;
  completedTransactions: number;
  totalVolume: string;
  primaryCategory: AidCategory;
  reliabilityRate: number; // percentage
  lastActive: string;
  recentBlockHash?: string;
  badge: string;
}
