/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FundType, IncomingFund } from '../types';
import { MovingTitle, PulseTitle } from './MovingTitle';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Printer
} from 'lucide-react';

export const DashboardPublic: React.FC<{ onEnterPortal: () => void }> = ({ onEnterPortal }) => {
  const { 
    incomingFunds, 
    outgoingFunds, 
    programs, 
    complaints, 
    submitQuickDonation, 
    submitComplaint,
    syncStatus,
    syncErrorMessage
  } = useApp();

  // Active section scroll tracking
  const [activeTab, setActiveTab] = useState<'profile' | 'realisasi' | 'programs' | 'donasi' | 'pengaduan'>('profile');

  // Donation form state
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donationAmount, setDonationAmount] = useState<number>(50000);
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [fundType, setFundType] = useState<FundType>('Sedekah');
  const [payMethod, setPayMethod] = useState('Transfer BRI');
  
  // Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<IncomingFund | null>(null);

  // Complaint form state
  const [compName, setCompName] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compTitle, setCompTitle] = useState('');
  const [compContent, setCompContent] = useState('');
  const [compAnon, setCompAnon] = useState(false);

  // Math totals
  const totalIncome = incomingFunds.reduce((sum, f) => sum + f.amount, 0);
  // Only calculate "Approved" outgoing money as publicized realization!
  const totalRealized = outgoingFunds
    .filter(f => f.status === 'Approved')
    .reduce((sum, f) => sum + f.amount, 0);
  const currentSaldo = totalIncome - totalRealized;

  // Donation quick selectors
  const quickAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmountStr ? parseInt(customAmountStr) || 0 : donationAmount;
    if (finalAmount <= 0) {
      alert('Tolong masukkan nominal sedekah yang valid.');
      return;
    }
    
    const receipt = submitQuickDonation(
      donorName.trim() ? donorName : 'Hamba Allah',
      finalAmount,
      fundType,
      donorPhone,
      payMethod
    );

    setActiveReceipt(receipt);
    
    // Clear form
    setDonorName('');
    setDonorPhone('');
    setCustomAmountStr('');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim() || !compContent.trim()) {
      alert('Tolong isi judul dan konten laporan/pengaduan.');
      return;
    }

    const reporter = compAnon ? 'Hamba Allah' : (compName.trim() || 'Hamba Allah');
    
    submitComplaint(
      reporter,
      compPhone,
      compTitle,
      compContent,
      compAnon
    );

    // Dynamic WhatsApp url generator prefilled text
    const waNumber = '08211857851';
    const cleanPhone = compPhone ? ` (No. HP: ${compPhone})` : '';
    const waText = encodeURIComponent(
      `Assalamu’alaikum, saya ingin menyampaikan laporan/pengaduan terkait LAZ MDT Al Jihad:\n\n` +
      `Dari: ${reporter}${cleanPhone}\n` +
      `Sebab/Judul: ${compTitle}\n` +
      `Detail Laporan: ${compContent}\n\n` +
      `Mohon tim pengurus meninjau aduan saya demi kemaslahatan bersama. Terima kasih.`
    );
    const waUrl = `https://wa.me/628211857851?text=${waText}`;

    // Alert and clear
    alert(`Laporan Anda telah tercatat secara lokal! Klik OK untuk menindaklanjuti dengan mengirimkan pesan aduan resmi ke WhatsApp Admin (08211857851) secara otomatis.`);
    window.open(waUrl, '_blank');

    setCompName('');
    setCompPhone('');
    setCompTitle('');
    setCompContent('');
    setCompAnon(false);
  };

  // Export report to CSV simulation
  const handleExportPublicReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== LAPORAN PUBLIKASI LAZ MDT AL JIHAD ===\r\n";
    csvContent += `Tanggal Cetak: ${new Date().toISOString().substring(0, 10)}\r\n`;
    csvContent += `Total Kas Masuk: Rp ${totalIncome}\r\n`;
    csvContent += `Total Kas Penyaluran (Realisasi): Rp ${totalRealized}\r\n`;
    csvContent += `Saldo Tersisa: Rp ${currentSaldo}\r\n\r\n`;
    
    csvContent += "PROGRAM KERJA\r\n";
    csvContent += "ID,Nama Program,Target Anggaran,Terkumpul,Teralokasi,Status\r\n";
    programs.forEach(p => {
      csvContent += `"${p.id}","${p.title}",${p.targetBudget},${p.raisedBudget},${p.allocatedBudget},"${p.status}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Transparansi_AL_JIHAD_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f1] text-[#1a3c34] font-sans pb-16">
      {/* Top Banner & Marquee Header */}
      <MovingTitle />

      {/* Sync Diagnosis Warning Banner */}
      {syncStatus === 'error' && (
        <div className="bg-red-600 text-white font-semibold text-xs px-4 py-2.5 shadow flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-[10px]">Peringatan Sinkronisasi Cloud:</span>
            <span>{syncErrorMessage || 'Koneksi terputus dari database cloud.'}</span>
          </div>
          <button 
            onClick={() => alert(`SINKRONISASI CLOUD GAGAL\n\nKendala: ${syncErrorMessage || 'Aturan keamanan memblokir.'}\n\nSOLUSI CARA MEMPERBAIKI:\n1. Buka Firebase Console proyek Anda ("laz-mdt-aljihad")\n2. Klik "Firestore Database" di menu kiri\n3. Buka tab "Rules" (Aturan Keamanan)\n4. Ubah isi aturan keamanan menjadi:\n\n   rules_version = '2';\n   service cloud.firestore {\n     match /databases/{database}/documents {\n       match /{document=**} {\n         allow read, write: if true;\n       }\n     }\n   }\n\n5. Klik "Publish"\n6. Muat ulang / Refresh halaman aplikasi ini.`)}
            className="bg-black/25 hover:bg-black/40 text-white font-bold px-3 py-1 rounded text-[11px] transition whitespace-nowrap cursor-pointer"
          >
            Lihat Cara Memperbaiki 💡
          </button>
        </div>
      )}
      
      {/* Navbar Container */}
      <header className="sticky top-0 z-30 bg-[#114232] border-b-4 border-[#FCDC2A] text-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCDC2A] rounded-full flex items-center justify-center font-bold text-[#114232] shadow-sm animate-pulse">
              LJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white block tracking-wide leading-none">LAZ MDT AL JIHAD</span>
                {syncStatus === 'success' ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Sync Aktif
                  </span>
                ) : syncStatus === 'error' ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Offline
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Connecting
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FCDC2A] block mt-1">Garut • Amil Trusted</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
            <button 
              onClick={() => { setActiveTab('profile'); document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'profile' ? 'bg-[#0a2e22] text-[#FCDC2A] border border-[#FCDC2A]/30' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
            >
              Profil & Visi
            </button>
            <button 
              onClick={() => { setActiveTab('realisasi'); document.getElementById('realisasi_kas')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'realisasi' ? 'bg-[#0a2e22] text-[#FCDC2A] border border-[#FCDC2A]/30' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
            >
              Laporan Realisasi
            </button>
            <button 
              onClick={() => { setActiveTab('programs'); document.getElementById('programs_panel')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'programs' ? 'bg-[#0a2e22] text-[#FCDC2A] border border-[#FCDC2A]/30' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
            >
              Program Kerja
            </button>
            <button 
              onClick={() => { setActiveTab('donasi'); document.getElementById('donasi_kilat')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'donasi' ? 'bg-[#0a2e22] text-[#FCDC2A] border border-[#FCDC2A]/30' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
            >
              Donasi Cepat
            </button>
            <button 
              onClick={() => { setActiveTab('pengaduan'); document.getElementById('pengaduan_panel')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'pengaduan' ? 'bg-[#0a2e22] text-[#FCDC2A] border border-[#FCDC2A]/30' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
            >
              Pengaduan
            </button>
          </nav>

          <button
            onClick={onEnterPortal}
            className="px-4 py-2 bg-[#FCDC2A] hover:bg-yellow-400 text-[#114232] text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} className="text-[#114232]" />
            Masuk Portal Petugas
          </button>
        </div>
      </header>

      {/* Hero Header Presentation */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-12">
        <PulseTitle />

        {/* --- SECTION 1: PROFIL & VISI MISI --- */}
        <section id="profil" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch scroll-mt-24">
          {/* Card left: Visi Misi */}
          <div className="lg:col-span-8 bg-white border-l-8 border-[#114232] rounded-3xl p-6 md:p-8 space-y-6 shadow-soft hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#114232]/5 rounded-full filter blur-3xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#114232]/10 text-[#114232] border border-[#114232]/20 text-[10px] font-mono tracking-widest uppercase rounded-full font-bold">
                Sekilas Tentang Lembaga
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#114232]">
                Mempercepat Kebaikan Berkelanjutan
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                <strong>LAZ MDT Al Jihad</strong> adalah unit pelaksana teknis yang bergerak di bidang pengelolaan dana sosial keagamaan, berada di bawah pembinaan dan tanggung jawab penuh <strong>Yayasan Al Hamid Hadum</strong>. Berdiri sejak tahun 2026, lembaga ini hadir sebagai perantara yang menghubungkan keinginan beramal dari masyarakat dengan kebutuhan santri dhuafa dan perbaikan prasarana pendidikan agama di lingkungan MDT Al Jihad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                <div className="absolute top-4 right-4 text-3xl opacity-25">🎯</div>
                <h3 className="font-bold text-[#114232] mb-2 font-sans tracking-wide">VISI UTAMA</h3>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "Menjadi lembaga pengelola zakat, infak, sedekah, dan wakaf yang amanah, profesional, transparan, serta terpercaya, guna mendukung kemajuan pendidikan agama."
                </p>
              </div>

              <div className="bg-[#f9faf9] border-l-4 border-[#114232] p-5 rounded-2xl relative shadow-sm">
                <div className="absolute top-4 right-4 text-3xl opacity-25">📜</div>
                <h3 className="font-bold text-[#114232] mb-2 font-sans tracking-wide text-xs uppercase">MISI LEMBAGA</h3>
                <ul className="text-[10px] text-gray-600 space-y-1 list-decimal pl-4 leading-relaxed">
                  <li>Menghimpun dana sosial sesuai syariat Islam.</li>
                  <li>Mengelola keuangan terpisah antar tiap jenis dana.</li>
                  <li>Penyaluran tepat sasaran & tepat waktu.</li>
                  <li>Mendukung kelancaran pengembangan sarana MDT Al Jihad.</li>
                  <li>Meningkatkan kepedulian umat akan keutamaan sedekah & wakaf.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card right: Profil details */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#87A922] to-[#114232] rounded-3xl p-6 space-y-6 text-white shadow-soft relative overflow-hidden">
            <h3 className="text-lg font-bold text-white border-b border-white/20 pb-3 block">Info Lembaga</h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="flex gap-3">
                <MapPin className="text-[#FCDC2A] h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/70 block font-bold mb-0.5">Alamat Lengkap</span>
                  <p className="text-white leading-relaxed">
                    Kp. Bantarjati RT.02 RW.08, Desa Bagendit, Kecamatan Banyuresmi, Kabupaten Garut, Jawa Barat
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="text-[#FCDC2A] h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/70 block font-bold mb-0.5">Layanan Hubungi</span>
                  <a href="tel:08211857851" className="text-[#FCDC2A] font-semibold hover:underline">08211857851 (Wa Resmi)</a>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="text-[#FCDC2A] h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/70 block font-bold mb-0.5">Surat Elektronik</span>
                  <a href="mailto:mdtaljihad2026@gmail.com" className="text-[#FCDC2A] font-semibold hover:underline font-mono">mdtaljihad2026@gmail.com</a>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-[#FCDC2A] h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/70 block font-bold mb-0.5">MDT Pembina</span>
                  <span className="text-white">Yayasan Al Hamid Hadum (Berdiri 2026)</span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 border border-white/10 text-[11px] leading-relaxed text-[#FCDC2A] text-center">
              "Kekayaan sejati bukanlah melimpahnya harta materi, melainkan hati yang terus mengalirkan kebermanfaatan."<br/>
              <strong className="block mt-1">— Slogan Amanah LAZ Al Jihad</strong>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: REALISASI KAS TRANSPARAN --- */}
        <section id="realisasi_kas" className="bg-white rounded-3xl p-6 md:p-8 space-y-6 scroll-mt-24 shadow-soft border border-gray-200 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleExportPublicReport}
              className="px-4 py-2 bg-[#114232] hover:bg-[#0a2e22] rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={12} className="text-[#FCDC2A]" />
              Unduh CSV Transparansi
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#87A922] uppercase font-bold">Papan Realisasi Dana</span>
            <h2 className="text-xl md:text-2xl font-black text-[#114232] flex items-center gap-2">
              Akuntabilitas Kas Keuangan Terbuka
            </h2>
            <p className="text-xs text-gray-500">
              Anggaran dihitung secara otomatis dari jurnal transaksi terverifikasi bendahara madrasah.
            </p>
          </div>

          {/* Tiga Box Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Box 1: Dana Masuk */}
            <div className="bg-[#f9faf9] p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">Total Dana Masuk</span>
                <span className="text-2xl font-extrabold text-[#114232] block tracking-tight">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Zakat, Infak, Sedekah & Wakaf</span>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <TrendingUp className="text-[#114232] h-6 w-6" />
              </div>
            </div>

            {/* Box 2: Penyaluran / Keluar */}
            <div className="bg-[#f9faf9] p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">Penyaluran Realisasi</span>
                <span className="text-2xl font-extrabold text-[#87A922] block tracking-tight">
                  Rp {totalRealized.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">Hanya penyaluran disetujui Ketua</span>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <TrendingDown className="text-[#87A922] h-6 w-6" />
              </div>
            </div>

            {/* Box 3: Saldo */}
            <div className="bg-[#FCDC2A]/15 p-6 rounded-2xl border-2 border-[#FCDC2A]/30 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-mono text-[#114232] uppercase tracking-wider block mb-1">Sisa Saldo Kas</span>
                <span className="text-2xl font-black text-[#114232] block tracking-tight">
                  Rp {currentSaldo.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-gray-600 block mt-1">Saldo tersedia di rekening</span>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center border border-yellow-200 select-none">
                <span className="text-amber-700 font-black text-lg">Rp</span>
              </div>
            </div>
          </div>

          {/* Two-column layout: Absorption Ratio + Live Incoming Donations list */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Left Column: absorption stats */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-bold">Rasio Penyerapan Manfaat Dana</span>
                  <span className="font-mono text-[#114232] font-black bg-yellow-300/40 px-2 py-0.5 rounded text-xs">
                    {totalIncome > 0 ? ((totalRealized / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#114232] to-[#87A922] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${totalIncome > 0 ? Math.min(100, (totalRealized / totalIncome) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  *Rasio penyerapan menunjukkan seberapa cepat dan efisien donasi dari muzakki tersalurkan langsung kepada mustahik yang membutuhkan. Target kami adalah konsisten di atas 80% per tahun.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                <span>Diperbarui: Real-Time</span>
                <span className="text-[#114232] font-bold">LAZ AL JIHAD</span>
              </div>
            </div>

            {/* Right Column: Real-time donor listing list */}
            <div id="donatur_list" className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-xs font-extrabold text-[#114232] flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    Amanah Donasi & Kas Masuk Terbaru
                  </h3>
                  <p className="text-[10px] text-gray-400">Tercatat real-time otomatis penuh untuk kemaslahatan umat</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold text-[9px]">
                  {incomingFunds.length} Transaksi
                </span>
              </div>

              <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {incomingFunds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-1.5">
                    <span className="text-2xl">👦🏻💚</span>
                    <p className="text-[11px] text-gray-500 font-medium">Belum ada donasi masuk tercatat untuk tahun ini.</p>
                    <a 
                      href="#donasi_fast"
                      className="text-[9px] text-white bg-[#114232] px-3 py-1 rounded-full font-bold hover:bg-[#87A922] transition cursor-pointer"
                    >
                      Mulai Donasi Pertama Anda
                    </a>
                  </div>
                ) : (
                  [...incomingFunds].reverse().map((fund) => (
                    <div 
                      key={fund.id} 
                      className="p-2.5 bg-gray-50 hover:bg-emerald-50/25 border border-gray-100 hover:border-emerald-100/50 rounded-xl transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Cutie person/boy is islamic mascot theme */}
                        <div className="h-7 w-7 rounded-full bg-emerald-50 border border-emerald-100/60 flex items-center justify-center flex-shrink-0 text-sm">
                          {fund.type === 'Zakat Fitrah' || fund.type === 'Zakat Maal' ? '👳‍♂️' : '👦🏻'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-gray-800 truncate text-[11px]" title={fund.donorName}>
                              {fund.donorName}
                            </h4>
                            <span className={`inline-block px-1 rounded-[4px] text-[8px] font-bold ${
                              fund.type === 'Sedekah' 
                                ? 'bg-green-500/10 text-green-700'
                                : fund.type === 'Infak'
                                  ? 'bg-[#114232]/10 text-[#114232]'
                                  : fund.type === 'Zakat Fitrah' || fund.type === 'Zakat Maal'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-150 text-gray-700'
                            }`}>
                              {fund.type}
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">
                            {fund.date} • {fund.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                        <span className="font-black text-[#114232] block text-[11px]">
                          Rp {fund.amount.toLocaleString('id-ID')}
                        </span>
                        <button
                          onClick={() => setActiveReceipt(fund)}
                          className="p-1 hover:bg-white border border-gray-100 hover:border-gray-200 text-[#114232] hover:text-[#87A922] rounded-md transition cursor-pointer"
                          title="Lihat Kuitansi Penyerapan Digital"
                        >
                          <Printer size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: PROGRAM PROGRAM SEDANG BERJALAN --- */}
        <section id="programs_panel" className="space-y-6 scroll-mt-24">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#87A922] uppercase font-bold">Kemaslahatan Sosial</span>
            <h2 className="text-2xl font-extrabold text-[#114232]">Program Pembinaan Aktif</h2>
            <p className="text-xs text-gray-500">
              Berikut adalah peta kerja dan realisasi pencapaian anggaran program kerja LAZ MDT Al Jihad tahun ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog) => {
              const collectedPct = Math.min(100, Math.round((prog.raisedBudget / prog.targetBudget) * 100));
              return (
                <div 
                  key={prog.id} 
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col hover:shadow-soft transition duration-300 group shadow-sm"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={prog.imageUrl} 
                      alt={prog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-gray-100 text-[10px] font-bold text-[#114232] py-1 px-2.5 rounded-full">
                      {prog.id}
                    </div>
                    {/* Status badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        prog.status === 'Completed' 
                          ? 'bg-[#114232] text-white' 
                          : prog.status === 'In Progress' 
                            ? 'bg-[#87A922] text-white' 
                            : 'bg-gray-200 text-gray-700'
                      }`}>
                        {prog.status === 'Completed' ? 'Selesai' : prog.status === 'In Progress' ? 'Aktif' : 'Terencana'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#114232] group-hover:text-[#87A922] transition-colors">
                        {prog.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                        {prog.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {/* Budget stats */}
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-gray-400">Target:</span>
                        <span className="font-bold text-gray-800">Rp {prog.targetBudget.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-gray-400">Terkumpul:</span>
                        <span className="font-bold text-[#114232]">Rp {prog.raisedBudget.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-gray-400">Teralokasi:</span>
                        <span className="font-bold text-amber-600">Rp {prog.allocatedBudget.toLocaleString('id-ID')}</span>
                      </div>

                      {/* Bar indicator */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>Progress Himpun</span>
                          <span className="font-bold">{collectedPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#114232] h-full rounded-full" 
                            style={{ width: `${collectedPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- SECTION 4: AREA DONASI CEPAT & FORMULIR --- */}
        <section id="donasi_kilat" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
          
          {/* Form container */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-soft relative border border-gray-200">
            <div className="absolute top-0 right-0 h-24 w-24 bg-[#114232]/5 rounded-full filter blur-xl pointer-events-none"></div>
            
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-[#FCDC2A]/15 text-amber-900 border border-[#FCDC2A]/35 text-[10px] font-mono rounded-full uppercase tracking-wider font-bold">
                Amal Jariah Instan
              </span>
              <h3 className="text-xl font-black text-[#114232] flex items-center gap-2">
                <Heart size={18} className="text-[#87A922] fill-[#87A922]/20" />
                Kemitraan Donasi Kilat Online
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tunaikan kewajiban Zakat atau perluas ladang amal Infak, Sedekah, dan Wakaf Sahabat secara instan dan amanah.
              </p>
            </div>

            <form onSubmit={handleDonationSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-bold font-sans">Nama Donatur / Muzakki</label>
                  <input 
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Contoh: H. Akbar Nugraha (Kosongkan jika Anonim)"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-bold font-sans">No. WhatsApp Aktif</label>
                  <input 
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="Contoh: 0812XXXXXXXX (Untuk tanda terima)"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-bold font-sans">Kategori Dana</label>
                  <select 
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value as FundType)}
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 focus:outline-[#114232] focus:outline-1 transition cursor-pointer"
                  >
                    <option value="Sedekah">Sedekah Jariah</option>
                    <option value="Infak">Infak Pembinaan MDT</option>
                    <option value="Zakat Fitrah">Zakat Fitrah RAMADHAN</option>
                    <option value="Zakat Maal">Zakat Maal (Tabungan/Emas)</option>
                    <option value="Wakaf">Wakaf Meja Rihal Santri</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-bold font-sans">Metode Penyaluran Mock</label>
                  <select 
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 focus:outline-[#114232] focus:outline-1 transition cursor-pointer"
                  >
                    <option value="Transfer BRI">Transfer BANK BRI - Rekening Resmi LAZ</option>
                    <option value="QRIS Al Jihad">E-Wallet QRIS Masjid Al Jihad Garut</option>
                    <option value="Tunai">Serah Terima Tunai Amil LAZ</option>
                  </select>
                </div>
              </div>

              {/* Amount selectors */}
              <div className="space-y-2">
                <label className="text-gray-700 font-bold font-sans block">Nominal Donasi</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => { setDonationAmount(amt); setCustomAmountStr(''); }}
                      className={`py-2 rounded-xl font-mono text-center transition border cursor-pointer select-none text-xs ${
                        donationAmount === amt && !customAmountStr
                          ? 'bg-[#114232] border-[#114232] text-white font-black'
                          : 'bg-gray-50 border-gray-200 hover:border-[#114232]/30 text-gray-700 hover:text-[#114232]'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000} Juta` : `${amt / 1000}K`}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <input 
                    type="number"
                    value={customAmountStr}
                    onChange={(e) => setCustomAmountStr(e.target.value)}
                    placeholder="Atau ketik sendiri nominal khusus Rp... (misal: 350000)"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 font-mono text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#114232] hover:bg-[#0a2e22] text-white font-extrabold rounded-xl transition shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer border-b-4 border-[#87A922]"
              >
                <Sparkles size={16} />
                Lunas Berdonasi & Terbitkan Tanda Terima
              </button>
            </form>
          </div>

          {/* Quick info right side */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#114232] to-[#0a2e22] rounded-3xl p-6 flex flex-col justify-between space-y-6 text-white border-b-4 border-[#FCDC2A] shadow-soft">
            <h3 className="font-bold text-white border-b border-white/20 pb-3 flex items-center gap-2">
              <Download size={16} className="text-[#FCDC2A]" />
              Simulasi Transfer Amal
            </h3>

            <div className="space-y-4 text-xs">
              <p className="text-white/80 leading-relaxed">
                Sahabat yang mentransfer via online, silakan salurkan ke rekening unit resmi di bawah naungan Yayasan Al Hamid Hadum:
              </p>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-white/60 text-[10px]">Nama Bank:</span>
                  <span className="font-bold text-[#FCDC2A] text-xs">BANK BRI</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-white/60 text-[10px]">No. Rekening:</span>
                  <span className="font-bold text-white text-sm tracking-widest bg-black/25 px-2 py-0.5 rounded">4157-01-064388-53-4</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-white/60 text-[10px]">Atas Nama:</span>
                  <span className="font-bold text-neutral-200 text-[11px] block">MDT AL JIHAD</span>
                </div>
              </div>

              {/* QR Code Placeholder Graphic in pure stylized tailwind */}
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 flex items-center gap-4">
                <div className="h-20 w-20 bg-white p-1 rounded-lg flex-shrink-0 flex items-center justify-center relative group">
                  {/* Stylized QR patterns using pure blocks */}
                  <div className="grid grid-cols-4 gap-1 h-full w-full">
                    <div className="bg-black"></div>
                    <div className="bg-black"></div>
                    <div className="bg-neutral-100"></div>
                    <div className="bg-black"></div>
                    
                    <div className="bg-neutral-100"></div>
                    <div className="bg-black"></div>
                    <div className="bg-black"></div>
                    <div className="bg-neutral-100"></div>
                    
                    <div className="bg-black"></div>
                    <div className="bg-neutral-100"></div>
                    <div className="bg-neutral-100"></div>
                    <div className="bg-black"></div>
                    
                    <div className="bg-black"></div>
                    <div className="bg-black font-extrabold text-[8px] flex items-center justify-center text-white">LAZ</div>
                    <div className="bg-black"></div>
                    <div className="bg-black"></div>
                  </div>
                  {/* Callout focus overlay */}
                  <div className="absolute inset-0 bg-[#07140e]/95 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center p-1 text-[9px] text-[#FCDC2A] text-center font-bold font-mono">
                    MOCK QRIS ACTIVE
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-white block">QRIS Masjid Al Jihad Garut</span>
                  <span className="text-[10px] text-white/70 block leading-relaxed">
                    Scan via GoPay, OVO, Dana, LinkAja, atau Mobile Banking apa saja. Bebas biaya admin.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-[11px] leading-relaxed text-neutral-200">
              🎒 <strong>Kenapa berdonasi di sini?</strong> Setiap rupiah dijamin teralokasi langsung. Bendahara kami terikat audit riwayat perubahan transaksi yang diawasi langsung oleh Dewan Pembina Yayasan Al Hamid.
            </div>
          </div>
        </section>

        {/* --- SECTION 5: ADUAN / LAPORAN KOMUNITAS --- */}
        <section id="pengaduan_panel" className="bg-white rounded-3xl p-6 md:p-8 space-y-6 scroll-mt-24 shadow-soft border border-gray-200 border-t-4 border-t-[#FCDC2A]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#87A922] uppercase font-bold">Saluran Transparansi</span>
            <h2 className="text-xl md:text-2xl font-black text-[#114232] flex items-center gap-2">
              <MessageSquare size={20} className="text-[#87A922]" />
              Fasilitas Pengaduan & Aspirasi Publik
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Kami percaya transparansi penuh adalah kunci amanah. Tulis pengaduan, masukan, atau usulan penerima manfaat di sini. Hubungan langsung akan terjalin via sistem chat WhatsApp kami.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Left */}
            <form onSubmit={handleComplaintSubmit} className="lg:col-span-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-750 font-bold block">Nama Pelapor</label>
                <input 
                  type="text"
                  disabled={compAnon}
                  value={compAnon ? 'Hamba Allah' : compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Ketik nama (Atau centang Anonim bwh)"
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-750 font-bold block">Nomor HP/WA Aktif</label>
                <input 
                  type="tel"
                  value={compPhone}
                  onChange={(e) => setCompPhone(e.target.value)}
                  placeholder="Contoh: 08XXXXXXXX"
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-750 font-bold block">Ringkasan Masalah / Judul</label>
                <input 
                  type="text"
                  required
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  placeholder="Contoh: Usulan mustahik jompo baru di RT 02"
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-750 font-bold block">Detail Pengaduan & Aspirasi</label>
                <textarea 
                  required
                  value={compContent}
                  onChange={(e) => setCompContent(e.target.value)}
                  rows={4}
                  placeholder="Assalamu’alaikum, saya ingin melaporkan bahwasanya..."
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] p-2.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-[#114232] focus:outline-1 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 select-none">
                <input 
                  type="checkbox"
                  id="anon_chk"
                  checked={compAnon}
                  onChange={(e) => setCompAnon(e.target.checked)}
                  className="h-4 w-4 bg-white rounded border-gray-300 text-[#114232] accent-[#114232] cursor-pointer"
                />
                <label htmlFor="anon_chk" className="text-xs text-gray-600 cursor-pointer">
                  Kirimkan sebagai <strong>Hamba Allah (Anonim)</strong>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer border-b-4 border-emerald-700"
              >
                <Phone size={14} className="text-white" />
                Kirim Aduan & Sambung ke WhatsApp Admin
              </button>
            </form>

            {/* List Right */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-mono text-[#87A922] uppercase tracking-widest block font-bold mb-1">
                Tanggapan & Hasil Aduan Warga
              </span>

              {complaints.length === 0 ? (
                <div className="bg-[#f9faf9] p-6 rounded-2xl text-center border border-gray-100">
                  <p className="text-gray-400 text-xs">Belum ada riwayat pengaduan publik yang dipublikasi.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {complaints.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="bg-[#f9faf9] p-4 rounded-2xl border border-gray-100 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[#114232] font-extrabold text-xs block mb-0.5">
                            {comp.title}
                          </span>
                          <span className="text-[10px] text-gray-450 font-mono block">
                            Oleh: {comp.reporterName} • {comp.date}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold py-0.5 px-2.5 rounded-full ${
                          comp.status === 'Resolved' 
                            ? 'bg-[#114232]/10 text-[#114232] border border-[#114232]/10' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {comp.status === 'Resolved' ? 'Ditindaklanjuti' : 'Diterima Amil'}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 leading-relaxed italic bg-white p-2.5 rounded-xl border border-gray-50">
                        "{comp.content}"
                      </p>

                      {comp.response && (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 space-y-1 ml-4 shadow-inner">
                          <span className="text-[10px] font-bold text-[#114232] block">
                            ✓ Selesai - Tanggapan Pengurus Amil Al Jihad ({comp.responseDate}):
                          </span>
                          <p className="text-[10px] text-gray-700 leading-relaxed font-sans">
                            {comp.response}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- SECTION 6: GALERI KEGIATAN & DOCUMENTATION --- */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#87A922] uppercase font-bold">Bukti Kegiatan Nyata</span>
            <h2 className="text-2xl font-black text-[#114232] flex items-center gap-2">
              <ImageIcon size={20} className="text-[#87A922]" />
              Galeri Dokumentasi Amanah
            </h2>
            <p className="text-xs text-gray-500">
              Dokumentasi nyata penyaluran bantuan langsung dari lingkungan Desa Bagendit Banyuresmi Garut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 group shadow-soft">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400" 
                  alt="serah terima bantuan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-[#87A922] font-mono font-bold">11 Juni 2026</span>
                <h4 className="font-extrabold text-xs text-[#114232]">Insentif Bulanan & Transport Guru Al Jihad</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Penyaluran berkala gaji dukungan untuk 5 asatidzah madrasah diniyyah takmiliyyah.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 group shadow-soft">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400" 
                  alt="serah terima meja"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-[#87A922] font-mono font-bold">13 Juni 2026</span>
                <h4 className="font-extrabold text-xs text-[#114232]">Pemasangan 15 Rihal Meja Belajar Jati Baru</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Santri dapat belajar Al-Quran dengan tatanan ergonomis dan nyaman, dibiayai dana Wakaf.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 group shadow-soft">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400" 
                  alt="santunan yatim"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-[#87A922] font-mono font-bold">16 Juni 2026</span>
                <h4 className="font-extrabold text-xs text-[#114232]">Santunan Pendidikan Santri Yatim Bagendit</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Bantuan perlengkapan jinjing sekolah dan uang tunai jajan santri yatim dhuafa.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-emerald-950 bg-[#040C08] py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <span className="font-bold text-neutral-300 block">© 2026 LAZ MDT AL JIHAD</span>
            <span className="text-[10px] block text-neutral-500">
              Kp. Bantarjati Desa Bagendit, Kecamatan Banyuresmi, Kabupaten Garut. Naungan Yayasan Al Hamid Hadum.
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-emerald-800/80">Sistem Digital Transparansi 2.5 — Garut</span>
          </div>
        </div>
      </footer>

      {/* --- RECEIPT MODAL POPUP --- */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1c14] border-2 border-[#E6C280]/80 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative font-mono text-xs">
            {/* Seal image decoration */}
            <div className="absolute top-4 right-4 text-emerald-800/20 text-7xl select-none pointer-events-none">🕌</div>
            
            <div className="text-center space-y-2">
              <span className="text-lg block tracking-widest font-bold text-[#E6C280]">KUITANSI RESMI</span>
              <span className="text-xs block text-neutral-400 -mt-1 block uppercase">LAZ MDT AL JIHAD GARUT</span>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            <div className="space-y-3 bg-neutral-950 p-5 rounded-2xl border border-emerald-950/60">
              <div className="flex justify-between">
                <span className="text-neutral-500">No. Kuitansi:</span>
                <span className="font-bold text-white">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tanggal Transaksi:</span>
                <span className="text-neutral-200">{activeReceipt.date}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-950 pt-2">
                <span className="text-neutral-500">Donatur / Pembayar:</span>
                <span className="font-bold text-emerald-400 text-right">{activeReceipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kategori Penunaian:</span>
                <span className="font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block">{activeReceipt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ket. Pembayaran:</span>
                <span className="text-neutral-300 text-right italic">{activeReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode Bayar:</span>
                <span className="text-neutral-200">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-950 pt-3 text-sm">
                <span className="text-neutral-500 font-bold">JUMLAH (IDR):</span>
                <span className="font-extrabold text-[#E6C280] text-base">
                  Rp {activeReceipt.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#05140f] p-4 rounded-xl border border-emerald-900/20 text-[10px] text-neutral-400 leading-relaxed leading-relaxed">
              <div>
                <span className="font-bold text-neutral-300 block mb-1">✓ Status: SUKSES (TERCATAT)</span>
                Amanah donasi yang Sahabat percayakan telah secara langsung masuk ke dalam buku kas digital LAZ Al Jihad Garut. Jazakumullah Khairan Katsiran!
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { window.print(); }}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-emerald-800 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer size={14} />
                Cetak / Simpan PDF
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
