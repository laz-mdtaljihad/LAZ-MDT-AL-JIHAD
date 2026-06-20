/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  IncomingFund,
  OutgoingFund,
  Beneficiary,
  Program,
  AuditLog,
  Complaint,
  UserProfile,
  FundType,
  BeneficiaryCategory,
  ApprovalStatus
} from '../types';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  incomingFunds: IncomingFund[];
  outgoingFunds: OutgoingFund[];
  beneficiaries: Beneficiary[];
  programs: Program[];
  auditLogs: AuditLog[];
  complaints: Complaint[];
  
  // Cloud Sync State
  syncStatus: 'connecting' | 'success' | 'error';
  syncErrorMessage: string | null;
  
  // Finance Actions (Treasurer)
  addIncomingFund: (fund: Omit<IncomingFund, 'id' | 'receiptNumber'>) => void;
  updateIncomingFund: (id: string, fund: Partial<IncomingFund>, reason: string) => void;
  deleteIncomingFund: (id: string, reason: string) => void;
  
  addOutgoingFund: (fund: Omit<OutgoingFund, 'id' | 'status'>) => void;
  updateOutgoingFund: (id: string, fund: Partial<OutgoingFund>, reason: string) => void;
  deleteOutgoingFund: (id: string, reason: string) => void;
  
  // Beneficiary Actions (Secretary)
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id' | 'registeredAt'>) => void;
  updateBeneficiary: (id: string, beneficiary: Partial<Beneficiary>) => void;
  deleteBeneficiary: (id: string) => void;

  // Program Actions
  addProgram: (program: Omit<Program, 'id' | 'raisedBudget' | 'allocatedBudget'>) => void;
  updateProgram: (id: string, program: Partial<Program>) => void;
  
  // Approval Actions (Chairman / Ketua)
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  
  // Public Quick Actions
  submitQuickDonation: (donorName: string, amount: number, type: FundType, phone: string, method: string) => IncomingFund;
  submitComplaint: (reporterName: string, phone: string, title: string, content: string, isAnonymous: boolean) => void;
  respondToComplaint: (id: string, response: string) => void;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/// --- PRESEEDED INITIAL DATA ---

const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 'PRG01',
    title: 'Operasional MDT Al Jihad',
    description: 'Bantuan biaya operasional mengajar, pengadaan bimbingan Al-Quran, kitab santri, serta listrik madrasah.',
    targetBudget: 25000000,
    raisedBudget: 0,
    allocatedBudget: 0,
    status: 'In Progress',
    imageUrl: '/src/assets/images/operasional_madrasah_1781932380388.jpg'
  },
  {
    id: 'PRG02',
    title: 'Renovasi Prasarana Kelas',
    description: 'Pengadaan meja belajar lesehan (meja rihal), perbaikan papan tulis, kipas angin, dan karpet masjid Al Jihad Garut.',
    targetBudget: 15000000,
    raisedBudget: 0,
    allocatedBudget: 0,
    status: 'In Progress',
    imageUrl: '/src/assets/images/renovasi_prasarana_1781932396139.jpg'
  },
  {
    id: 'PRG03',
    title: 'Santunan Yatim & Piatu Bagendit',
    description: 'Penyaluran dana santunan tunai berkala dan paket perlengkapan sekolah santri yatim dhuafa di lingkungan Desa Bagendit.',
    targetBudget: 20000000,
    raisedBudget: 0,
    allocatedBudget: 0,
    status: 'In Progress',
    imageUrl: '/src/assets/images/santunan_yatim_1781932413167.jpg'
  },
  {
    id: 'PRG04',
    title: 'Pemberdayaan Ekonomi Dhuafa',
    description: 'Program modal usaha mikro untuk jamaah dhuafa dan pembuat kerajinan anyaman bambu di Banyuresmi Garut.',
    targetBudget: 10000000,
    raisedBudget: 0,
    allocatedBudget: 0,
    status: 'Planned',
    imageUrl: '/src/assets/images/pemberdayaan_ekonomi_1781932430862.jpg'
  }
];

