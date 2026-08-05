import React, { useState } from 'react';
import { Santri, Asatidzah, RaporSantri } from '../../types';
import { Users, Award, BookOpen, FileCheck2, Search } from 'lucide-react';

interface TabManajemenMDTProps {
  santriList: Santri[];
  asatidzahList: Asatidzah[];
  raporList: RaporSantri[];
}

export const TabManajemenMDT: React.FC<TabManajemenMDTProps> = ({
  santriList,
  asatidzahList,
  raporList,
}) => {
  const [mdtSubTab, setMdtSubTab] = useState<'santri' | 'asatidzah' | 'kurikulum' | 'rapor'>('santri');
  const [santriSearch, setSantriSearch] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<'ALL' | 'Ula' | 'Wustha' | 'Ulya'>('ALL');
  const [selectedRaporNis, setSelectedRaporNis] = useState('');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner SOP Kemenag */}
      <div className="bg-gradient-to-r from-[#114232] via-[#0e3829] to-[#87A922] rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-md relative overflow-hidden border-2 border-[#FCDC2A]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-[#FCDC2A] text-[#114232] font-mono font-black text-[10px] rounded-full uppercase tracking-wider">
              SOP KEMENAG RI • DINIYYAH TAKMILIYYAH
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Sistem Akademik & Manajemen Santri MDT ALJIHAD
            </h2>
            <p className="text-xs md:text-sm text-neutral-200 max-w-2xl leading-relaxed">
              Penyelenggaraan Diniyyah Takmiliyyah Ula & Wustha terstruktur mencakup administrasi santri, direktori asatidzah, jadwal KBM kitab kuning, serta publikasi rapor nilai santri digital.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-1 self-start md:self-center">
            <span className="text-2xl font-black text-[#FCDC2A] block">{santriList.length}</span>
            <span className="text-[10px] font-mono uppercase text-white/80 block">Santri Terdaftar</span>
          </div>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-white/15">
          <button
            onClick={() => setMdtSubTab('santri')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${mdtSubTab === 'santri' ? 'bg-[#FCDC2A] text-[#114232]' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Users size={14} />
            Direktori Santri ({santriList.length})
          </button>
          <button
            onClick={() => setMdtSubTab('asatidzah')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${mdtSubTab === 'asatidzah' ? 'bg-[#FCDC2A] text-[#114232]' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Award size={14} />
            Dewan Asatidzah ({asatidzahList.length})
          </button>
          <button
            onClick={() => setMdtSubTab('kurikulum')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${mdtSubTab === 'kurikulum' ? 'bg-[#FCDC2A] text-[#114232]' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <BookOpen size={14} />
            Kurikulum & Jadwal KBM
          </button>
          <button
            onClick={() => setMdtSubTab('rapor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${mdtSubTab === 'rapor' ? 'bg-[#FCDC2A] text-[#114232]' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <FileCheck2 size={14} />
            Cek Rapor Digital Santri
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Santri Directory */}
      {mdtSubTab === 'santri' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-soft border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#114232]">Daftar Santri MDT Al Jihad</h3>
              <p className="text-xs text-gray-500">Pencarian data santri berdasarkan NIS, Nama, atau Jenjang Diniyah.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input 
                  type="text"
                  placeholder="Cari Santri / NIS..."
                  value={santriSearch}
                  onChange={(e) => setSantriSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-[#114232]"
                />
              </div>
              <select
                value={jenjangFilter}
                onChange={(e) => setJenjangFilter(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-[#114232]"
              >
                <option value="ALL">Semua Jenjang</option>
                <option value="Ula">Diniyah Ula</option>
                <option value="Wustha">Diniyah Wustha</option>
                <option value="Ulya">Diniyah Ulya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {santriList
              .filter(s => {
                const matchSearch = s.name.toLowerCase().includes(santriSearch.toLowerCase()) || s.nis.includes(santriSearch);
                const matchJenjang = jenjangFilter === 'ALL' || s.jenjang === jenjangFilter;
                return matchSearch && matchJenjang;
              })
              .map((santri) => (
                <div key={santri.id} className="bg-[#f9faf9] border border-gray-200 hover:border-[#114232]/40 rounded-2xl p-5 space-y-4 transition shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#114232] text-[#FCDC2A] font-black text-lg flex items-center justify-center flex-shrink-0">
                      {santri.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-[#87A922] uppercase block">
                        NIS: {santri.nis} • {santri.kelas}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#114232] truncate">{santri.name}</h4>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 mt-1">
                        {santri.jenjang} ({santri.status})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100 font-sans">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wali Santri:</span>
                      <span className="font-bold text-gray-800">{santri.waliName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">No. Kontak Wali:</span>
                      <span className="font-mono text-emerald-700 font-semibold">{santri.waliPhone}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-400">Capaian Hafalan:</span>
                      <span className="font-bold text-[#114232]">{santri.hafalanTarget}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Dewan Asatidzah */}
      {mdtSubTab === 'asatidzah' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-soft border border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-[#114232]">Dewan Pengajar / Asatidzah MDT Al Jihad</h3>
            <p className="text-xs text-gray-500">Para Ustadz & Ustadzah pendidik akhlaq, Al-Qur'an, dan kitab kuning di MDT Al Jihad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {asatidzahList.map((ust) => (
              <div key={ust.id} className="bg-emerald-950/5 border border-emerald-900/10 hover:border-[#114232] rounded-2xl p-6 space-y-4 transition shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#114232] to-[#87A922] text-[#FCDC2A] font-black text-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    👳‍♂️
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#114232] uppercase block">
                      NPK: {ust.npk}
                    </span>
                    <h4 className="font-extrabold text-base text-[#114232]">{ust.name}</h4>
                    <span className="text-xs text-emerald-700 font-semibold block">{ust.jabatan}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-white p-3.5 rounded-xl border border-gray-200/80">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Mata Pelajaran Diampu:</span>
                    <span className="font-bold text-gray-800 block mt-0.5">{ust.mataPelajaran}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Latar Belakang / Alumni:</span>
                    <span className="text-xs text-emerald-900 font-semibold">{ust.pendidikan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Kurikulum & Jadwal */}
      {mdtSubTab === 'kurikulum' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-soft border border-gray-200">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#114232]">Kurikulum Diniyyah Takmiliyyah Kemenag RI</h3>
            <p className="text-xs text-gray-500">Struktur materi pembelajaran standar nasional MDT Kementerian Agama RI.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#f9faf9] p-6 rounded-2xl border border-gray-200 space-y-3">
              <span className="px-3 py-1 bg-[#114232] text-[#FCDC2A] font-mono font-bold text-[10px] rounded-full uppercase">
                MDT ULA (Usia 7-12 Tahun)
              </span>
              <h4 className="font-extrabold text-sm text-[#114232]">Mata Pelajaran Wajib Jenjang Ula</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li><strong>Al-Qur'an & Hadits:</strong> Tajwid Praktis, Hafalan Juz 30 & Hadits Arbain.</li>
                <li><strong>Aqidah Akhlaq:</strong> Kitab Aqidatul Awam & Akhlaqul Banin/Banat.</li>
                <li><strong>Fiqih Ibadah:</strong> Kitab Safinatun Najah (Praktek Wudhu, Sholat & Thoharah).</li>
                <li><strong>Sejarah Kebudayaan Islam (SKI):</strong> Sirah Nabawiyah Rasulullah SAW.</li>
                <li><strong>Bahasa Arab Diniyah:</strong> Mufradat & Dasar Percakapan Harian.</li>
              </ul>
            </div>

            <div className="bg-[#f9faf9] p-6 rounded-2xl border border-gray-200 space-y-3">
              <span className="px-3 py-1 bg-[#87A922] text-white font-mono font-bold text-[10px] rounded-full uppercase">
                MDT WUSTHA (Usia 13-15 Tahun)
              </span>
              <h4 className="font-extrabold text-sm text-[#114232]">Mata Pelajaran Wajib Jenjang Wustha</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li><strong>Al-Qur'an Hadits:</strong> Tafsir Jalalain ringkas & Ulumul Qur'an.</li>
                <li><strong>Fiqih & Ushul Fiqih:</strong> Kitab Fathul Qorib Al-Mujib & Taqrib.</li>
                <li><strong>Nahwu & Shorof:</strong> Kitab Jurumiyyah & Matan Bina.</li>
                <li><strong>Akhlaq Tasawuf:</strong> Kitab Ta'lim Muta'allim & Taisirul Kholaq.</li>
                <li><strong>Praktek Dakwah & Khotbah:</strong> Tahsin Tilawah & Khutbah Jumat.</li>
              </ul>
            </div>
          </div>

          {/* Jadwal KBM Table */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="font-extrabold text-sm text-[#114232]">Jadwal KBM Mingguan MDT Al Jihad (Senin - Sabtu)</h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#114232] text-[#FCDC2A] font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Hari</th>
                    <th className="p-3">Waktu KBM</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3">Kitab Pegangan</th>
                    <th className="p-3">Pengampu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Senin</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Fiqih Ibadah & Thoharah</td>
                    <td className="p-3 italic">Safinatun Najah</td>
                    <td className="p-3">Ust. Ahmad Jalaluddin</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Selasa</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Aqidah & Tauhid</td>
                    <td className="p-3 italic">Aqidatul Awam</td>
                    <td className="p-3">Ustadzah Siti Fatimah</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Rabu</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Tajwid & Tahsin Qur'an</td>
                    <td className="p-3 italic">Tuhfatul Athfal / Jazariyyah</td>
                    <td className="p-3">Ust. Muhammad Ridwan</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Kamis</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Bahasa Arab & Mufradat</td>
                    <td className="p-3 italic">Durusul Lughah</td>
                    <td className="p-3">Ust. Hasan Basri</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Jumat</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Sejarah Kebudayaan Islam</td>
                    <td className="p-3 italic">Khulashoh Nurul Yaqin</td>
                    <td className="p-3">Ust. Ahmad Jalaluddin</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#114232]">Sabtu</td>
                    <td className="p-3 font-mono">14.00 - 16.00 WIB</td>
                    <td className="p-3 font-semibold">Praktek Sholat & Setoran Hafalan</td>
                    <td className="p-3 italic">Juz 'Amma & Hadits</td>
                    <td className="p-3">Seluruh Dewan Asatidzah</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Portal Rapor Digital */}
      {mdtSubTab === 'rapor' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-soft border border-gray-200">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <span className="px-3 py-1 bg-emerald-100 text-[#114232] font-mono text-[10px] font-bold rounded-full uppercase">
              Pencarian Rapor Santri Digital
            </span>
            <h3 className="text-xl font-black text-[#114232]">Cek Hasil Penilaian Rapor MDT</h3>
            <p className="text-xs text-gray-500">Pilih nama santri atau ketik NIS untuk meninjau rapor semester santri.</p>
            
            <div className="flex gap-2">
              <select
                value={selectedRaporNis}
                onChange={(e) => setSelectedRaporNis(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 p-3 rounded-2xl text-xs focus:outline-[#114232] font-bold text-gray-800"
              >
                <option value="">-- Pilih Santri Terdaftar --</option>
                {santriList.map(s => (
                  <option key={s.id} value={s.nis}>{s.name} (NIS: {s.nis} - {s.kelas})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Selected Student Rapor */}
          {selectedRaporNis && (() => {
            const matchingRapor = raporList.find(r => r.nis === selectedRaporNis);
            const matchingSantri = santriList.find(s => s.nis === selectedRaporNis);

            if (!matchingRapor) {
              return (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-2 text-amber-900 text-xs">
                  <p className="font-bold">Rapor Digital belum diterbitkan untuk NIS {selectedRaporNis}.</p>
                  <p className="text-amber-700">Silakan hubungi Ustadz Wali Kelas / Pengurus MDT Al Jihad.</p>
                </div>
              );
            }

            const subjects = Object.entries(matchingRapor.nilai);
            const average = (subjects.reduce((sum, [, val]) => sum + Number(val), 0) / (subjects.length || 1)).toFixed(1);

            return (
              <div className="max-w-3xl mx-auto bg-[#f9faf9] border-2 border-[#114232] rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative">
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#87A922] uppercase block">
                      RAPOR HASIL BELAJAR MDT ALJIHAD GARUT
                    </span>
                    <h4 className="text-2xl font-black text-[#114232]">{matchingRapor.santriName}</h4>
                    <span className="text-xs font-mono text-gray-500 block mt-1">
                      NIS: {matchingRapor.nis} • Kelas: {matchingRapor.kelas} ({matchingSantri?.jenjang || 'Ula'})
                    </span>
                  </div>
                  <div className="text-right bg-[#114232] text-[#FCDC2A] p-3 rounded-2xl font-mono">
                    <span className="text-[9px] block uppercase text-white/80">Nilai Rata-Rata</span>
                    <span className="text-2xl font-black">{average}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-2xl border border-gray-200 font-sans">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Semester</span>
                    <span className="font-bold text-gray-800">{matchingRapor.semester}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Tahun Ajaran</span>
                    <span className="font-bold text-gray-800">{matchingRapor.tahunAjaran}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Predikat Akhlak</span>
                    <span className="font-extrabold text-emerald-700">{matchingRapor.akhlak}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Kehadiran KBM</span>
                    <span className="font-extrabold text-[#114232]">{matchingRapor.kehadiran}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-extrabold text-xs text-[#114232] uppercase font-mono">Rincian Nilai per Mata Pelajaran (Kemenag SOP)</h5>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#114232] text-white font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Mata Pelajaran</th>
                          <th className="p-3 text-center">Nilai Angka (0-100)</th>
                          <th className="p-3">Kualifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subjects.map(([subj, val]) => {
                          const numVal = Number(val);
                          return (
                            <tr key={subj} className="hover:bg-gray-50">
                              <td className="p-3 font-semibold text-gray-800">{subj}</td>
                              <td className="p-3 text-center font-bold font-mono text-emerald-800">{numVal}</td>
                              <td className="p-3 font-bold text-[11px]">
                                {numVal >= 90 ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Sangat Baik (Mumtaz)</span>
                                ) : numVal >= 80 ? (
                                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Baik (Jayyid)</span>
                                ) : (
                                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Cukup (Maqbul)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                  <span className="font-extrabold text-[#114232] block">Catatan Wali Kelas / Ustadz:</span>
                  <p className="text-gray-700 italic">"{matchingRapor.catatanUstadz}"</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
