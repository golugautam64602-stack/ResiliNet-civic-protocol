export type UserRole = 'seeker' | 'donor' | 'volunteer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organization: string;
  region: string;
  phone?: string;
  verifiedBadge?: boolean;
}

export const PRESET_ACCOUNTS: UserProfile[] = [
  {
    uid: 'user-seeker-01',
    email: 'marcus.thorne@northwardclinic.org',
    displayName: 'Dr. Marcus Thorne',
    role: 'seeker',
    organization: 'North Ward Community Health Outpost',
    region: 'North Ward',
    phone: '+1-555-019-3382',
    verifiedBadge: true,
  },
  {
    uid: 'user-donor-01',
    email: 'elena.vance@valleyagro.org',
    displayName: 'Elena Vance',
    role: 'donor',
    organization: 'Valley Agro Cooperative & Food Bank',
    region: 'East River Basin',
    phone: '+1-555-010-4491',
    verifiedBadge: true,
  },
  {
    uid: 'user-volunteer-01',
    email: 'jordan.chen@civiccourier.org',
    displayName: 'Jordan Chen',
    role: 'volunteer',
    organization: 'Mobile Courier Fleet Unit Bravo',
    region: 'West Central',
    phone: '+1-555-018-9901',
    verifiedBadge: true,
  },
];
