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
  is_active?: boolean;
  created_at?: string;
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

export interface CaseDocument {
  id: string;
  filename: string;
  file_path: string;
  content_type: string;
  created_at: string;
  uploader?: { id: string; full_name: string; email: string };
}

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
  ai_urgency_score?: number | null;
  ai_summary?: string | null;
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
  breakdowns: {
    donations: Array<{ status: DonationStatus; count: number }>;
    aidRequests: Array<{ status: AidRequestStatus; count: number }>;
  };
  topDonors?: Array<{ id: string; name: string; amount: number }>;
  monthlyTrends?: Array<{ month: string; donations: number; disbursements: number }>;
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

// ─── Notifications & Messages ────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    role: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    role: string;
  };
}
