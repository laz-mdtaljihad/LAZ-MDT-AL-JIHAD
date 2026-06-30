/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'umum' | 'pantauan' | 'ketua' | 'bendahara' | 'sekretaris';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export type FundType = 'Zakat Fitrah' | 'Zakat Maal' | 'Infak' | 'Sedekah' | 'Wakaf';

export interface IncomingFund {
  id: string;
  donorName: string;
  donorPhone?: string;
  amount: number;
  type: FundType;
  date: string;
  description: string;
  receiptNumber: string;
  paymentMethod: string;
}

export type BeneficiaryCategory = 'Fakir' | 'Miskin' | 'Amil' | 'Mualaf' | 'Gharimin' | 'Fisabilillah' | 'Ibnu Sabil' | 'Anak Yatim / Dhuafa' | 'Lainnya';

export interface Beneficiary {
  id: string;
  name: string;
  address: string;
  category: BeneficiaryCategory;
  phone?: string;
  assistanceReceived: string; // Deskripsi bantuan yang diterima
  registeredAt: string;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface OutgoingFund {
  id: string;
  programId: string;
  programName: string;
  amount: number;
  receiverName: string; // Penerima manfaat (bisa individu atau kelompok)
  category: BeneficiaryCategory;
  date: string;
  description: string;
  status: ApprovalStatus;
  approvedBy?: string; // Nama Ketua LAZ yang menyetujui
  approvedAt?: string;
  evidencePhoto?: string; // URL foto serah terima (mocked base64)
}

export interface Program {
  id: string;
  title: string;
  description: string;
  targetBudget: number;
  raisedBudget: number;
  allocatedBudget: number;
  status: 'In Progress' | 'Completed' | 'Planned';
  imageUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  entityType: 'INCOMING_FUND' | 'OUTGOING_FUND' | 'BENEFICIARY' | 'PROGRAM';
  entityId: string;
  details: string; // Perubahan field-field detail
}

export interface Complaint {
  id: string;
  reporterName: string;
  reporterPhone?: string;
  title: string;
  content: string;
  date: string;
  status: 'Received' | 'In Progress' | 'Resolved';
  response?: string; // Tanggapan dari petugas
  responseDate?: string;
  isAnonymous: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ProjectProgress {
  id: string;
  date: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string; // Base64 image/video data or standard URL
  progressPercentage: number; // e.g. 10, 45, 100
  uploadedBy: string;
}