const DEFAULT_INCOMING_FUNDS: IncomingFund[] = [];
const DEFAULT_OUTGOING_FUNDS: OutgoingFund[] = [];
const DEFAULT_BENEFICIARIES: Beneficiary[] = [];
const DEFAULT_AUDIT_LOGS: AuditLog[] = [];
const DEFAULT_COMPLAINTS: Complaint[] = [];

// --- APP PROVIDER COMPONENT ---

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global Role state - defaults to public 'umum' view, allowing seamless Admin toggling
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('laz_current_role_v2');
    return (saved as UserRole) || 'umum';
  });

  // Cloud Sync status
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'success' | 'error'>('connecting');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  const [incomingFunds, setIncomingFunds] = useState<IncomingFund[]>(() => {
    const saved = localStorage.getItem('laz_incoming_funds_v2');
    return saved ? JSON.parse(saved) : DEFAULT_INCOMING_FUNDS;
  });

  const [outgoingFunds, setOutgoingFunds] = useState<OutgoingFund[]>(() => {
    const saved = localStorage.getItem('laz_outgoing_funds_v2');
    return saved ? JSON.parse(saved) : DEFAULT_OUTGOING_FUNDS;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('laz_beneficiaries_v2');
    return saved ? JSON.parse(saved) : DEFAULT_BENEFICIARIES;
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('laz_programs_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Program[];
        return parsed.map(p => {
          const matchingDefault = DEFAULT_PROGRAMS.find(dp => dp.id === p.id);
          if (matchingDefault && (p.imageUrl.includes('unsplash.com') || p.imageUrl !== matchingDefault.imageUrl)) {
            return { ...p, imageUrl: matchingDefault.imageUrl };
          }
          return p;
        });
      } catch (err) {
        return DEFAULT_PROGRAMS;
      }
    }
    return DEFAULT_PROGRAMS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('laz_audit_logs_v2');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('laz_complaints_v2');
    return saved ? JSON.parse(saved) : DEFAULT_COMPLAINTS;
  });

  // Set default syncStatus to success (as we operate locally as requested)
  useEffect(() => {
    setSyncStatus('success');
    setSyncErrorMessage(null);
  }, []);

  // Save changes to localStorage for persistent simulations
  useEffect(() => {
    localStorage.setItem('laz_current_role_v2', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('laz_incoming_funds_v2', JSON.stringify(incomingFunds));
  }, [incomingFunds]);

  useEffect(() => {
    localStorage.setItem('laz_outgoing_funds_v2', JSON.stringify(outgoingFunds));
  }, [outgoingFunds]);

  useEffect(() => {
    localStorage.setItem('laz_beneficiaries_v2', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('laz_programs_v2', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('laz_audit_logs_v2', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('laz_complaints_v2', JSON.stringify(complaints));
  }, [complaints]);

  // Derived Active User profile mapping
  const getProfileForRole = (role: UserRole): UserProfile => {
    switch (role) {
      case 'pantauan':
        return { id: 'U-YAYASAN', name: 'Holid Assad, S.Pd.', role: 'pantauan', email: 'yayasan@aljihad.org' };
      case 'ketua':
        return { id: 'U-KETUA', name: 'Reni Nurhayani, M.Pd.', role: 'ketua', email: 'reni.nurhayani@aljihad.org' };
      case 'bendahara':
        return { id: 'U-BENDAHARA', name: 'Rahmi Rahmawati', role: 'bendahara', email: 'rahmi.rahmawati@aljihad.org' };
      case 'sekretaris':
        return { id: 'U-SEKRETARIS', name: 'Hamdan Al-Bantari', role: 'sekretaris', email: 'hamdan@aljihad.org' };
      default:
        return { id: 'U-PUBLIC', name: 'Masyarakat Umum / Donatur', role: 'umum', email: 'umum@gmail.com' };
    }
  };

  const currentUser = getProfileForRole(currentRole);

  // Helper inside helper to easily write log
  const writeLog = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const id = `AUD${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: AuditLog = {
      id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      operatorName: currentUser.name,
      operatorRole: currentRole,
      action,
      entityType,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- ACTIONS: BENDHAHARA (FINANCE) ---

  const addIncomingFund = (fund: Omit<IncomingFund, 'id' | 'receiptNumber'>) => {
    const id = `INC${Math.floor(100 + Math.random() * 900)}`;
    const rn = `KJS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFund: IncomingFund = {
      ...fund,
      id,
      receiptNumber: rn
    };
    
    setIncomingFunds(prev => [newFund, ...prev]);
    writeLog(
      'CREATE',
      'INCOMING_FUND',
      id,
      `Mencatat Dana Masuk baru dari ${fund.donorName} sebesar Rp ${fund.amount.toLocaleString('id-ID')} kategori ${fund.type}.`
    );

    // Update Program raised budget if matching
    const matchingProgram = programs.find(p => fund.description.toLowerCase().includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(fund.description.toLowerCase()));
    if (matchingProgram) {
      setPrograms(prev => prev.map(p => p.id === matchingProgram.id ? { ...p, raisedBudget: p.raisedBudget + fund.amount } : p));
    }
  };

  const updateIncomingFund = (id: string, updatedFields: Partial<IncomingFund>, reason: string) => {
    const original = incomingFunds.find(f => f.id === id);
    if (!original) return;

    setIncomingFunds(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    
    let changeDetails = `Mengubah Dana Masuk ID #${id}. Alasan: "${reason}". `;
    if (updatedFields.amount && updatedFields.amount !== original.amount) {
      changeDetails += `Nominal berubah dari Rp ${original.amount.toLocaleString('id-ID')} menjadi Rp ${updatedFields.amount.toLocaleString('id-ID')}. `;
      
      // Sync matching program if applies
      const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
      if (matchingProgram) {
        const diff = (updatedFields.amount || 0) - original.amount;
        setPrograms(prev => prev.map(p => p.id === matchingProgram.id ? { ...p, raisedBudget: Math.max(0, p.raisedBudget + diff) } : p));
      }
    }
    if (updatedFields.donorName && updatedFields.donorName !== original.donorName) {
      changeDetails += `Nama Donatur dari "${original.donorName}" ke "${updatedFields.donorName}". `;
    }
    if (updatedFields.type && updatedFields.type !== original.type) {
      changeDetails += `Kategori dana diubah ke [${updatedFields.type}]. `;
    }

    writeLog('UPDATE', 'INCOMING_FUND', id, changeDetails);
  };

  const deleteIncomingFund = (id: string, reason: string) => {
    const original = incomingFunds.find(f => f.id === id);
    if (!original) return;

    setIncomingFunds(prev => prev.filter(f => f.id !== id));
    writeLog(
      'DELETE',
      'INCOMING_FUND',
      id,
      `MENGHAPUS Catatan Dana Masuk dari ${original.donorName} sebesar Rp ${original.amount.toLocaleString('id-ID')} (ID #${id}). Alasan penarikan: "${reason}".`
    );

    // Revert program raises
    const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
    if (matchingProgram) {
      setPrograms(prev => prev.map(p => p.id === matchingProgram.id ? { ...p, raisedBudget: Math.max(0, p.raisedBudget - original.amount) } : p));
    }
  };

  const addOutgoingFund = (fund: Omit<OutgoingFund, 'id' | 'status'>) => {
    const id = `OUT${Math.floor(100 + Math.random() * 900)}`;
    const newFund: OutgoingFund = {
      ...fund,
      id,
      status: 'Pending' // Bendahara inputs, Ketua LAZ must approve/verify
    };

    setOutgoingFunds(prev => [newFund, ...prev]);
    writeLog(
      'CREATE',
      'OUTGOING_FUND',
      id,
      `Mengajukan Penyaluran baru ke "${fund.receiverName}" senilai Rp ${fund.amount.toLocaleString('id-ID')} untuk program "${fund.programName}". Menunggu persetujuan Ketua LAZ.`
    );
  };

  const updateOutgoingFund = (id: string, updatedFields: Partial<OutgoingFund>, reason: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    setOutgoingFunds(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));

    let changeDetails = `Mengubah Rencana Penyaluran ID #${id}. Alasan: "${reason}". `;
    if (updatedFields.amount && updatedFields.amount !== original.amount) {
      changeDetails += `Nominal penarikan disesuaikan dari Rp ${original.amount.toLocaleString('id-ID')} menjadi Rp ${updatedFields.amount.toLocaleString('id-ID')}. `;
    }
    if (updatedFields.receiverName && updatedFields.receiverName !== original.receiverName) {
      changeDetails += `Penerima diubah dari "${original.receiverName}" ke "${updatedFields.receiverName}". `;
    }

    writeLog('UPDATE', 'OUTGOING_FUND', id, changeDetails);
  };

  const deleteOutgoingFund = (id: string, reason: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    setOutgoingFunds(prev => prev.filter(f => f.id !== id));
    writeLog(
      'DELETE',
      'OUTGOING_FUND',
      id,
      `MENGHAPUS pengajuan Penyaluran Dana ke "${original.receiverName}" senilai Rp ${original.amount.toLocaleString('id-ID')} (ID #${id}). Alasan pembatalan: "${reason}".`
    );
  };

  // --- ACTIONS: SEKRETARIS (BENEFICIARIES & PROGRAMS) ---

  const addBeneficiary = (beneficiary: Omit<Beneficiary, 'id' | 'registeredAt'>) => {
    const id = `BEN${Math.floor(100 + Math.random() * 900)}`;
    const newBeneficiary: Beneficiary = {
      ...beneficiary,
      id,
      registeredAt: new Date().toISOString().substring(0, 10)
    };

    setBeneficiaries(prev => [newBeneficiary, ...prev]);
    writeLog(
      'CREATE',
      'BENEFICIARY',
      id,
      `Mendaftarkan penerima manfaat baru: "${beneficiary.name}" di "${beneficiary.address}" kategori [${beneficiary.category}].`
    );
  };

  const updateBeneficiary = (id: string, updatedFields: Partial<Beneficiary>) => {
    const original = beneficiaries.find(b => b.id === id);
    if (!original) return;

    setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    writeLog(
      'UPDATE',
      'BENEFICIARY',
      id,
      `Mengubah rincian data penerima manfaat "${original.name}" (ID #${id}).`
    );
  };

  const deleteBeneficiary = (id: string) => {
    const original = beneficiaries.find(b => b.id === id);
    if (!original) return;

    setBeneficiaries(prev => prev.filter(b => b.id !== id));
    writeLog(
      'DELETE',
      'BENEFICIARY',
      id,
      `MENGHAPUS penerima manfaat "${original.name}" (ID #${id}) dari basis data registrasi.`
    );
  };

  const addProgram = (program: Omit<Program, 'id' | 'raisedBudget' | 'allocatedBudget'>) => {
    const id = `PRG${Math.floor(100 + Math.random() * 900)}`;
    const newProg: Program = {
      ...program,
      id,
      raisedBudget: 0,
      allocatedBudget: 0
    };
    setPrograms(prev => [...prev, newProg]);
    writeLog('CREATE', 'PROGRAM', id, `Menambahkan rencana program kemaslahatan baru: "${program.title}".`);
  };

  const updateProgram = (id: string, updatedFields: Partial<Program>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  // --- ACTIONS: KETUA LAZ (APPROVALS) ---

  const approveTransaction = (id: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    setOutgoingFunds(prev => prev.map(f => f.id === id ? { 
      ...f, 
      status: 'Approved' as ApprovalStatus, 
      approvedBy: currentUser.name, 
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : f));

    // Increase programmatic allocated (realized) budget
    if (original.programId) {
      setPrograms(prev => prev.map(p => p.id === original.programId ? { ...p, allocatedBudget: p.allocatedBudget + original.amount } : p));
    }

    writeLog(
      'APPROVE',
      'OUTGOING_FUND',
      id,
      `${currentUser.name} (Ketua LAZ) MENYETUJUI penyaluran tunai Rp ${original.amount.toLocaleString('id-ID')} ke "${original.receiverName}" untuk program "${original.programName}".`
    );
  };

  const rejectTransaction = (id: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    setOutgoingFunds(prev => prev.map(f => f.id === id ? { 
      ...f, 
      status: 'Rejected' as ApprovalStatus,
      approvedBy: currentUser.name,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : f));

    writeLog(
      'REJECT',
      'OUTGOING_FUND',
      id,
      `${currentUser.name} (Ketua LAZ) MENOLAK usulan penyaluran Rp ${original.amount.toLocaleString('id-ID')} ke "${original.receiverName}". Transparansi kas ditahan.`
    );
  };

  // --- PUBLIC QUICK ACTIONS ---

  const submitQuickDonation = (
    donorName: string,
    amount: number,
    type: FundType,
    phone: string,
    method: string
  ): IncomingFund => {
    const id = `INC${Math.floor(100 + Math.random() * 900)}`;
    const rn = `KJS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFund: IncomingFund = {
      id,
      donorName: donorName.trim() || 'Hamba Allah',
      donorPhone: phone,
      amount,
      type,
      date: new Date().toISOString().substring(0, 10),
      description: `Donasi cepat online via ${method}`,
      receiptNumber: rn,
      paymentMethod: method
    };

    setIncomingFunds(prev => [newFund, ...prev]);
    
    // Write log as public event
    const logId = `AUD${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      operatorName: donorName || 'Hamba Allah',
      operatorRole: 'umum',
      action: 'CREATE',
      entityType: 'INCOMING_FUND',
      entityId: id,
      details: `Menerima donasi publik online [${type}] dari ${donorName || 'Hamba Allah'} sebesar Rp ${amount.toLocaleString('id-ID')} via ${method}.`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update program Raised budget (distribute to general operasional or renovasi)
    const progToRaise = type === 'Wakaf' ? 'PRG02' /* renovasi */ : 'PRG01' /* operasional */;
    setPrograms(prev => prev.map(p => p.id === progToRaise ? { ...p, raisedBudget: p.raisedBudget + amount } : p));

    return newFund;
  };

  const submitComplaint = (
    reporterName: string,
    phone: string,
    title: string,
    content: string,
    isAnonymous: boolean
  ) => {
    const id = `CMP${Math.floor(100 + Math.random() * 900)}`;
    const newComplaint: Complaint = {
      id,
      reporterName: isAnonymous ? 'Hamba Allah' : reporterName,
      reporterPhone: phone,
      title,
      content,
      date: new Date().toISOString().substring(0, 10),
      status: 'Received',
      isAnonymous
    };

    setComplaints(prev => [newComplaint, ...prev]);
  };

  const respondToComplaint = (id: string, response: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'Resolved',
      response,
      responseDate: new Date().toISOString().substring(0, 10)
    } : c));
  };

  const resetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin memulihkan data bawaan awal LAZ? Semua simulasi data Anda saat ini akan dihapus.')) {
      setPrograms(DEFAULT_PROGRAMS);
      setIncomingFunds(DEFAULT_INCOMING_FUNDS);
      setOutgoingFunds(DEFAULT_OUTGOING_FUNDS);
      setBeneficiaries(DEFAULT_BENEFICIARIES);
      setAuditLogs(DEFAULT_AUDIT_LOGS);
      setComplaints(DEFAULT_COMPLAINTS);
      setCurrentRole('umum');
    }
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUser,
      incomingFunds,
      outgoingFunds,
      beneficiaries,
      programs,
      auditLogs,
      complaints,
      syncStatus,
      syncErrorMessage,
      addIncomingFund,
      updateIncomingFund,
      deleteIncomingFund,
      addOutgoingFund,
      updateOutgoingFund,
      deleteOutgoingFund,
      addBeneficiary,
      updateBeneficiary,
      deleteBeneficiary,
      addProgram,
      updateProgram,
      approveTransaction,
      rejectTransaction,
      submitQuickDonation,
      submitComplaint,
      respondToComplaint,
      resetToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
