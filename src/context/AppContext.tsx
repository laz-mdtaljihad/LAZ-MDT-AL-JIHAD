/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
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

  // --- Real-time synchronization is established with Firebase Firestore ---
  useEffect(() => {
    const checkSuccess = () => {
      setSyncStatus('success');
      setSyncErrorMessage(null);
    };

    const handleError = (error: any) => {
      console.error('Firestore listen error:', error);
      setSyncStatus('error');
      let msg = error?.message || String(error);
      if (msg.includes('permission') || msg.includes('Permission')) {
        msg = 'Aturan Keamanan (Security Rules) memblokir koneksi. Pastikan tab "Rules" proyek Firebase Anda ("laz-mdt-aljihad") disetel ke: allow read, write: if true;';
      } else if (msg.includes('unavailable') || msg.includes('Failed to get document')) {
        msg = 'Koneksi ke Firestore cloud gagal atau offline. Pastikan Firestore Database telah dibuat di proyek Firebase "laz-mdt-aljihad".';
      }
      setSyncErrorMessage(msg);
    };

    const unsubscribes = [
      onSnapshot(collection(db, 'incoming_funds'), (snapshot) => {
        const list: IncomingFund[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as IncomingFund);
        });
        // Sort newest first
        list.sort((a, b) => b.id.localeCompare(a.id));
        setIncomingFunds(list);
        localStorage.setItem('laz_incoming_funds_v2', JSON.stringify(list));
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'outgoing_funds'), (snapshot) => {
        const list: OutgoingFund[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as OutgoingFund);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        setOutgoingFunds(list);
        localStorage.setItem('laz_outgoing_funds_v2', JSON.stringify(list));
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'beneficiaries'), (snapshot) => {
        const list: Beneficiary[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Beneficiary);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        setBeneficiaries(list);
        localStorage.setItem('laz_beneficiaries_v2', JSON.stringify(list));
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'programs'), (snapshot) => {
        const list: Program[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Program);
        });
        if (snapshot.empty) {
          // Initialize empty collection with default programs
          DEFAULT_PROGRAMS.forEach((p) => {
            setDoc(doc(db, 'programs', p.id), p).catch(err => console.error('Error seeding program:', err));
          });
          setPrograms(DEFAULT_PROGRAMS);
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          setPrograms(list);
          localStorage.setItem('laz_programs_v2', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as AuditLog);
        });
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setAuditLogs(list);
        localStorage.setItem('laz_audit_logs_v2', JSON.stringify(list));
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'complaints'), (snapshot) => {
        const list: Complaint[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Complaint);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        setComplaints(list);
        localStorage.setItem('laz_complaints_v2', JSON.stringify(list));
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Save changes to localStorage for persistent simulations
  useEffect(() => {
    localStorage.setItem('laz_current_role_v2', currentRole);
  }, [currentRole]);

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
  const writeLog = async (
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
    await setDoc(doc(db, 'audit_logs', id), newLog);
  };

  // --- ACTIONS: BENDHAHARA (FINANCE) ---

  const addIncomingFund = async (fund: Omit<IncomingFund, 'id' | 'receiptNumber'>) => {
    const id = `INC${Math.floor(100 + Math.random() * 900)}`;
    const rn = `KJS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFund: IncomingFund = {
      ...fund,
      id,
      receiptNumber: rn
    };
    
    await setDoc(doc(db, 'incoming_funds', id), newFund);
    await writeLog(
      'CREATE',
      'INCOMING_FUND',
      id,
      `Mencatat Dana Masuk baru dari ${fund.donorName} sebesar Rp ${fund.amount.toLocaleString('id-ID')} kategori ${fund.type}.`
    );

    // Update Program raised budget if matching
    const matchingProgram = programs.find(p => fund.description.toLowerCase().includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(fund.description.toLowerCase()));
    if (matchingProgram) {
      await setDoc(doc(db, 'programs', matchingProgram.id), {
        ...matchingProgram,
        raisedBudget: matchingProgram.raisedBudget + fund.amount
      });
    }
  };

  const updateIncomingFund = async (id: string, updatedFields: Partial<IncomingFund>, reason: string) => {
    const original = incomingFunds.find(f => f.id === id);
    if (!original) return;

    const merged = { ...original, ...updatedFields };
    await setDoc(doc(db, 'incoming_funds', id), merged);
    
    let changeDetails = `Mengubah Dana Masuk ID #${id}. Alasan: "${reason}". `;
    if (updatedFields.amount && updatedFields.amount !== original.amount) {
      changeDetails += `Nominal berubah dari Rp ${original.amount.toLocaleString('id-ID')} menjadi Rp ${updatedFields.amount.toLocaleString('id-ID')}. `;
      
      // Sync matching program if applies
      const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
      if (matchingProgram) {
        const diff = updatedFields.amount - original.amount;
        await setDoc(doc(db, 'programs', matchingProgram.id), {
          ...matchingProgram,
          raisedBudget: matchingProgram.raisedBudget + diff
        });
      }
    }
    if (updatedFields.donorName && updatedFields.donorName !== original.donorName) {
      changeDetails += `Nama Donatur dari "${original.donorName}" ke "${updatedFields.donorName}". `;
    }
    if (updatedFields.type && updatedFields.type !== original.type) {
      changeDetails += `Kategori dana diubah ke [${updatedFields.type}]. `;
    }

    await writeLog('UPDATE', 'INCOMING_FUND', id, changeDetails);
  };

  const deleteIncomingFund = async (id: string, reason: string) => {
    const original = incomingFunds.find(f => f.id === id);
    if (!original) return;

    await deleteDoc(doc(db, 'incoming_funds', id));
    await writeLog(
      'DELETE',
      'INCOMING_FUND',
      id,
      `MENGHAPUS Catatan Dana Masuk dari ${original.donorName} sebesar Rp ${original.amount.toLocaleString('id-ID')} (ID #${id}). Alasan penarikan: "${reason}".`
    );

    // Revert program raises
    const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
    if (matchingProgram) {
      await setDoc(doc(db, 'programs', matchingProgram.id), {
        ...matchingProgram,
        raisedBudget: Math.max(0, matchingProgram.raisedBudget - original.amount)
      });
    }
  };

  const addOutgoingFund = async (fund: Omit<OutgoingFund, 'id' | 'status'>) => {
    const id = `OUT${Math.floor(100 + Math.random() * 900)}`;
    const newFund: OutgoingFund = {
      ...fund,
      id,
      status: 'Pending' // Bendahara inputs, Ketua LAZ must approve/verify
    };

    await setDoc(doc(db, 'outgoing_funds', id), newFund);
    await writeLog(
      'CREATE',
      'OUTGOING_FUND',
      id,
      `Mengajukan Penyaluran baru ke "${fund.receiverName}" senilai Rp ${fund.amount.toLocaleString('id-ID')} untuk program "${fund.programName}". Menunggu persetujuan Ketua LAZ.`
    );
  };

  const updateOutgoingFund = async (id: string, updatedFields: Partial<OutgoingFund>, reason: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    const merged = { ...original, ...updatedFields };
    await setDoc(doc(db, 'outgoing_funds', id), merged);

    let changeDetails = `Mengubah Rencana Penyaluran ID #${id}. Alasan: "${reason}". `;
    if (updatedFields.amount && updatedFields.amount !== original.amount) {
      changeDetails += `Nominal penarikan disesuaikan dari Rp ${original.amount.toLocaleString('id-ID')} menjadi Rp ${updatedFields.amount.toLocaleString('id-ID')}. `;
    }
    if (updatedFields.receiverName && updatedFields.receiverName !== original.receiverName) {
      changeDetails += `Penerima diubah dari "${original.receiverName}" ke "${updatedFields.receiverName}". `;
    }

    await writeLog('UPDATE', 'OUTGOING_FUND', id, changeDetails);
  };

  const deleteOutgoingFund = async (id: string, reason: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    await deleteDoc(doc(db, 'outgoing_funds', id));
    await writeLog(
      'DELETE',
      'OUTGOING_FUND',
      id,
      `MENGHAPUS pengajuan Penyaluran Dana ke "${original.receiverName}" senilai Rp ${original.amount.toLocaleString('id-ID')} (ID #${id}). Alasan pembatalan: "${reason}".`
    );
  };

  // --- ACTIONS: SEKRETARIS (BENEFICIARIES & PROGRAMS) ---

  const addBeneficiary = async (beneficiary: Omit<Beneficiary, 'id' | 'registeredAt'>) => {
    const id = `BEN${Math.floor(100 + Math.random() * 900)}`;
    const newBeneficiary: Beneficiary = {
      ...beneficiary,
      id,
      registeredAt: new Date().toISOString().substring(0, 10)
    };

    await setDoc(doc(db, 'beneficiaries', id), newBeneficiary);
    await writeLog(
      'CREATE',
      'BENEFICIARY',
      id,
      `Mendaftarkan penerima manfaat baru: "${beneficiary.name}" di "${beneficiary.address}" kategori [${beneficiary.category}].`
    );
  };

  const updateBeneficiary = async (id: string, updatedFields: Partial<Beneficiary>) => {
    const original = beneficiaries.find(b => b.id === id);
    if (!original) return;

    const merged = { ...original, ...updatedFields };
    await setDoc(doc(db, 'beneficiaries', id), merged);
    await writeLog(
      'UPDATE',
      'BENEFICIARY',
      id,
      `Mengubah rincian data penerima manfaat "${original.name}" (ID #${id}).`
    );
  };

  const deleteBeneficiary = async (id: string) => {
    const original = beneficiaries.find(b => b.id === id);
    if (!original) return;

    await deleteDoc(doc(db, 'beneficiaries', id));
    await writeLog(
      'DELETE',
      'BENEFICIARY',
      id,
      `MENGHAPUS penerima manfaat "${original.name}" (ID #${id}) dari basis data registrasi.`
    );
  };

  const addProgram = async (program: Omit<Program, 'id' | 'raisedBudget' | 'allocatedBudget'>) => {
    const id = `PRG${Math.floor(100 + Math.random() * 900)}`;
    const newProg: Program = {
      ...program,
      id,
      raisedBudget: 0,
      allocatedBudget: 0
    };
    await setDoc(doc(db, 'programs', id), newProg);
    await writeLog('CREATE', 'PROGRAM', id, `Menambahkan rencana program kemaslahatan baru: "${program.title}".`);
  };

  const updateProgram = async (id: string, updatedFields: Partial<Program>) => {
    const original = programs.find(p => p.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    await setDoc(doc(db, 'programs', id), merged);
  };

  // --- ACTIONS: KETUA LAZ (APPROVALS) ---

  const approveTransaction = async (id: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    const updated = { 
      ...original, 
      status: 'Approved' as ApprovalStatus, 
      approvedBy: currentUser.name, 
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    await setDoc(doc(db, 'outgoing_funds', id), updated);

    // Increase programmatic allocated (realized) budget
    if (original.programId) {
      const matchingProgram = programs.find(p => p.id === original.programId);
      if (matchingProgram) {
        await setDoc(doc(db, 'programs', original.programId), {
          ...matchingProgram,
          allocatedBudget: matchingProgram.allocatedBudget + original.amount
        });
      }
    }

    await writeLog(
      'APPROVE',
      'OUTGOING_FUND',
      id,
      `${currentUser.name} (Ketua LAZ) MENYETUJUI penyaluran tunai Rp ${original.amount.toLocaleString('id-ID')} ke "${original.receiverName}" untuk program "${original.programName}".`
    );
  };

  const rejectTransaction = async (id: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    const updated = { 
      ...original, 
      status: 'Rejected' as ApprovalStatus,
      approvedBy: currentUser.name,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    await setDoc(doc(db, 'outgoing_funds', id), updated);

    await writeLog(
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

    setDoc(doc(db, 'incoming_funds', id), newFund).catch(console.error);
    
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
    setDoc(doc(db, 'audit_logs', logId), newLog).catch(console.error);

    // Update program Raised budget (distribute to general operasional or renovasi)
    const progToRaise = type === 'Wakaf' ? 'PRG02' /* renovasi */ : 'PRG01' /* operasional */;
    const matchingProgram = programs.find(p => p.id === progToRaise);
    if (matchingProgram) {
      setDoc(doc(db, 'programs', progToRaise), {
        ...matchingProgram,
        raisedBudget: matchingProgram.raisedBudget + amount
      }).catch(console.error);
    }

    return newFund;
  };

  const submitComplaint = async (
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

    await setDoc(doc(db, 'complaints', id), newComplaint);
  };

  const respondToComplaint = async (id: string, response: string) => {
    const original = complaints.find(c => c.id === id);
    if (!original) return;
    const updated = {
      ...original,
      status: 'Resolved' as const,
      response,
      responseDate: new Date().toISOString().substring(0, 10)
    };
    await setDoc(doc(db, 'complaints', id), updated);
  };

  const resetToDefault = async () => {
    if (confirm('Apakah Anda yakin ingin memulihkan data bawaan awal LAZ? Semua simulasi data Anda saat ini di database cloud akan dihapus.')) {
      // Clear Firestore collections
      for (const item of incomingFunds) {
        await deleteDoc(doc(db, 'incoming_funds', item.id)).catch(console.error);
      }
      for (const item of outgoingFunds) {
        await deleteDoc(doc(db, 'outgoing_funds', item.id)).catch(console.error);
      }
      for (const item of beneficiaries) {
        await deleteDoc(doc(db, 'beneficiaries', item.id)).catch(console.error);
      }
      for (const item of complaints) {
        await deleteDoc(doc(db, 'complaints', item.id)).catch(console.error);
      }
      for (const item of auditLogs) {
        await deleteDoc(doc(db, 'audit_logs', item.id)).catch(console.error);
      }
      // Overwrite programs with initial
      for (const p of DEFAULT_PROGRAMS) {
        await setDoc(doc(db, 'programs', p.id), p).catch(console.error);
      }
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
