import React, { useState } from 'react';
import { RaporSantri, Santri } from '../../types';
import { Plus, Edit2, Trash2, FileCheck2, Award } from 'lucide-react';

interface AdminRaporViewProps {
  raporList: RaporSantri[];
  santriList: Santri[];
  onAddRapor: (rapor: Omit<RaporSantri, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateRapor: (id: string, rapor: Partial<RaporSantri>) => Promise<void>;
  onDeleteRapor: (id: string) => Promise<void>;
}

export const AdminRaporView: React.FC<AdminRaporViewProps> = ({
  raporList,
  santriList,
  onAddRapor,
  onUpdateRapor,
  onDeleteRapor,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRapor, setEditingRapor] = useState<RaporSantri | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [santriName, setSantriName] = useState('');
  const [kelas, setKelas] = useState('Kelas 1 Ula');
  const [semester, setSemester] = useState('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [akhlak, setAkhlak] = useState<'Mumtaz' | 'Jayyid' | 'Maqbul'>('Mumtaz');
  const [kehadiran, setKehadiran] = useState<number>(95);
  const [catatanUstadz, setCatatanUstadz] = useState('');

  // Grades object
  const [nilaiAlquran, setNilaiAlquran] = useState<number>(88);
  const [nilaiAqidah, setNilaiAqidah] = useState<number>(90);
  const [nilaiFiqih, setNilaiFiqih] = useState<number>(85);
  const [nilaiSki, setNilaiSki] = useState<number>(87);
  const [nilaiBahasaArab, setNilaiBahasaArab] = useState<number>(82);
  const [nilaiTajwid, setNilaiTajwid] = useState<number>(92);
  const [nilaiPraktekSholat, setNilaiPraktekSholat] = useState<number>(95);

  const handleSelectSantriChange = (selectedNis: string) => {
    setNis(selectedNis);
    const found = santriList.find(s => s.nis === selectedNis);
    if (found) {
      setSantriName(found.name);
      setKelas(found.kelas);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRapor(null);
    if (santriList.length > 0) {
      setNis(santriList[0].nis);
      setSantriName(santriList[0].name);
      setKelas(santriList[0].kelas);
    } else {
      setNis('');
      setSantriName('');
      setKelas('');
    }
    setSemester('Ganjil');
    setTahunAjaran('2025/2026');
    setAkhlak('Mumtaz');
    setKehadiran(95);
    setCatatanUstadz('Santri sangat rajin dan aktif mengaji kitab kuning.');
    setNilaiAlquran(88);
    setNilaiAqidah(90);
    setNilaiFiqih(85);
    setNilaiSki(87);
    setNilaiBahasaArab(82);
    setNilaiTajwid(92);
    setNilaiPraktekSholat(95);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rapor: RaporSantri) => {
    setEditingRapor(rapor);
    setNis(rapor.nis);
    setSantriName(rapor.santriName);
    setKelas(rapor.kelas);
    setSemester(rapor.semester);
    setTahunAjaran(rapor.tahunAjaran);
    setAkhlak(rapor.akhlak);
    setKehadiran(rapor.kehadiran);
    setCatatanUstadz(rapor.catatanUstadz);

    setNilaiAlquran(rapor.nilai["Al-Qur'an Hadits"] || 85);
    setNilaiAqidah(rapor.nilai["Aqidah Akhlaq"] || 85);
    setNilaiFiqih(rapor.nilai["Fiqih Ibadah"] || 85);
    setNilaiSki(rapor.nilai["Sejarah Kebudayaan Islam"] || 85);
    setNilaiBahasaArab(rapor.nilai["Bahasa Arab Diniyah"] || 85);
    setNilaiTajwid(rapor.nilai["Tajwid & Tahsin"] || 85);
    setNilaiPraktekSholat(rapor.nilai["Praktek Sholat & Wudhu"] || 85);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !santriName) return;

    const nilaiObj = {
      "Al-Qur'an Hadits": Number(nilaiAlquran),
      "Aqidah Akhlaq": Number(nilaiAqidah),
      "Fiqih Ibadah": Number(nilaiFiqih),
      "Sejarah Kebudayaan Islam": Number(nilaiSki),
      "Bahasa Arab Diniyah": Number(nilaiBahasaArab),
      "Tajwid & Tahsin": Number(nilaiTajwid),
      "Praktek Sholat & Wudhu": Number(nilaiPraktekSholat),
    };

    if (editingRapor) {
      await onUpdateRapor(editingRapor.id, {
        nis,
        santriName,
        kelas,
        semester,
        tahunAjaran,
        nilai: nilaiObj,
        catatanUstadz,
        akhlak,
        kehadiran,
      });
    } else {
      await onAddRapor({
        nis,
        santriName,
        kelas,
        semester,
        tahunAjaran,
        nilai: nilaiObj,
        catatanUstadz,
        akhlak,
        kehadiran,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-[#114232]">Input & Penerbitan Rapor Digital Santri</h3>
          <p className="text-xs text-gray-500">Isi penilaian 7 mata pelajaran SOP Kemenag RI, presensi KBM, dan catatan wali kelas.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#114232] hover:bg-[#0a2e22] text-[#FCDC2A] font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus size={14} />
          Terbitkan Rapor Santri
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {raporList.map((rapor) => {
          const subjects = Object.entries(rapor.nilai);
          const avg = (subjects.reduce((sum, [, val]) => sum + Number(val), 0) / (subjects.length || 1)).toFixed(1);

          return (
            <div key={rapor.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#87A922] uppercase block">
                      NIS: {rapor.nis} • {rapor.kelas}
                    </span>
                    <h4 className="font-black text-lg text-[#114232]">{rapor.santriName}</h4>
                    <span className="text-xs text-gray-400 font-mono block">Semester {rapor.semester} ({rapor.tahunAjaran})</span>
                  </div>
                  <div className="text-right bg-[#114232] text-[#FCDC2A] px-3 py-1.5 rounded-xl font-mono">
                    <span className="text-[9px] block uppercase text-white/80">Rata-Rata</span>
                    <span className="text-lg font-black">{avg}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#f9faf9] p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 text-[10px]">Akhlak & Adab:</span>
                    <span className="font-bold text-emerald-800 block">{rapor.akhlak}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Kehadiran KBM:</span>
                    <span className="font-bold text-[#114232] block">{rapor.kehadiran}%</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  "{rapor.catatanUstadz}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEditModal(rapor)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit Nilai
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus rapor santri ${rapor.santriName}?`)) {
                      onDeleteRapor(rapor.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form Add/Edit Rapor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-[#114232] w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#114232]">
                {editingRapor ? 'Edit Nilai Rapor Santri' : 'Input Rapor Santri Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Pilih Santri Terdaftar</label>
                  <select
                    value={nis}
                    onChange={(e) => handleSelectSantriChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl font-bold text-gray-800 focus:outline-[#114232]"
                  >
                    {santriList.map(s => (
                      <option key={s.id} value={s.nis}>{s.name} (NIS: {s.nis})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Tahun Ajaran & Semester</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tahunAjaran}
                      onChange={(e) => setTahunAjaran(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                    />
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rincian 7 Nilai Mapel SOP Kemenag */}
              <div className="space-y-2 bg-[#f9faf9] p-4 rounded-2xl border border-gray-200">
                <span className="font-extrabold text-[#114232] block">Penilaian 7 Mata Pelajaran Diniyah (0 - 100)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-0.5">1. Al-Qur'an & Hadits</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiAlquran}
                      onChange={(e) => setNilaiAlquran(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">2. Aqidah Akhlaq</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiAqidah}
                      onChange={(e) => setNilaiAqidah(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">3. Fiqih Ibadah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiFiqih}
                      onChange={(e) => setNilaiFiqih(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">4. Sejarah Kebudayaan Islam</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiSki}
                      onChange={(e) => setNilaiSki(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">5. Bahasa Arab Diniyah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiBahasaArab}
                      onChange={(e) => setNilaiBahasaArab(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-0.5">6. Tajwid & Tahsin</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiTajwid}
                      onChange={(e) => setNilaiTajwid(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-600 mb-0.5">7. Praktek Sholat & Thoharah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nilaiPraktekSholat}
                      onChange={(e) => setNilaiPraktekSholat(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Predikat Akhlak</label>
                  <select
                    value={akhlak}
                    onChange={(e) => setAkhlak(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="Mumtaz">Mumtaz (Sangat Baik)</option>
                    <option value="Jayyid">Jayyid (Baik)</option>
                    <option value="Maqbul">Maqbul (Cukup)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Kehadiran KBM (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={kehadiran}
                    onChange={(e) => setKehadiran(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl font-mono focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Catatan Wali Kelas / Ustadz</label>
                <textarea
                  rows={2}
                  value={catatanUstadz}
                  onChange={(e) => setCatatanUstadz(e.target.value)}
                  placeholder="Apresiasi dan saran motivasi santri..."
                  className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#114232] hover:bg-[#0a2e22] text-[#FCDC2A] font-bold rounded-xl cursor-pointer"
                >
                  {editingRapor ? 'Simpan Perubahan' : 'Terbitkan Rapor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
