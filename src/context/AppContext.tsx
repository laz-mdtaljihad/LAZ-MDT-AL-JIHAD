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
  ApprovalStatus,
  ProjectProgress,
  Santri,
  Asatidzah,
  LearningMedia,
  RaporSantri
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
  documentations: ProjectProgress[];

  // MDT & Media Ajar State
  santriList: Santri[];
  asatidzahList: Asatidzah[];
  learningMediaList: LearningMedia[];
  raporList: RaporSantri[];
  
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
  
  // Documentation / Progress Actions
  addDocumentation: (doc: Omit<ProjectProgress, 'id'>) => void;
  updateDocumentation: (id: string, doc: Partial<ProjectProgress>) => void;
  deleteDocumentation: (id: string) => void;

  // MDT Management Actions (Santri, Asatidzah, Rapor, Media Ajar)
  addSantri: (santri: Omit<Santri, 'id'>) => void;
  updateSantri: (id: string, santri: Partial<Santri>) => void;
  deleteSantri: (id: string) => void;

  addAsatidzah: (asatidzah: Omit<Asatidzah, 'id'>) => void;
  updateAsatidzah: (id: string, asatidzah: Partial<Asatidzah>) => void;
  deleteAsatidzah: (id: string) => void;

  addLearningMedia: (media: Omit<LearningMedia, 'id'>) => void;
  updateLearningMedia: (id: string, media: Partial<LearningMedia>) => void;
  deleteLearningMedia: (id: string) => void;

  addRapor: (rapor: Omit<RaporSantri, 'id'>) => void;
  updateRapor: (id: string, rapor: Partial<RaporSantri>) => void;
  deleteRapor: (id: string) => void;
  
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

const DEFAULT_DOCUMENTATIONS: ProjectProgress[] = [
  {
    id: 'DOC01',
    date: '2026-06-15',
    title: 'Pembongkaran Struktur Atap Lama',
    description: 'Pelepasan genteng dan kayu usuk/reng lama yang lapuk untuk diganti dengan konstruksi baja kokoh.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
    progressPercentage: 15,
    uploadedBy: 'Hamdan Al-Bantari'
  },
  {
    id: 'DOC02',
    date: '2026-06-22',
    title: 'Pengecoran Pondasi Pilar Utama',
    description: 'Pilar beton utama diperkuat untuk menopang struktur bangunan kelas di lantai dua kelak.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800',
    progressPercentage: 35,
    uploadedBy: 'Hamdan Al-Bantari'
  },
  {
    id: 'DOC03',
    date: '2026-06-28',
    title: 'Pemasangan Dinding Bata Kelas Baru',
    description: 'Progres pengerjaan dinding semen dan batu bata merah untuk dua ruang kelas utama santri.',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-construction-site-with-cranes-and-workers-41716-large.mp4',
    progressPercentage: 55,
    uploadedBy: 'Hamdan Al-Bantari'
  }
];

const DEFAULT_SANTRI: Santri[] = [
  {
    id: 'STR001',
    nis: '3205012026001',
    name: 'Ahmad Syauqi Ramadhan',
    jenjang: 'Ula',
    kelas: '2 Ula A',
    gender: 'L',
    parentName: 'H. Abdul Ghani',
    parentPhone: '081234567890',
    status: 'Aktif',
    hafalanJuzAmma: 'Juz 30 (An-Naba s/d An-Nas Selesai)',
    alamat: 'Kampus MDT Al Jihad Bagendit Garut'
  },
  {
    id: 'STR002',
    nis: '3205012026002',
    name: 'Nur Syifa Aulia',
    jenjang: 'Ula',
    kelas: '3 Ula B',
    gender: 'P',
    parentName: 'Ibu Maryam',
    parentPhone: '081987654321',
    status: 'Aktif',
    hafalanJuzAmma: 'Surat Yaasiin & Juz 30 Complete',
    alamat: 'Kp. Sukatani RT 02/05 Bagendit'
  },
  {
    id: 'STR003',
    nis: '3205012026003',
    name: 'M. Rizky Pratama',
    jenjang: 'Wustha',
    kelas: '1 Wustha',
    gender: 'L',
    parentName: 'Bpk. Ahmad Sobari',
    parentPhone: '082112233445',
    status: 'Aktif',
    hafalanJuzAmma: 'Juz 30 & Hadits Arbain 1 - 15',
    alamat: 'Banyuresmi Garut'
  },
  {
    id: 'STR004',
    nis: '3205012026004',
    name: 'Siti Fatimah Zahrani',
    jenjang: 'Ula',
    kelas: '1 Ula',
    gender: 'P',
    parentName: 'Ibu Salmah',
    parentPhone: '085711223344',
    status: 'Aktif',
    hafalanJuzAmma: 'Surat Al-Fatihah, An-Nas s/d Al-Humazah',
    alamat: 'Bagendit Garut'
  }
];

