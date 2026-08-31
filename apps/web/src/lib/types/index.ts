// ============================================
// EasyFund V2 - TypeScript Types
// ============================================

// ---- User ----
export type UserRole = 'user' | 'fundraiser' | 'admin' | 'moderator';

export type VerificationLevel = 'none' | 'email' | 'phone' | 'identity' | 'payout' | 'full';

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  identityVerified?: boolean;
  payoutVerified?: boolean;
  verificationLevel: VerificationLevel;
  bio?: string;
  location?: string;
  payoutAccountId?: string;
  stripeConnectedAccountId?: string;
  followersCount: number;
  campaignsCount: number;
  totalDonated: number;
  totalRaised: number;
  savedCampaigns?: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Campaign ----
export type CampaignStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_information'
  | 'approved'
  | 'published'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'suspended'
  | 'cancelled';

export type BeneficiaryType = 'self' | 'someone_else' | 'organization' | 'community';

export interface CampaignMilestone {
  percentage: number;
  label: string;
  reached: boolean;
  reachedAt?: string;
}

export interface Campaign {
  _id: string;
  slug: string;
  title: string;
  description: string;
  story: string;
  image: string;
  gallery: string[];
  category: string;
  location?: string;
  status: CampaignStatus;
  goal: number;
  amountRaised: number;
  supportersCount: number;
  deadline: string;
  fundraiserId: string;
  fundraiserName: string;
  fundraiserImage?: string;
  fundraiserVerified: boolean;
  beneficiaryType: BeneficiaryType;
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  milestones: CampaignMilestone[];
  updatesCount: number;
  commentsCount: number;
  riskScore: number;
  reportCount: number;
  featured: boolean;
  trending: boolean;
  faq?: { question: string; answer: string }[];
  createdAt: string;
  updatedAt: string;
}

// ---- Donation ----
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Donation {
  _id: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage?: string;
  fundraiserName: string;
  userId: string;
  userName?: string;
  userEmail: string;
  amount: number;
  currency: string;
  anonymous: boolean;
  message?: string;
  status: DonationStatus;
  transactionId: string;
  createdAt: string;
}

// ---- Transaction ----
export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Transaction {
  _id: string;
  paymentIntentId: string;
  donationId?: string;
  campaignId: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  stripeFee?: number;
  netAmount?: number;
  createdAt: string;
}

// ---- Withdrawal ----
export type WithdrawalStatus =
  | 'requested'
  | 'risk_check'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed'
  | 'cancelled';

export interface Withdrawal {
  _id: string;
  fundraiserId: string;
  fundraiserName: string;
  campaignId?: string;
  campaignTitle?: string;
  amount: number;
  fees: number;
  netAmount: number;
  status: WithdrawalStatus;
  payoutAccountId: string;
  rejectionReason?: string;
  paymentReference?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  completedAt?: string;
  createdAt: string;
}

// ---- Campaign Update ----
export interface CampaignUpdate {
  _id: string;
  campaignId: string;
  title: string;
  content: string;
  images?: string[];
  authorName: string;
  authorImage?: string;
  createdAt: string;
}

// ---- Comment ----
export interface Comment {
  _id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likesCount: number;
  createdAt: string;
}

// ---- Notification ----
export type NotificationType =
  | 'donation_received'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'campaign_update'
  | 'milestone_reached'
  | 'goal_reached'
  | 'campaign_ending_soon'
  | 'withdrawal_status'
  | 'verification_status'
  | 'comment_added'
  | 'report_resolved';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ---- Category ----
export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  campaignCount: number;
  color?: string;
}

// ---- Report ----
export type ReportReason =
  | 'fraud'
  | 'false_information'
  | 'impersonation'
  | 'misuse_of_funds'
  | 'stolen_content'
  | 'illegal_activity'
  | 'harassment'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface Report {
  _id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'campaign' | 'comment' | 'user';
  targetId: string;
  targetTitle?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolution?: string;
  createdAt: string;
}

// ---- Verification Request ----
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'needs_info';

export interface VerificationRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: string;
  fullName: string;
  idDocumentType: string;
  idDocumentNumber?: string;
  phone: string;
  address?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// ---- Audit Log ----
export interface AuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Campaign Filters ----
export interface CampaignFilters {
  search?: string;
  category?: string;
  location?: string;
  status?: string;
  minGoal?: number;
  maxGoal?: number;
  sort?: 'trending' | 'newest' | 'ending_soon' | 'most_funded';
  page?: number;
  limit?: number;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalRaised: number;
  totalDonations: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSupporters: number;
  averageDonation: number;
  conversionRate: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  totalRaised: number;
  pendingReviews: number;
  pendingVerifications: number;
  pendingWithdrawals: number;
  totalReports: number;
  riskAlerts: number;
}
