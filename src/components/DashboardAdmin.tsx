/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  IncomingFund, 
  OutgoingFund, 
  Beneficiary, 
  FundType, 
  BeneficiaryCategory, 
  UserRole,
  Program
} from '../types';
import { 
  Users, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BookOpen, 
  ShieldAlert, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit, 
  UserCheck, 
  Check, 
  X, 
  Info, 
  Search, 
  Calendar,
  Layers,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck2,
  MapPin,
  Lock
} from 'lucide-react';

export const DashboardAdmin: React.FC<{ onExitPortal: () => void }> = ({ onExitPortal }) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    incomingFunds,
    outgoingFunds,
    beneficiaries,
    programs,
    auditLogs,
    complaints,
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
    respondToComplaint,
    resetToDefault,
    syncStatus,
    syncErrorMessage
  } = useApp();

  // Active admin tab inside view
  const [adminTab, setAdminTab] = useState<'himpun' | 'salur' | 'mustahik' | 'program' | 'aduan' | 'audit'>('himpun');

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal control states
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Modification / Deletion Audit Reason Dialog State
  const [auditReasonModal, setAuditReasonModal] = useState<{
    isOpen: boolean;
    type: 'DELETE_INC' | 'DELETE_OUT' | 'EDIT_INC' | 'EDIT_OUT';
    targetId: string;
    payload?: any;
  }>({ isOpen: false, type: 'DELETE_INC', targetId: '' });
  
  const [modificationReason, setModificationReason] = useState('');

  // Editing targets
  const [editingIncoming, setEditingIncoming] = useState<IncomingFund | null>(null);
  const [editingOutgoing, setEditingOutgoing] = useState<OutgoingFund | null>(null);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [respondingComplaintId, setRespondingComplaintId] = useState<string | null>(null);

  // Input states for form additions
  const [incName, setIncName] = useState('');
  const [incAmount, setIncAmount] = useState<number>(0);
  const [incType, setIncType] = useState<FundType>('Sedekah');
  const [incDesc, setIncDesc] = useState('');
  const [incPhone, setIncPhone] = useState('');
  const [incMethod, setIncMethod] = useState('Transfer BRI');

  const [outProgId, setOutProgId] = useState('');
  const [outAmount, setOutAmount] = useState<number>(0);
  const [outReceiver, setOutReceiver] = useState('');
  const [outCat, setOutCat] = useState<BeneficiaryCategory>('Fakir');
  const [outDesc, setOutDesc] = useState('');
  const [outPhoto, setOutPhoto] = useState('');

  const [benName, setBenName] = useState('');
  const [benAddress, setBenAddress] = useState('');
  const [benCat, setBenCat] = useState<BeneficiaryCategory>('Fakir');
  const [benPhone, setBenPhone] = useState('');
  const [benAssistance, setBenAssistance] = useState('');

  const [complaintReplyText, setComplaintReplyText] = useState('');

  // Editing program target states
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState<number>(0);

  // Date and Year tracking in Cash-In (Kas Masuk)
  const [incDate, setIncDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [incYear, setIncYear] = useState(() => new Date().getFullYear().toString());

  // Password Verification for the 3 executive roles
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [roleToVerify, setRoleToVerify] = useState<'ketua' | 'bendahara' | 'sekretaris' | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleDateUpdate = (newDateStr: string) => {
    setIncDate(newDateStr);
    if (newDateStr) {
      const yr = newDateStr.substring(0, 4);
      setIncYear(yr);
    }
  };

  const selectQuickYear = (yr: string) => {
    setIncYear(yr);
    if (incDate) {
      const rest = incDate.substring(4); // e.g. "-06-20"
      setIncDate(yr + rest);
    } else {
      setIncDate(`${yr}-01-01`);
    }
  };

  const handleRequestRoleChange = (role: 'ketua' | 'bendahara' | 'sekretaris') => {
    if (currentRole === role) return;
    setRoleToVerify(role);
    setEnteredPassword('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = enteredPassword.trim();
    if (!roleToVerify) return;

    const isCorrect = 
      p === 'aljihad2026' || 
      (roleToVerify === 'ketua' && p === 'ketua2026') || 
      (roleToVerify === 'bendahara' && p === 'bendahara2026') || 
      (roleToVerify === 'sekretaris' && p === 'sekretaris2026');

    if (isCorrect) {
      setCurrentRole(roleToVerify);
      clearFormFields();
      setIsPasswordModalOpen(false);
      setRoleToVerify(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Password salah! Silakan coba lagi atau hubungi ketua yayasan.');
    }
  };

  // Role permissions checker
  const canWriteFinance = currentRole === 'bendahara' || currentRole === 'ketua';
  const canWriteSecretariat = currentRole === 'sekretaris' || currentRole === 'ketua';
  const canApprove = currentRole === 'ketua';
  const isReadOnly = currentRole === 'pantauan';

  // --- HANDLERS ---

  // Open Edit Form for Kas Masuk
  const openEditIncoming = (f: IncomingFund) => {
    setEditingIncoming(f);
    setIncName(f.donorName);
    setIncAmount(f.amount);
    setIncType(f.type);
    setIncDesc(f.description);
    setIncPhone(f.donorPhone || '');
    setIncMethod(f.paymentMethod);
    setIncDate(f.date || new Date().toISOString().substring(0, 10));
    setIncYear((f.date || new Date().toISOString()).substring(0, 4));
    setIsIncomingModalOpen(true);
  };

  // Submit Kas Masuk (Creation or Edit pre-checks)
  const handleIncomingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incAmount <= 0) {
      alert('Masukan nominal kas yang valid.');
      return;
    }

    if (editingIncoming) {
      // It is an edit. Open modification reason modal before applying changes!
      setAuditReasonModal({
        isOpen: true,
        type: 'EDIT_INC',
        targetId: editingIncoming.id,
        payload: {
          donorName: incName,
          amount: incAmount,
          type: incType,
          description: incDesc,
          donorPhone: incPhone,
          paymentMethod: incMethod,
          date: incDate
        }
      });
    } else {
      // Normal creation
      addIncomingFund({
        donorName: incName || 'Hamba Allah',
        amount: incAmount,
        type: incType,
        description: incDesc || 'Kas masuk tercatat manual',
        donorPhone: incPhone,
        paymentMethod: incMethod,
        date: incDate
      });
      setIsIncomingModalOpen(false);
      clearFormFields();
    }
  };

  // Delete Kas Masuk verification
  const triggerDeleteIncoming = (id: string) => {
    setAuditReasonModal({
      isOpen: true,
      type: 'DELETE_INC',
      targetId: id
    });
  };

  // Open Edit Form for Kas Keluar
  const openEditOutgoing = (f: OutgoingFund) => {
    setEditingOutgoing(f);
    setOutProgId(f.programId);
    setOutAmount(f.amount);
    setOutReceiver(f.receiverName);
    setOutCat(f.category);
    setOutDesc(f.description);
    setOutPhoto(f.evidencePhoto || '');
    setIsOutgoingModalOpen(true);
  };

  // Submit Kas Keluar usulan
  const handleOutgoingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outAmount <= 0 || !outProgId) {
      alert('Tolong pilih program dan masukkan nominal valid.');
      return;
    }

    const selectedProg = programs.find(p => p.id === outProgId);
    if (editingOutgoing) {
      setAuditReasonModal({
        isOpen: true,
        type: 'EDIT_OUT',
        targetId: editingOutgoing.id,
        payload: {
          programId: outProgId,
          programName: selectedProg ? selectedProg.title : 'Operasional Umum',
          amount: outAmount,
          receiverName: outReceiver,
          category: outCat,
          description: outDesc,
          evidencePhoto: outPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
        }
      });
    } else {
      addOutgoingFund({
        programId: outProgId,
        programName: selectedProg ? selectedProg.title : 'Operasional Umum',
        amount: outAmount,
        receiverName: outReceiver || 'Pihak Berhak',
        category: outCat,
        date: new Date().toISOString().substring(0, 10),
        description: outDesc || 'Usulan penyaluran program',
        evidencePhoto: outPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
      });
      setIsOutgoingModalOpen(false);
      clearFormFields();
    }
  };

  // Delete usulan keluar verification
  const triggerDeleteOutgoing = (id: string) => {
    setAuditReasonModal({
      isOpen: true,
      type: 'DELETE_OUT',
      targetId: id
    });
  };

  // Confirm auditing action and perform corresponding state call
  const confirmAuditAction = () => {
    if (!modificationReason.trim()) {
      alert('Tolong berikan alasan perubahan/penghapusan data untuk disimpan dalam riwayat audit Yayasan.');
      return;
    }

    const { type, targetId, payload } = auditReasonModal;

    if (type === 'DELETE_INC') {
      deleteIncomingFund(targetId, modificationReason);
    } else if (type === 'DELETE_OUT') {
      deleteOutgoingFund(targetId, modificationReason);
    } else if (type === 'EDIT_INC') {
      updateIncomingFund(targetId, payload, modificationReason);
      setIsIncomingModalOpen(false);
    } else if (type === 'EDIT_OUT') {
      updateOutgoingFund(targetId, payload, modificationReason);
      setIsOutgoingModalOpen(false);
    }

    // Reset Reason state
    setModificationReason('');
    setAuditReasonModal({ isOpen: false, type: 'DELETE_INC', targetId: '' });
    clearFormFields();
  };

  // Beneficiary submit handler (No audit reason needed, directly logged internally)
  const handleBeneficiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benName.trim() || !benAddress.trim()) {
      alert('Tolong isi nama dan alamat penerima manfaat.');
      return;
    }

    if (editingBeneficiary) {
      updateBeneficiary(editingBeneficiary.id, {
        name: benName,
        address: benAddress,
        category: benCat,
        phone: benPhone,
        assistanceReceived: benAssistance
      });
    } else {
      addBeneficiary({
        name: benName,
        address: benAddress,
        category: benCat,
        phone: benPhone,
        assistanceReceived: benAssistance || 'Daftar tunggu logistik pokok'
      });
    }

    setIsBeneficiaryModalOpen(false);
    clearFormFields();
  };

  // Complaint response replying submit
  const handleComplaintReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingComplaintId || !complaintReplyText.trim()) return;

    respondToComplaint(respondingComplaintId, complaintReplyText);
    setRespondingComplaintId(null);
    setComplaintReplyText('');
  };

  const clearFormFields = () => {
    setEditingIncoming(null);
    setEditingOutgoing(null);
    setEditingBeneficiary(null);
    setIncName('');
    setIncAmount(0);
    setIncType('Sedekah');
    setIncDesc('');
    setIncPhone('');
    setIncMethod('Transfer BRI');
    setIncDate(new Date().toISOString().substring(0, 10));
    setIncYear(new Date().getFullYear().toString());
    setOutProgId('');
    setOutAmount(0);
    setOutReceiver('');
    setOutCat('Fakir');
    setOutDesc('');
    setOutPhoto('');
    setBenName('');
    setBenAddress('');
    setBenCat('Fakir');
    setBenPhone('');
    setBenAssistance('');
  };

  // --- FILTERS & SEARCH CALCULATIONS ---
  const filteredIncoming = incomingFunds.filter(f => {
    const matchesSearch = f.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || f.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOutgoing = outgoingFunds.filter(f => {
    const matchesSearch = f.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f0f4f1] text-gray-800 font-sans pb-16">
      
      {/* 4-LEVEL ROLE SANDBOX SELECTOR BAR  */}
      <section className="bg-white border-b border-gray-200 py-4 px-4 shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#87A922] font-bold uppercase block tracking-wider bg-[#87A922]/10 px-2 py-0.5 border border-[#87A922]/20 rounded">
              ROLE DEVSANDBOX:
            </span>
            <span className="text-xs text-gray-650 font-bold">Simulasikan level hak akses:</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center">
            <button
              onClick={() => { setCurrentRole('umum'); onExitPortal(); }}
              className="px-3 py-1 bg-white border border-gray-300 hover:border-[#114232] text-[10px] uppercase font-bold rounded-lg text-gray-700 transition cursor-pointer"
            >
              ← Keluar Publik
            </button>
            <div className="h-4 w-0.5 bg-gray-200 hidden md:block"></div>
            
            <button
              onClick={() => { setCurrentRole('pantauan'); clearFormFields(); }}
              className={`px-3 py-1.5 text-[10px] uppercase font-extrabold rounded-lg transition-all border cursor-pointer select-none ${
                currentRole === 'pantauan'
                  ? 'bg-[#114232] text-white border-[#114232]'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-[#114232]'
              }`}
            >
              1. Pantauan Yayasan
            </button>

            <button
              onClick={() => { handleRequestRoleChange('ketua'); }}
              className={`px-3 py-1.5 text-[10px] uppercase font-extrabold rounded-lg transition-all border cursor-pointer select-none ${
                currentRole === 'ketua'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-[#114232]'
              }`}
            >
              2. Ketua LAZ
            </button>

            <button
              onClick={() => { handleRequestRoleChange('bendahara'); }}
              className={`px-3 py-1.5 text-[10px] uppercase font-extrabold rounded-lg transition-all border cursor-pointer select-none ${
                currentRole === 'bendahara'
                  ? 'bg-[#87A922] text-white border-[#87A922]'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-[#114232]'
              }`}
            >
              3. Bendahara
            </button>

            <button
              onClick={() => { handleRequestRoleChange('sekretaris'); }}
              className={`px-3 py-1.5 text-[10px] uppercase font-extrabold rounded-lg transition-all border cursor-pointer select-none ${
                currentRole === 'sekretaris'
                  ? 'bg-[#1c3d5a] text-white border-[#1c3d5a]'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-[#114232]'
              }`}
            >
              4. Sekretaris
            </button>
          </div>
        </div>
      </section>

      {/* ADMIN TITLE BAR */}
      <header className="bg-gradient-to-r from-[#114232] to-[#0a2e22] border-b border-gray-200 py-6 px-4 md:px-8 text-white relative">
        <div className="absolute top-0 right-0 h-full w-48 bg-[#FCDC2A]/5 rounded-full filter blur-xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Portal Pengurus Amil Al Jihad
                <span className="text-[10px] font-mono px-2 py-0.5 bg-black/25 border border-white/10 text-[#FCDC2A] rounded">
                  RT02 RW08 Bagendit
                </span>
              </h1>
              <p className="text-xs text-white/80 flex items-center gap-2">
                <span>Pelaksana aktif:</span>
                <strong className="text-white">{currentUser.name}</strong>
                <span className="text-white/60">({currentUser.email})</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono text-white rounded-xl transition flex items-center gap-1 cursor-pointer font-bold"
              title="Reset data ke initial bawaan"
            >
              <RefreshCw size={12} />
              Muat Ulang Awal Data
            </button>
            <button
              onClick={onExitPortal}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-[#114232] font-black text-xs rounded-xl border border-white transition cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </header>

      {/* ACTIVE ROLE PERMISSION NOTIFICATION CARD */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        <section className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative shadow-soft ${
          currentRole === 'pantauan'
            ? 'bg-white border-[#114232]/25'
            : currentRole === 'ketua'
              ? 'bg-white border-amber-500/25'
              : currentRole === 'bendahara'
                ? 'bg-white border-[#87A922]/25'
                : 'bg-white border-blue-500/25'
        }`}>
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 border border-gray-150">
              ℹ️
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-[#114232] block">
                Hak Akses Aktif: {currentRole.toUpperCase()}
              </span>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1 font-medium">
                {currentRole === 'pantauan' && "Anda bertindak sebagai Ketua Yayasan (Holid Assad, S.Pd.). Hak Anda terbatas untuk membaca seluruh kas, mengekspor laporan, meninjau bukti audit logs. Perubahan ditutup."}
                {currentRole === 'ketua' && "Anda bertindak sebagai Ketua LAZ (Reni Nurhayani, M.Pd.). Memiliki akses penuh persetujuan (Approve/Reject) usulan keuangan, serta CRUD seluruh modul amil."}
                {currentRole === 'bendahara' && "Anda bertindak sebagai Bendahara LAZ (Rahmi Rahmawati). Bertanggung jawab menginput, mengedit, dan menghapus Dana Masuk/Usulan Keluar. Setiap perubahan wajib disertai alasan audit!"}
                {currentRole === 'sekretaris' && "Anda bertindak sebagai Sekretaris LAZ (Hamdan Al-Bantari). Bertanggung jawab mengelola register penerima manfaat (mustahik), program kemaslahatan, galeri, dan merespon pengaduan."}
              </p>
            </div>
          </div>
        </section>

        {/* ADMIN VIEW LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Tabs navigation menu */}
          <aside className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-4 space-y-1.5 h-fit shadow-soft">
            <span className="text-[10px] font-mono text-[#87A922] uppercase tracking-widest block px-3 pb-2 font-black select-none">Menu Navigasi</span>
            
            <button
              onClick={() => { setAdminTab('himpun'); setSearchTerm(''); setCategoryFilter('ALL'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'himpun'
                  ? 'bg-[#11422c] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#114232] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins size={14} />
                <span>Kas Dana Masuk</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-neutral-300">{incomingFunds.length}</span>
            </button>

            <button
              onClick={() => { setAdminTab('salur'); setSearchTerm(''); setCategoryFilter('ALL'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'salur'
                  ? 'bg-emerald-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpRight size={14} />
                <span>Penyaluran (Keluar)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-neutral-300">
                {outgoingFunds.filter(f => f.status === 'Pending').length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block mr-1.5 animate-pulse"></span>
                )}
                {outgoingFunds.length}
              </span>
            </button>

            <button
              onClick={() => { setAdminTab('mustahik'); setSearchTerm(''); setCategoryFilter('ALL'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'mustahik'
                  ? 'bg-emerald-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>Penerima Manfaat</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-neutral-300">{beneficiaries.length}</span>
            </button>

            <button
              onClick={() => { setAdminTab('program'); setSearchTerm(''); setCategoryFilter('ALL'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'program'
                  ? 'bg-emerald-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={14} />
                <span>Program Kerja</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-neutral-300">{programs.length}</span>
            </button>

            <button
              onClick={() => { setAdminTab('aduan'); setSearchTerm(''); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'aduan'
                  ? 'bg-emerald-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} />
                <span>Aduan Komunitas</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-amber-400">
                {complaints.filter(c => c.status === 'Received').length}
              </span>
            </button>

            <button
              onClick={() => { setAdminTab('audit'); setSearchTerm(''); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer select-none ${
                adminTab === 'audit'
                  ? 'bg-emerald-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList size={14} />
                <span>Audit Yayasan Log</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-emerald-300">{auditLogs.length}</span>
            </button>
          </aside>

          {/* Main workspace container */}
          <div className="lg:col-span-3 bg-neutral-900/60 border border-emerald-950/80 rounded-2xl p-6 shadow-xl relative min-h-[500px]">
            
            {/* SEARCH & FILTERS HEADER (Conditionally rendered when search applies) */}
            {adminTab !== 'audit' && adminTab !== 'aduan' && (
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-emerald-950 mb-6">
                <div className="relative w-full md:max-w-xs text-xs">
                  <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik kata kunci pencarian..."
                    className="w-full bg-neutral-950 border border-emerald-950 focus:border-emerald-700/80 p-2 pl-9 rounded-xl text-neutral-300 placeholder-neutral-600 focus:outline-none transition text-xs"
                  />
                </div>

                {adminTab !== 'program' ? (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-[10px] text-neutral-500 font-mono">Filter Sektor:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-neutral-950 border border-emerald-950 p-1.5 rounded-xl text-neutral-300 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Semua Sektor / Jenis</option>
                      {adminTab === 'himpun' ? (
                        <>
                          <option value="Sedekah">Sedekah</option>
                          <option value="Infak">Infak</option>
                          <option value="Zakat Fitrah">Zakat Fitrah</option>
                          <option value="Zakat Maal">Zakat Maal</option>
                          <option value="Wakaf">Wakaf</option>
                        </>
                      ) : (
                        <>
                          <option value="Fakir">Asnaf: Fakir</option>
                          <option value="Miskin">Asnaf: Miskin</option>
                          <option value="Amil">Asnaf: Amil</option>
                          <option value="Fisabilillah">Asnaf: Fisabilillah</option>
                          <option value="Anak Yatim / Dhuafa">Anak Yatim / Dhuafa</option>
                          <option value="Lainnya">Lainnya</option>
                        </>
                      )}
                    </select>
                  </div>
                ) : null}
              </div>
            )}

            {/* --- WORKSPACE 1: KAS DANA MASUK (himpun) --- */}
            {adminTab === 'himpun' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-neutral-100">Buku Register Kas Masuk</h3>
                    <p className="text-[11px] text-neutral-400">Arsip pencatatan zakat fitrah, maal, infak, sedekah, dan wakaf warga.</p>
                  </div>
                  {canWriteFinance && (
                    <button
                      onClick={() => { clearFormFields(); setIsIncomingModalOpen(true); }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Tambah Kas Masuk
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-emerald-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#05110c] text-neutral-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-emerald-950">ID / Kuitansi</th>
                        <th className="p-3 border-b border-emerald-950">Donatur</th>
                        <th className="p-3 border-b border-emerald-950">Jenis Dana</th>
                        <th className="p-3 border-b border-emerald-950 text-right">Nominal</th>
                        <th className="p-3 border-b border-emerald-950">Metode</th>
                        <th className="p-3 border-b border-emerald-950 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {filteredIncoming.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-neutral-500">Tidak ada data transaksi yang cocok.</td>
                        </tr>
                      ) : (
                        filteredIncoming.map((fund) => (
                          <tr key={fund.id} className="hover:bg-neutral-800/30 transition-colors">
                            <td className="p-3 font-mono">
                              <span className="font-bold text-white block">{fund.id}</span>
                              <span className="text-[10px] text-neutral-500 block">{fund.date}</span>
                            </td>
                            <td className="p-3">
                              <strong className="text-neutral-200 block">{fund.donorName}</strong>
                              <span className="text-[10px] text-neutral-400 block">{fund.donorPhone || '-'}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 rounded-md font-medium text-[10px]">
                                {fund.type}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-[#E6C280]">
                              Rp {fund.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 text-neutral-300 font-mono text-[10px]">{fund.paymentMethod}</td>
                            <td className="p-3 text-center">
                              {canWriteFinance ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditIncoming(fund)}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded transition cursor-pointer"
                                    title="Edit data ini"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => triggerDeleteIncoming(fund.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded transition cursor-pointer"
                                    title="Hapus data ini"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-neutral-500 italic">Hanya Baca</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- WORKSPACE 2: PENYALURAN (salur) --- */}
            {adminTab === 'salur' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-neutral-100">Buku Usulan & Penyaluran Dana keluar</h3>
                    <p className="text-[11px] text-neutral-400">Peta pengeluaran sosial. Setiap penipisan kas wajib divalidasi digital Ketua LAZ.</p>
                  </div>
                  {canWriteFinance && (
                    <button
                      onClick={() => { clearFormFields(); setIsOutgoingModalOpen(true); }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Ajukan Usulan Salur
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-emerald-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#05110c] text-neutral-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-emerald-950">Program / Penerima</th>
                        <th className="p-3 border-b border-emerald-950">Sasaran (Asnaf)</th>
                        <th className="p-3 border-b border-emerald-950 text-right">Nominal</th>
                        <th className="p-3 border-b border-emerald-950">Status Verifikasi</th>
                        <th className="p-3 border-b border-emerald-950 text-center">Aksi Ketetapan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {filteredOutgoing.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-neutral-500">Belum ada usulan realisasi penyaluran dana.</td>
                        </tr>
                      ) : (
                        filteredOutgoing.map((out) => (
                          <tr key={out.id} className="hover:bg-neutral-800/30 transition-colors">
                            <td className="p-3">
                              <span className="text-[10px] text-neutral-500 block mb-0.5">ID: {out.id} • {out.date}</span>
                              <strong className="text-white block">{out.programName}</strong>
                              <span className="text-[11px] text-neutral-400 block italic leading-relaxed mt-1">
                                Untuk: {out.receiverName} — {out.description}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded text-[9px] font-bold">
                                {out.category}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-amber-500">
                              Rp {out.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  out.status === 'Approved'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                                    : out.status === 'Rejected'
                                      ? 'bg-red-950 text-red-400 border border-red-500/20'
                                      : 'bg-amber-950 text-amber-400 border border-amber-500/20 animate-pulse'
                                }`}>
                                  {out.status === 'Approved' ? '✓ Disetujui' : out.status === 'Rejected' ? '✕ Ditolak' : '⚡ Pending Ketua'}
                                </span>
                                {out.approvedBy && (
                                  <span className="text-[9px] text-neutral-500 block">Oleh: {out.approvedBy}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                {/* Ketua LAZ Approvals */}
                                {canApprove && out.status === 'Pending' && (
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => approveTransaction(out.id)}
                                      className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[9px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                      title="Setujui transaksi ini"
                                    >
                                      <Check size={10} /> Setuju
                                    </button>
                                    <button
                                      onClick={() => rejectTransaction(out.id)}
                                      className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[9px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                      title="Tolak usulan ini"
                                    >
                                      <X size={10} /> Tolak
                                    </button>
                                  </div>
                                )}
                                
                                {/* Edit and Delete (By Bendahara & Chairman) */}
                                {canWriteFinance && out.status === 'Pending' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openEditOutgoing(out)}
                                      className="p-1 px-1.5 text-blue-400 hover:bg-neutral-800 border border-neutral-800 rounded transition cursor-pointer"
                                      title="Edit usulan"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => triggerDeleteOutgoing(out.id)}
                                      className="p-1 px-1.5 text-red-400 hover:bg-neutral-800 border border-neutral-800 rounded transition cursor-pointer"
                                      title="Hapus usulan"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}

                                {out.status !== 'Pending' && (
                                  <span className="text-[10px] text-neutral-500 italic">Selesai Audit</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- WORKSPACE 3: REGISTRASI MUSTAHIK / PENERIMA MANFAAT (mustahik) --- */}
            {adminTab === 'mustahik' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-neutral-100">Buku Register Mustahik (Penerima Manfaat)</h3>
                    <p className="text-[11px] text-neutral-400">Database kependudukan mustahik garut untuk kualifikasi bantuan sosial tepat sasaran.</p>
                  </div>
                  {canWriteSecretariat && (
                    <button
                      onClick={() => { clearFormFields(); setIsBeneficiaryModalOpen(true); }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Daftarkan Mustahik
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-emerald-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#05110c] text-neutral-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-emerald-950">ID / Terdaftar</th>
                        <th className="p-3 border-b border-emerald-950">Nama & Alamat</th>
                        <th className="p-3 border-b border-emerald-950">Golongan (Asnaf)</th>
                        <th className="p-3 border-b border-emerald-950">Deskripsi Bantuan Terjadwal</th>
                        <th className="p-3 border-b border-emerald-950 text-center">Aksi Pengelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {filteredBeneficiaries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-neutral-500">Tidak ada register penerima manfaat yang cocok.</td>
                        </tr>
                      ) : (
                        filteredBeneficiaries.map((ben) => (
                          <tr key={ben.id} className="hover:bg-neutral-800/30 transition-colors">
                            <td className="p-3 font-mono">
                              <span className="font-bold text-white block">{ben.id}</span>
                              <span className="text-[10px] text-neutral-500 block">{ben.registeredAt}</span>
                            </td>
                            <td className="p-3">
                              <strong className="text-neutral-200 block">{ben.name}</strong>
                              <span className="text-[10px] text-neutral-400 block mb-1">HP: {ben.phone || 'Tidak ada'}</span>
                              <span className="text-[10px] text-[#E6C280] block flex items-center gap-0.5">
                                <MapPin size={10} /> {ben.address}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-blue-950/40 border border-blue-900/30 text-blue-300 rounded text-[9px] font-bold">
                                {ben.category}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-300 font-sans leading-relaxed text-[11px]">
                              {ben.assistanceReceived}
                            </td>
                            <td className="p-3 text-center">
                              {canWriteSecretariat ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingBeneficiary(ben);
                                      setBenName(ben.name);
                                      setBenAddress(ben.address);
                                      setBenCat(ben.category);
                                      setBenPhone(ben.phone || '');
                                      setBenAssistance(ben.assistanceReceived);
                                      setIsBeneficiaryModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded transition cursor-pointer"
                                    title="Edit mustahik"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if(confirm(`Apakah Anda yakin ingin menghapus mustahik "${ben.name}" dari register?`)) {
                                        deleteBeneficiary(ben.id);
                                      }
                                    }}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded transition cursor-pointer"
                                    title="Hapus mustahik"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-neutral-500">Hanya Baca</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- WORKSPACE 4: PROGRAM KERJA (program) --- */}
            {adminTab === 'program' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-neutral-100">Evaluasi Rencana & Program kerja</h3>
                  <p className="text-[11px] text-neutral-400">Sasaran program kemaslahatan dan serapan anggaran yang terencana.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((p) => {
                    const progress = Math.min(100, Math.round((p.raisedBudget / p.targetBudget) * 100));
                    return (
                      <div key={p.id} className="bg-neutral-950 p-5 rounded-2xl border border-emerald-950 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-[#E6C280] font-mono block mb-1">PROGRAM ID: {p.id}</span>
                            <h4 className="font-bold text-sm text-white">{p.title}</h4>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'Completed' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' 
                              : p.status === 'In Progress' 
                                ? 'bg-amber-950 text-amber-500 border border-amber-800/30' 
                                : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-neutral-400 leading-relaxed">{p.description}</p>

                        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-2 border-t border-emerald-950">
                          <div>
                            <span className="text-neutral-500 block">Target:</span>
                            {editingProgramId === p.id ? (
                              <div className="flex flex-col gap-1 mt-1">
                                <input
                                  type="number"
                                  value={tempTarget}
                                  onChange={(e) => setTempTarget(Number(e.target.value))}
                                  className="w-full bg-neutral-900 text-white rounded border border-emerald-800 px-1.5 py-0.5 text-[10px] focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      updateProgram(p.id, { targetBudget: tempTarget });
                                      setEditingProgramId(null);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    onClick={() => setEditingProgramId(null)}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-neutral-200">Rp {p.targetBudget.toLocaleString('id-ID')}</span>
                                {(currentRole === 'sekretaris' || currentRole === 'ketua' || currentRole === 'bendahara') && (
                                  <button
                                    onClick={() => {
                                      setEditingProgramId(p.id);
                                      setTempTarget(p.targetBudget);
                                    }}
                                    className="text-emerald-400 hover:text-emerald-300 transition p-0.5 rounded hover:bg-emerald-950/40 cursor-pointer"
                                    title="Edit Target Nominal"
                                  >
                                    <Edit size={10} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Himpun:</span>
                            <span className="text-emerald-400">Rp {p.raisedBudget.toLocaleString('id-ID')}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Realisasi:</span>
                            <span className="text-amber-500">Rp {p.allocatedBudget.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- WORKSPACE 5: ASPIRASI / COMPLAINTS (aduan) --- */}
            {adminTab === 'aduan' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-neutral-100">Register Pengaduan & Tanggapan</h3>
                  <p className="text-[11px] text-neutral-400">Keluhan atau aspirasi masyarakat Banyuresmi Garut. Sekretaris & Ketua wajib menjawab tuntas.</p>
                </div>

                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 text-xs">Belum ada aduan yang tercatat masuk.</div>
                  ) : (
                    complaints.map((c) => (
                      <div key={c.id} className="bg-neutral-950 p-5 rounded-2xl border border-emerald-950 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-sm text-neutral-200 block">{c.title}</strong>
                            <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                              ID: {c.id} • Dari: {c.reporterName} • {c.date}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'Resolved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-500 animate-pulse'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed italic bg-neutral-900/45 p-3 rounded-xl border border-emerald-950/20">
                          "{c.content}"
                        </p>

                        {/* Existing reply */}
                        {c.response ? (
                          <div className="bg-[#05140f] p-4 rounded-xl border border-emerald-950 space-y-1 ml-4 text-xs leading-relaxed">
                            <span className="font-bold text-[#E6C280] text-[10px] uppercase block mb-1">
                              Tanggapan Amil Al Jihad ({c.responseDate}):
                            </span>
                            <p className="text-neutral-300">{c.response}</p>
                          </div>
                        ) : (
                          // Action Reply form (Sekretaris & Ketua only)
                          canWriteSecretariat && (
                            <div className="ml-4 pt-1">
                              {respondingComplaintId === c.id ? (
                                <form onSubmit={handleComplaintReplySubmit} className="space-y-3 text-xs pt-2">
                                  <div className="space-y-1">
                                    <label className="text-neutral-400 font-medium">Tulis tanggapan atau solusi masalah secara santun:</label>
                                    <textarea
                                      required
                                      value={complaintReplyText}
                                      onChange={(e) => setComplaintReplyText(e.target.value)}
                                      rows={2}
                                      placeholder="Wa’alaikumsalam wr wb. Terima kasih banyak atas laporannya. Terkait hal tersebut..."
                                      className="w-full bg-[#040d09] border border-emerald-950 p-2.5 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 resize-none text-[11px] leading-relaxed"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => { setRespondingComplaintId(null); setComplaintReplyText(''); }}
                                      className="px-3 py-1.5 bg-neutral-900 text-neutral-400 font-bold rounded-lg hover:bg-neutral-850"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg"
                                    >
                                      Kirim Tanggapan Resmi
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setRespondingComplaintId(c.id)}
                                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-emerald-950 hover:border-emerald-700 rounded-xl text-[10px] font-bold text-emerald-400 transition cursor-pointer select-none"
                                >
                                  ✓ Tanggapi Laporan Ini
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* --- WORKSPACE 6: AUDIT TRAIL LOGS (audit) --- */}
            {adminTab === 'audit' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-neutral-100">Buku Register Audit Mutasi & Log Perubahan</h3>
                  <p className="text-[11px] text-neutral-400">Setiap mutasi (tambah/edit/hapus) data keuangan oleh Amil terekam abadi untuk dipantau Ketua LAZ & Yayasan Dewan Pembina.</p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[#E6C280] leading-tight leading-relaxed">
                  <ShieldAlert size={12} className="text-[#E6C280] flex-shrink-0" />
                  <span>Sistem Enkripsi Audit Log: Pengguna dilarang memanipulasi log ini demi mengutamakan kredibilitas syariah.</span>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 text-xs">Belum ada riwayat aktivitas yang tercetak.</div>
                  ) : (
                    auditLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="bg-neutral-950 p-4 rounded-xl border border-emerald-950/40 text-xs flex gap-4 items-start"
                      >
                        <div className="h-7 w-7 rounded-full bg-neutral-900 border border-emerald-950 flex items-center justify-center text-xs text-neutral-400 font-mono mt-0.5">
                          {log.action === 'CREATE' && '➕'}
                          {log.action === 'UPDATE' && '📝'}
                          {log.action === 'DELETE' && '🗑️'}
                          {log.action === 'APPROVE' && '✅'}
                          {log.action === 'REJECT' && '❌'}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center flex-wrap gap-2 text-[10px]">
                            <span className="font-mono text-neutral-500">{log.timestamp} (ID: {log.id})</span>
                            <span className={`px-2 py-0.5 font-bold rounded ${
                              log.action === 'DELETE' 
                                ? 'bg-red-950/60 text-red-400 border border-red-500/10'
                                : log.action === 'UPDATE'
                                  ? 'bg-blue-950/60 text-blue-400 border border-blue-500/10'
                                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              [{log.action}] {log.entityType}
                            </span>
                          </div>

                          <p className="text-neutral-200 leading-relaxed text-[11px] font-sans">
                            {log.details}
                          </p>
                          
                          <div className="flex items-center gap-1.5 text-[9px] text-neutral-500 font-mono font-bold pt-1">
                            <span>Operator:</span>
                            <span className="text-neutral-300">{log.operatorName}</span>
                            <span>•</span>
                            <span className="text-amber-500">[{log.operatorRole.toUpperCase()}]</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL 1: ADD/EDIT KAS MASUK --- */}
      {isIncomingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form 
            onSubmit={handleIncomingSubmit}
            className="bg-[#0b1c14] border-2 border-emerald-800 w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-4 relative font-sans text-xs"
          >
            <div className="flex justify-between items-center border-b border-emerald-900/30 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins size={16} className="text-[#E6C280]" />
                {editingIncoming ? 'Edit Catatan Dana Masuk' : 'Input Kas Masuk Baru'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsIncomingModalOpen(false); clearFormFields(); }} 
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">Nama Donatur / Pembayar</label>
                  <input
                    type="text"
                    required
                    value={incName}
                    onChange={(e) => setIncName(e.target.value)}
                    placeholder="Misal: Bapak H. Hamdan"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">No HP (Opsional)</label>
                  <input
                    type="tel"
                    value={incPhone}
                    onChange={(e) => setIncPhone(e.target.value)}
                    placeholder="Contoh: 08XXXXXXXX"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">Nominal Penyaluran (Rp)</label>
                  <input
                    type="number"
                    required
                    value={incAmount || ''}
                    onChange={(e) => setIncAmount(parseInt(e.target.value) || 0)}
                    placeholder="Contoh: 150000"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Kategori Kas</label>
                  <select
                    value={incType}
                    onChange={(e) => setIncType(e.target.value as FundType)}
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Sedekah">Sedekah Jariah</option>
                    <option value="Infak">Infak</option>
                    <option value="Zakat Fitrah">Zakat Fitrah</option>
                    <option value="Zakat Maal">Zakat Maal</option>
                    <option value="Wakaf">Wakaf</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Metode Bayar</label>
                <select
                  value={incMethod}
                  onChange={(e) => setIncMethod(e.target.value)}
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Transfer BRI">Transfer Bank Rakyat Indonesia (BRI)</option>
                  <option value="QRIS Al Jihad">E-Wallet QRIS Al Jihad</option>
                  <option value="Tunai">Tunai ke Amil</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#05130d] p-3 rounded-2xl border border-emerald-950/40">
                <div className="space-y-1">
                  <label className="text-neutral-300 block font-semibold text-[11px]">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => handleDateUpdate(e.target.value)}
                    className="w-full bg-[#040d09] border border-emerald-900 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300 block font-semibold text-[11px]">Tahun Kas (Cepat)</label>
                  <div className="flex gap-1 pt-0.5">
                    {['2025', '2026', '2027'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => selectQuickYear(yr)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          incYear === yr
                            ? 'bg-amber-650 text-white font-extrabold bg-amber-600'
                            : 'bg-[#040d09] text-neutral-400 border border-emerald-950 hover:bg-emerald-950 hover:text-white'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-neutral-400 block mt-1">Tahun Aktif: <strong className="text-amber-500">{incYear}</strong></span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Keterangan / Deskripsi Transaksi</label>
                <textarea
                  required
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  rows={3}
                  placeholder="Misal: Penyaluran zakat bulanan keluarga atas nishab simpanan..."
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-emerald-900/10">
              <button
                type="button"
                onClick={() => { setIsIncomingModalOpen(false); clearFormFields(); }}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {editingIncoming ? 'Tinjau Alasan Perubahan' : 'Masukkan ke Buku Kas'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 2: ADD/EDIT KAS KELUAR / PENYALURAN --- */}
      {isOutgoingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form 
            onSubmit={handleOutgoingSubmit}
            className="bg-[#0b1c14] border-2 border-emerald-800 w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-4 relative font-sans text-xs"
          >
            <div className="flex justify-between items-center border-b border-emerald-900/30 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight size={16} className="text-[#E6C280]" />
                {editingOutgoing ? 'Edit Usulan Penyaluran' : 'Ajukan Usulan Penyaluran (Keluar)'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsOutgoingModalOpen(false); clearFormFields(); }} 
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-neutral-300">Pilih Induk Program Terencana</label>
                <select
                  required
                  value={outProgId}
                  onChange={(e) => setOutProgId(e.target.value)}
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Pilih Program Alokasi --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>[{p.id}] {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">Nama Penerima (Usulan Mustahik)</label>
                  <input
                    type="text"
                    required
                    value={outReceiver}
                    onChange={(e) => setOutReceiver(e.target.value)}
                    placeholder="Misal: Jamaah Lansia RT 02"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Kategori Target (Asnaf)</label>
                  <select
                    value={outCat}
                    onChange={(e) => setOutCat(e.target.value as BeneficiaryCategory)}
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Amil">Amil</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                    <option value="Anak Yatim / Dhuafa">Anak Yatim / Dhuafa</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Nominal Penarikan Pengeluaran (Rp)</label>
                <input
                  type="number"
                  required
                  value={outAmount || ''}
                  onChange={(e) => setOutAmount(parseInt(e.target.value) || 0)}
                  placeholder="Contoh: 1000000"
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Deskripsi / Peruntukan Alokasi Keluar</label>
                <textarea
                  required
                  value={outDesc}
                  onChange={(e) => setOutDesc(e.target.value)}
                  rows={3}
                  placeholder="Sejuta rupiah ditargetkan pengadaan 5 paket sembako pokok menyambut lebaran dhuafa..."
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1 overflow-hidden">
                <label className="text-neutral-300">URL Bukti Serah Terima (Mock Photo Link)</label>
                <input
                  type="text"
                  value={outPhoto}
                  onChange={(e) => setOutPhoto(e.target.value)}
                  placeholder="Contoh: https://images.unsplash.com/... (Kosongkan bila belum ada)"
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-emerald-900/10">
              <button
                type="button"
                onClick={() => { setIsOutgoingModalOpen(false); clearFormFields(); }}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {editingOutgoing ? 'Tinjau Alasan Perubahan' : 'Ajukan ke Ketua LAZ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: REGISTER MUSTAHIK / BENEFICIARY --- */}
      {isBeneficiaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form 
            onSubmit={handleBeneficiarySubmit}
            className="bg-[#0b1c14] border-2 border-emerald-800 w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-4 relative font-sans text-xs"
          >
            <div className="flex justify-between items-center border-b border-emerald-900/30 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-[#E6C280]" />
                {editingBeneficiary ? 'Edit Profil Mustahik' : 'Pendaftaran Data Mustahik Baru'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsBeneficiaryModalOpen(false); clearFormFields(); }} 
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">Nama Penerima Manfaat</label>
                  <input
                    type="text"
                    required
                    value={benName}
                    onChange={(e) => setBenName(e.target.value)}
                    placeholder="Contoh: Mak Sukaesih"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Nomor HP / Kontak</label>
                  <input
                    type="tel"
                    value={benPhone}
                    onChange={(e) => setBenPhone(e.target.value)}
                    placeholder="Contoh: 0812XXXXXXXX"
                    className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Golongan Asnaf Berhak</label>
                <select
                  value={benCat}
                  onChange={(e) => setBenCat(e.target.value as BeneficiaryCategory)}
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Fakir">Fakir</option>
                  <option value="Miskin">Miskin</option>
                  <option value="Amil">Amil (Amil Pengurus Lokal)</option>
                  <option value="Fisabilillah">Fisabilillah (Pembimbing Agama)</option>
                  <option value="Ibnu Sabil">Ibnu Sabil</option>
                  <option value="Anak Yatim / Dhuafa">Anak Yatim dhuafa santri</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Alamat Lengkap Rumah</label>
                <input
                  type="text"
                  required
                  value={benAddress}
                  onChange={(e) => setBenAddress(e.target.value)}
                  placeholder="Misal: Kp. Bantarjati RT 02 RW 08, Bagendit Garut"
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Pemberian Bantuan Terjadwal / Deskripsi Khusus</label>
                <textarea
                  required
                  value={benAssistance}
                  onChange={(e) => setBenAssistance(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Beras fitrah 10kg, paket sembako hari raya dhuafa bulanan..."
                  className="w-full bg-[#040d09] border border-emerald-950 p-2 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-emerald-900/10">
              <button
                type="button"
                onClick={() => { setIsBeneficiaryModalOpen(false); clearFormFields(); }}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {editingBeneficiary ? 'Simpan Perubahan Mustahik' : 'Daftarkan Registrasi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 4: REQUIRED MODIFICATION / DELETION AUDIT REASON BOX --- */}
      {auditReasonModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#120002] border-2 border-red-900 w-full max-w-md rounded-2xl p-6 space-y-4 relative font-sans text-xs shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={26} className="animate-pulse" />
              <div>
                <h4 className="font-extrabold text-sm text-neutral-100">DIREKTORAT AUDIT TRANSPARANSI</h4>
                <p className="text-[9px] text-neutral-450 font-mono uppercase tracking-wide">YAYASAN AL HAMID HADUM MANDATE</p>
              </div>
            </div>

            <div className="text-[11px] text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-red-950/40">
              Setiap penghapusan atau penyuntingan catatan keuangan amil wajib menyertakan alasan yang eksplisit. Rekaman ini akan dikirimkan secara langsung ke Audit Ledger Yayasan dan tidak dapat dihapus kembali demi akuntabilitas syariah.
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-neutral-400 font-bold">Deskripsikan Alasan Penyesuaian Kas / Koreksi:</label>
              <textarea
                required
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Terjadi salah ketik input nominal kuitansi digital oleh asisten bendahara..."
                className="w-full bg-neutral-950 border border-red-950 p-2.5 rounded-xl text-neutral-200 placeholder-neutral-750 focus:outline-none focus:border-red-500 resize-none font-sans"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setModificationReason(''); setAuditReasonModal({ isOpen: false, type: 'DELETE_INC', targetId: '' }); }}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl hover:bg-neutral-850"
              >
                Batal Penyesuaian
              </button>
              <button
                type="button"
                onClick={confirmAuditAction}
                disabled={!modificationReason.trim()}
                className="px-5 py-2 bg-red-900 hover:bg-red-800 disabled:bg-neutral-800 text-white disabled:text-neutral-500 font-bold rounded-xl transition"
              >
                Simpan Log & Terapkan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: SECURE PASSCODE VERIFICATION OVERLAY --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <form 
            onSubmit={handlePasswordSubmit}
            className="bg-[#0b1c14] border-2 border-emerald-850 w-full max-w-sm rounded-[24px] p-6 md:p-8 space-y-5 relative font-sans text-xs text-center shadow-2xl animate-fade-in"
          >
            <div className="flex justify-center mx-auto h-12 w-12 bg-emerald-950/40 rounded-full border border-emerald-900/60 flex-shrink-0 items-center text-emerald-400">
              <Lock size={20} className="text-[#E6C280]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">Verifikasi Sandi Petugas</h3>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Silakan masukkan kata sandi khusus amil untuk membuka hak akses menulis & mengubah kas peran <span className="text-amber-400 font-extrabold uppercase">{(roleToVerify || '').toUpperCase()}</span>.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-neutral-300 font-bold block">Masukan Kata Sandi:</label>
              <input
                type="password"
                required
                autoFocus
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#040d09] border border-emerald-950 p-3 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-[#E6C280] text-center text-lg"
              />
            </div>

            {passwordError && (
              <div className="text-[10px] text-red-400 font-medium bg-red-950/20 py-1.5 px-3 rounded-lg border border-red-950/40">
                ⚠️ {passwordError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsPasswordModalOpen(false); setRoleToVerify(null); setEnteredPassword(''); setPasswordError(''); }}
                className="flex-1 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Buka Kunci
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
