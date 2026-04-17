// ─── Auth ───────────────────────────────────────────────────────────────────

export type Role =
  | 'SUPER_ADMIN'
  | 'NGO_ADMIN'
  | 'CASEWORKER'
  | 'DONOR'
  | 'BENEFICIARY';

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  full_name?: string;
  phone?: string;
}

// ─── Donations ───────────────────────────────────────────────────────────────

export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'ALLOCATED' | 'REFUNDED';
export type PaymentMethod = 'BANK' | 'CARD' | 'CASH' | 'CHEQUE' | 'CRYPTO' | 'MOBILE';

export interface Donation {
  id: string;
  donor_id: string | null;
  donor?: { id: string; full_name: string; email: string } | null;
  amount: string | number;
  currency: string;
  payment_method: PaymentMethod;
  category?: { id: string; name: string } | null;
  region?: { id: string; name: string } | null;
  receipt_number?: string | null;
  is_anonymous: boolean;
  status: DonationStatus;
  donation_date: string;
  notes?: string | null;
  created_at: string;
}

export interface CreateDonationPayload {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  categoryId?: string;
  regionId?: string;
  isAnonymous?: boolean;
  donationDate: string;
  notes?: string;
}

// ─── Aid Requests ─────────────────────────────────────────────────────────────

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AidRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

export interface AidRequest {
  id: string;
  request_number: string;
  beneficiary_id: string;
  beneficiary?: { id: string; full_name: string; email: string };
  caseworker_id?: string | null;
  caseworker?: { id: string; full_name: string; email: string } | null;
  aid_type_id: string;
  aid_type?: { id: string; name: string };
  urgency: UrgencyLevel;
  status: AidRequestStatus;
  estimated_value?: string | number | null;
  region_id: string;
  region?: { id: string; name: string };
  dependants: number;
  description: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAidRequestPayload {
  aidTypeId: string;
  urgency: UrgencyLevel;
  estimatedValue?: number;
  regionId: string;
  dependants?: number;
  description: string;
}

// ─── KPIs / Reporting ────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalDonations: number;
  activeCases: number;
  beneficiaries: number;
}

// ─── API Pagination Meta ─────────────────────────────────────────────────────

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