const DEFAULT_ASATIDZAH: Asatidzah[] = [
  {
    id: 'UST001',
    npk: '19880412202601',
    name: 'Ustadz M. Farhan, S.Pd.I',
    subject: 'Fiqih Safinatun Najah & Tajwid',
    phone: '081223344556',
    education: 'Alumni Pesantren Sukamanah / S1 PAI',
    status: 'Aktif'
  },
  {
    id: 'UST002',
    npk: '19920815202602',
    name: 'Ustadzah Halimatus Sa\'diyah',
    subject: 'Aqidah Akhlaq & Tahfidz Juz Amma',
    phone: '081334455667',
    education: 'Hafidzah 30 Juz / Mahasiswi STAI Garut',
    status: 'Aktif'
  },
  {
    id: 'UST003',
    npk: '19850110202603',
    name: 'Ustadz Syarif Hidayatullah, M.Ag.',
    subject: 'Bahasa Arab & Sejarah Kebudayaan Islam (SKI)',
    phone: '081556677889',
    education: 'S2 UIN Sunan Gunung Djati / Pengajar Kemenag',
    status: 'Aktif'
  }
];

const DEFAULT_LEARNING_MEDIA: LearningMedia[] = [
  {
    id: 'MED001',
    title: 'Kitab Safinatun Najah - Bab Fiqih Thaharah & Sholat',
    category: 'Kitab Kuning',
    author: 'Syaikh Salim bin Sumair Al-Hadhrami',
    description: 'Matan dasar fiqih madzhab Syafi\'i untuk santri Diniyah Takmiliyah Ula. Dilengkapi terjemah Sunda/Indonesia dan penjelasannya.',
    contentSummary: 'Rukun Islam ada 5, Rukun Iman ada 6. Syarat syah sholat ada 8 perkara: Suci dari hadas besar & kecil, suci pakaian tempat dari najis, menutup aurat, menghadap kiblat, masuk waktu, tahu fardhu sholat.',
    mediaUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=800',
    type: 'kitab',
    downloadable: true
  },
  {
    id: 'MED002',
    title: 'Aqidatul Awam - Nadzom Tauhid Diniyah',
    category: 'Aqidah Akhlaq',
    author: 'Syaikh Ahmad Al-Marzuki',
    description: 'Ringkasan nadzom tauhid memuat 20 Sifat Wajib Allah, Sifat Mustahil, Jaiz, serta nama Rasul dan Kitab Suci.',
    contentSummary: 'Abda\'u bismillahi warrahmani • wa birrahimi da-imil ihsani. Wajib bagi setiap mukallaf mengetahui 20 Sifat Wajib Allah: Wujud, Qidam, Baqa, Mukhalafatu lil hawaditsi...',
    mediaUrl: 'https://images.unsplash.com/photo-1609599006353-e629aa5cfb71?auto=format&fit=crop&q=80&w=800',
    type: 'kitab',
    downloadable: true
  },
  {
    id: 'MED003',
    title: 'Panduan Tajwid Al-Qur\'an & Ghorib Juz Amma',
    category: 'Al-Qur\'an & Tajwid',
    author: 'Tim Kurikulum MDT Kemenag',
    description: 'Modul praktis hukum Nun Mati/Tanwin, Mim Mati, Hukum Mad, Qalqalah, Makhorijul Huruf, serta ayat ghorib di Juz 30.',
    contentSummary: 'Hukum Izhar Halqi dibaca jelas apabila Nun suci/tanwin bertemu Hamzah, Ha, Kha, ' + '\'Ain, Ghain, Ha. Idgham Bighunnah dibaca lebur dengung bertemu Ya, Nun, Mim, Wau.',
    mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    type: 'modul',
    downloadable: true
  },
  {
    id: 'MED004',
    title: 'Video Peragaan Wudhu & Sholat Khusyu Sesuai Sunnah',
    category: 'Video & Audio Pembelajaran',
    author: 'Tim Media MDT Al Jihad',
    description: 'Video tuntunan visual cara wudhu yang sempurna dan gerak-gerik sholat beserta bacaan latin & artinya.',
    contentSummary: 'Peragaan langkah demi langkah Niat Wudhu, Basuh Muka, Tangan sampai Siku, Usap Kepala, Telinga, dan Basuh Kaki sampai Mata Kaki.',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-reading-the-holy-quran-43026-large.mp4',
    type: 'video',
    downloadable: false
  }
];

const DEFAULT_RAPOR: RaporSantri[] = [
  {
    id: 'RAP001',
    santriId: 'STR001',
    santriName: 'Ahmad Syauqi Ramadhan',
    nis: '3205012026001',
    kelas: '2 Ula A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    nilai: {
      alquranHadits: 88,
      aqidahAkhlaq: 90,
      fiqihIbadah: 85,
      ski: 82,
      bahasaArab: 80,
      tajwid: 88,
      praktekIbadah: 92
    },
    catatanUstadz: 'Ananda Syauqi sangat rajin dan hafalan Juz 30 lancar. Tingkatkan kelancaran makhraj huruf Bahasa Arab.'
  }
];

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

  const [documentations, setDocumentations] = useState<ProjectProgress[]>(() => {
    const saved = localStorage.getItem('laz_documentations_v2');
    return saved ? JSON.parse(saved) : DEFAULT_DOCUMENTATIONS;
  });

  const [santriList, setSantriList] = useState<Santri[]>(() => {
    const saved = localStorage.getItem('mdt_santri_v1');
    return saved ? JSON.parse(saved) : DEFAULT_SANTRI;
  });

  const [asatidzahList, setAsatidzahList] = useState<Asatidzah[]>(() => {
    const saved = localStorage.getItem('mdt_asatidzah_v1');
    return saved ? JSON.parse(saved) : DEFAULT_ASATIDZAH;
  });

  const [learningMediaList, setLearningMediaList] = useState<LearningMedia[]>(() => {
    const saved = localStorage.getItem('mdt_media_v1');
    return saved ? JSON.parse(saved) : DEFAULT_LEARNING_MEDIA;
  });

  const [raporList, setRaporList] = useState<RaporSantri[]>(() => {
    const saved = localStorage.getItem('mdt_rapor_v1');
    return saved ? JSON.parse(saved) : DEFAULT_RAPOR;
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

      onSnapshot(collection(db, 'documentations'), (snapshot) => {
        const list: ProjectProgress[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as ProjectProgress);
        });
        if (snapshot.empty) {
          // Initialize empty collection with default documentations
          DEFAULT_DOCUMENTATIONS.forEach((d) => {
            setDoc(doc(db, 'documentations', d.id), d).catch(err => console.error('Error seeding documentation:', err));
          });
          setDocumentations(DEFAULT_DOCUMENTATIONS);
        } else {
          list.sort((a, b) => b.date.localeCompare(a.date));
          setDocumentations(list);
          localStorage.setItem('laz_documentations_v2', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => {
        handleError(error);
      }),

      onSnapshot(collection(db, 'santri'), (snapshot) => {
        const list: Santri[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Santri);
        });
        if (snapshot.empty) {
          DEFAULT_SANTRI.forEach((s) => {
            setDoc(doc(db, 'santri', s.id), s).catch(err => console.error('Error seeding santri:', err));
          });
          setSantriList(DEFAULT_SANTRI);
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          setSantriList(list);
          localStorage.setItem('mdt_santri_v1', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => handleError(error)),

      onSnapshot(collection(db, 'asatidzah'), (snapshot) => {
        const list: Asatidzah[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Asatidzah);
        });
        if (snapshot.empty) {
          DEFAULT_ASATIDZAH.forEach((u) => {
            setDoc(doc(db, 'asatidzah', u.id), u).catch(err => console.error('Error seeding asatidzah:', err));
          });
          setAsatidzahList(DEFAULT_ASATIDZAH);
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          setAsatidzahList(list);
          localStorage.setItem('mdt_asatidzah_v1', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => handleError(error)),

      onSnapshot(collection(db, 'learning_media'), (snapshot) => {
        const list: LearningMedia[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as LearningMedia);
        });
        if (snapshot.empty) {
          DEFAULT_LEARNING_MEDIA.forEach((m) => {
            setDoc(doc(db, 'learning_media', m.id), m).catch(err => console.error('Error seeding media:', err));
          });
          setLearningMediaList(DEFAULT_LEARNING_MEDIA);
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          setLearningMediaList(list);
          localStorage.setItem('mdt_media_v1', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => handleError(error)),

      onSnapshot(collection(db, 'rapor_santri'), (snapshot) => {
        const list: RaporSantri[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as RaporSantri);
        });
        if (snapshot.empty) {
          DEFAULT_RAPOR.forEach((r) => {
            setDoc(doc(db, 'rapor_santri', r.id), r).catch(err => console.error('Error seeding rapor:', err));
          });
          setRaporList(DEFAULT_RAPOR);
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          setRaporList(list);
          localStorage.setItem('mdt_rapor_v1', JSON.stringify(list));
        }
        checkSuccess();
      }, (error) => handleError(error)),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Save changes to localStorage for persistent simulations
  useEffect(() => {
    localStorage.setItem('laz_current_role_v2', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('mdt_santri_v1', JSON.stringify(santriList));
  }, [santriList]);

  useEffect(() => {
    localStorage.setItem('mdt_asatidzah_v1', JSON.stringify(asatidzahList));
  }, [asatidzahList]);

  useEffect(() => {
    localStorage.setItem('mdt_media_v1', JSON.stringify(learningMediaList));
  }, [learningMediaList]);

  useEffect(() => {
    localStorage.setItem('mdt_rapor_v1', JSON.stringify(raporList));
  }, [raporList]);

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
    setDoc(doc(db, 'audit_logs', id), newLog).catch(console.error);
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
    
    setDoc(doc(db, 'incoming_funds', id), newFund).catch(console.error);
    writeLog(
      'CREATE',
      'INCOMING_FUND',
      id,
      `Mencatat Dana Masuk baru dari ${fund.donorName} sebesar Rp ${fund.amount.toLocaleString('id-ID')} kategori ${fund.type}.`
    );

    // Update Program raised budget if matching
    const matchingProgram = programs.find(p => fund.description.toLowerCase().includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(fund.description.toLowerCase()));
    if (matchingProgram) {
      setDoc(doc(db, 'programs', matchingProgram.id), {
        ...matchingProgram,
        raisedBudget: matchingProgram.raisedBudget + fund.amount
      }).catch(console.error);
    }
  };

  const updateIncomingFund = (id: string, updatedFields: Partial<IncomingFund>, reason: string) => {
    const original = incomingFunds.find(f => f.id === id);
    if (!original) return;

    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'incoming_funds', id), merged).catch(console.error);
    
    let changeDetails = `Mengubah Dana Masuk ID #${id}. Alasan: "${reason}". `;
    if (updatedFields.amount && updatedFields.amount !== original.amount) {
      changeDetails += `Nominal berubah dari Rp ${original.amount.toLocaleString('id-ID')} menjadi Rp ${updatedFields.amount.toLocaleString('id-ID')}. `;
      
      // Sync matching program if applies
      const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
      if (matchingProgram) {
        const diff = (updatedFields.amount || 0) - original.amount;
        setDoc(doc(db, 'programs', matchingProgram.id), {
          ...matchingProgram,
          raisedBudget: Math.max(0, matchingProgram.raisedBudget + diff)
        }).catch(console.error);
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

    deleteDoc(doc(db, 'incoming_funds', id)).catch(console.error);
    writeLog(
      'DELETE',
      'INCOMING_FUND',
      id,
      `MENGHAPUS Catatan Dana Masuk dari ${original.donorName} sebesar Rp ${original.amount.toLocaleString('id-ID')} (ID #${id}). Alasan penarikan: "${reason}".`
    );

    // Revert program raises
    const matchingProgram = programs.find(p => original.description.toLowerCase().includes(p.title.toLowerCase()));
    if (matchingProgram) {
      setDoc(doc(db, 'programs', matchingProgram.id), {
        ...matchingProgram,
        raisedBudget: Math.max(0, matchingProgram.raisedBudget - original.amount)
      }).catch(console.error);
    }
  };

  const addOutgoingFund = (fund: Omit<OutgoingFund, 'id' | 'status'>) => {
    const id = `OUT${Math.floor(100 + Math.random() * 900)}`;
    const newFund: OutgoingFund = {
      ...fund,
      id,
      status: 'Pending' // Bendahara inputs, Ketua LAZ must approve/verify
    };

    setDoc(doc(db, 'outgoing_funds', id), newFund).catch(console.error);
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

    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'outgoing_funds', id), merged).catch(console.error);

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

    deleteDoc(doc(db, 'outgoing_funds', id)).catch(console.error);
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

    setDoc(doc(db, 'beneficiaries', id), newBeneficiary).catch(console.error);
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

    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'beneficiaries', id), merged).catch(console.error);
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

    deleteDoc(doc(db, 'beneficiaries', id)).catch(console.error);
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
    setDoc(doc(db, 'programs', id), newProg).catch(console.error);
    writeLog('CREATE', 'PROGRAM', id, `Menambahkan rencana program kemaslahatan baru: "${program.title}".`);
  };

  const updateProgram = (id: string, updatedFields: Partial<Program>) => {
    const original = programs.find(p => p.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'programs', id), merged).catch(console.error);
  };

  // --- ACTIONS: KETUA LAZ (APPROVALS) ---

  const approveTransaction = (id: string) => {
    const original = outgoingFunds.find(f => f.id === id);
    if (!original) return;

    const updated = { 
      ...original, 
      status: 'Approved' as ApprovalStatus, 
      approvedBy: currentUser.name, 
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setDoc(doc(db, 'outgoing_funds', id), updated).catch(console.error);

    // Increase programmatic allocated (realized) budget
    if (original.programId) {
      const matchingProgram = programs.find(p => p.id === original.programId);
      if (matchingProgram) {
        setDoc(doc(db, 'programs', original.programId), {
          ...matchingProgram,
          allocatedBudget: matchingProgram.allocatedBudget + original.amount
        }).catch(console.error);
      }
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

    const updated = { 
      ...original, 
      status: 'Rejected' as ApprovalStatus,
      approvedBy: currentUser.name,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setDoc(doc(db, 'outgoing_funds', id), updated).catch(console.error);

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

    setDoc(doc(db, 'complaints', id), newComplaint).catch(console.error);
  };

  const respondToComplaint = (id: string, response: string) => {
    const original = complaints.find(c => c.id === id);
    if (!original) return;
    const updated = {
      ...original,
      status: 'Resolved' as const,
      response,
      responseDate: new Date().toISOString().substring(0, 10)
    };
    setDoc(doc(db, 'complaints', id), updated).catch(console.error);
  };

  const addDocumentation = (docData: Omit<ProjectProgress, 'id'>) => {
    const id = `DOC${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: ProjectProgress = {
      ...docData,
      id
    };
    setDoc(doc(db, 'documentations', id), newDoc).catch(console.error);
    writeLog(
      'CREATE',
      'PROGRAM',
      id,
      `Menambahkan dokumentasi progres "${docData.title}" (${docData.progressPercentage}%).`
    );
  };

  const updateDocumentation = (id: string, updatedFields: Partial<ProjectProgress>) => {
    const original = documentations.find(d => d.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'documentations', id), merged).catch(console.error);
    writeLog(
      'UPDATE',
      'PROGRAM',
      id,
      `Memperbarui dokumentasi progres "${original.title}".`
    );
  };

  const deleteDocumentation = (id: string) => {
    const original = documentations.find(d => d.id === id);
    if (!original) return;
    deleteDoc(doc(db, 'documentations', id)).catch(console.error);
    writeLog(
      'DELETE',
      'PROGRAM',
      id,
      `Menghapus dokumentasi progres "${original.title}".`
    );
  };

  // --- ACTIONS: MDT MANAGEMENT (SANTRI, ASATIDZAH, MEDIA AJAR, RAPOR) ---

  const addSantri = (santriData: Omit<Santri, 'id'>) => {
    const id = `STR${Math.floor(100 + Math.random() * 900)}`;
    const newSantri: Santri = { ...santriData, id };
    setDoc(doc(db, 'santri', id), newSantri).catch(console.error);
    writeLog('CREATE', 'BENEFICIARY', id, `Pendaftaran Santri Baru: "${santriData.name}" (NIS: ${santriData.nis}, Kelas: ${santriData.kelas}).`);
  };

  const updateSantri = (id: string, updatedFields: Partial<Santri>) => {
    const original = santriList.find(s => s.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'santri', id), merged).catch(console.error);
    writeLog('UPDATE', 'BENEFICIARY', id, `Memperbarui data Santri: "${original.name}".`);
  };

  const deleteSantri = (id: string) => {
    const original = santriList.find(s => s.id === id);
    if (!original) return;
    deleteDoc(doc(db, 'santri', id)).catch(console.error);
    writeLog('DELETE', 'BENEFICIARY', id, `Menghapus data Santri: "${original.name}".`);
  };

  const addAsatidzah = (asatidzahData: Omit<Asatidzah, 'id'>) => {
    const id = `UST${Math.floor(100 + Math.random() * 900)}`;
    const newUst: Asatidzah = { ...asatidzahData, id };
    setDoc(doc(db, 'asatidzah', id), newUst).catch(console.error);
    writeLog('CREATE', 'BENEFICIARY', id, `Menambahkan Pengajar/Guru MDT: "${asatidzahData.name}".`);
  };

  const updateAsatidzah = (id: string, updatedFields: Partial<Asatidzah>) => {
    const original = asatidzahList.find(u => u.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'asatidzah', id), merged).catch(console.error);
    writeLog('UPDATE', 'BENEFICIARY', id, `Memperbarui data Guru: "${original.name}".`);
  };

  const deleteAsatidzah = (id: string) => {
    const original = asatidzahList.find(u => u.id === id);
    if (!original) return;
    deleteDoc(doc(db, 'asatidzah', id)).catch(console.error);
    writeLog('DELETE', 'BENEFICIARY', id, `Menghapus data Guru: "${original.name}".`);
  };

  const addLearningMedia = (mediaData: Omit<LearningMedia, 'id'>) => {
    const id = `MED${Math.floor(100 + Math.random() * 900)}`;
    const newMedia: LearningMedia = { ...mediaData, id };
    setDoc(doc(db, 'learning_media', id), newMedia).catch(console.error);
    writeLog('CREATE', 'PROGRAM', id, `Menerbitkan Media Ajar Digital: "${mediaData.title}".`);
  };

  const updateLearningMedia = (id: string, updatedFields: Partial<LearningMedia>) => {
    const original = learningMediaList.find(m => m.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'learning_media', id), merged).catch(console.error);
    writeLog('UPDATE', 'PROGRAM', id, `Memperbarui Media Ajar: "${original.title}".`);
  };

  const deleteLearningMedia = (id: string) => {
    const original = learningMediaList.find(m => m.id === id);
    if (!original) return;
    deleteDoc(doc(db, 'learning_media', id)).catch(console.error);
    writeLog('DELETE', 'PROGRAM', id, `Menghapus Media Ajar: "${original.title}".`);
  };

  const addRapor = (raporData: Omit<RaporSantri, 'id'>) => {
    const id = `RAP${Math.floor(100 + Math.random() * 900)}`;
    const newRapor: RaporSantri = { ...raporData, id };
    setDoc(doc(db, 'rapor_santri', id), newRapor).catch(console.error);
    writeLog('CREATE', 'BENEFICIARY', id, `Input Rapor Santri: "${raporData.santriName}" (${raporData.semester} ${raporData.tahunAjaran}).`);
  };

  const updateRapor = (id: string, updatedFields: Partial<RaporSantri>) => {
    const original = raporList.find(r => r.id === id);
    if (!original) return;
    const merged = { ...original, ...updatedFields };
    setDoc(doc(db, 'rapor_santri', id), merged).catch(console.error);
    writeLog('UPDATE', 'BENEFICIARY', id, `Edit Rapor Santri: "${original.santriName}".`);
  };

  const deleteRapor = (id: string) => {
    const original = raporList.find(r => r.id === id);
    if (!original) return;
    deleteDoc(doc(db, 'rapor_santri', id)).catch(console.error);
    writeLog('DELETE', 'BENEFICIARY', id, `Hapus Rapor Santri: "${original.santriName}".`);
  };

  const resetToDefault = async () => {
    if (confirm('Apakah Anda yakin ingin memulihkan data bawaan awal MDT Al Jihad? Semua data simulasi saat ini akan diperbarui.')) {
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
      for (const item of documentations) {
        await deleteDoc(doc(db, 'documentations', item.id)).catch(console.error);
      }
      for (const item of santriList) {
        await deleteDoc(doc(db, 'santri', item.id)).catch(console.error);
      }
      for (const item of asatidzahList) {
        await deleteDoc(doc(db, 'asatidzah', item.id)).catch(console.error);
      }
      for (const item of learningMediaList) {
        await deleteDoc(doc(db, 'learning_media', item.id)).catch(console.error);
      }
      for (const item of raporList) {
        await deleteDoc(doc(db, 'rapor_santri', item.id)).catch(console.error);
      }
      // Overwrite programs with initial
      for (const p of DEFAULT_PROGRAMS) {
        await setDoc(doc(db, 'programs', p.id), p).catch(console.error);
      }
      // Reseed documentations
      for (const d of DEFAULT_DOCUMENTATIONS) {
        await setDoc(doc(db, 'documentations', d.id), d).catch(console.error);
      }
      for (const s of DEFAULT_SANTRI) {
        await setDoc(doc(db, 'santri', s.id), s).catch(console.error);
      }
      for (const u of DEFAULT_ASATIDZAH) {
        await setDoc(doc(db, 'asatidzah', u.id), u).catch(console.error);
      }
      for (const m of DEFAULT_LEARNING_MEDIA) {
        await setDoc(doc(db, 'learning_media', m.id), m).catch(console.error);
      }
      for (const r of DEFAULT_RAPOR) {
        await setDoc(doc(db, 'rapor_santri', r.id), r).catch(console.error);
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
      documentations,
      santriList,
      asatidzahList,
      learningMediaList,
      raporList,
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
      addDocumentation,
      updateDocumentation,
      deleteDocumentation,
      addSantri,
      updateSantri,
      deleteSantri,
      addAsatidzah,
      updateAsatidzah,
      deleteAsatidzah,
      addLearningMedia,
      updateLearningMedia,
      deleteLearningMedia,
      addRapor,
      updateRapor,
      deleteRapor,
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
