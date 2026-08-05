import React, { useState } from 'react';
import { Santri } from '../../types';
import { Plus, Edit2, Trash2, Search, UserCheck, Shield } from 'lucide-react';

interface AdminSantriViewProps {
  santriList: Santri[];
  onAddSantri: (santri: Omit<Santri, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateSantri: (id: string, santri: Partial<Santri>) => Promise<void>;
  onDeleteSantri: (id: string) => Promise<void>;
}

export const AdminSantriView: React.FC<AdminSantriViewProps> = ({
  santriList,
  onAddSantri,
  onUpdateSantri,
  onDeleteSantri,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [jenjang, setJenjang] = useState<'Ula' | 'Wustha' | 'Ulya'>('Ula');
  const [kelas, setKelas] = useState('Kelas 1 Ula');
  const [waliName, setWaliName] = useState('');
  const [waliPhone, setWaliPhone] = useState('');
  const [hafalanTarget, setHafalanTarget] = useState('Juz 30 (Surah An-Naba)');
  const [status, setStatus] = useState<'Aktif' | 'Lulus' | 'Mutasi'>('Aktif');

  const handleOpenAddModal = () => {
    setEditingSantri(null);
    setNis(`NIS-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setJenjang('Ula');
    setKelas('Kelas 1 Ula');
    setWaliName('');
    setWaliPhone('');
    setHafalanTarget('Juz 30 (Surah An-Naba)');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (santri: Santri) => {
    setEditingSantri(santri);
    setNis(santri.nis);
    setName(santri.name);
    setJenjang(santri.jenjang);
    setKelas(santri.kelas);
    setWaliName(santri.waliName);
    setWaliPhone(santri.waliPhone);
    setHafalanTarget(santri.hafalanTarget);
    setStatus(santri.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nis || !waliName) return;

    if (editingSantri) {
      await onUpdateSantri(editingSantri.id, {
        nis,
        name,
        jenjang,
        kelas,
        waliName,
        waliPhone,
        hafalanTarget,
        status,
      });
    } else {
      await onAddSantri({
        nis,
        name,
        jenjang,
        kelas,
        waliName,
        waliPhone,
        hafalanTarget,
        status,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-[#114232]">Manajemen Data Santri MDT ALJIHAD</h3>
          <p className="text-xs text-gray-500">Kelola induk santri, NIS, kelas Diniyah, wali santri, dan target hafalan.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Cari NIS / Nama Santri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-[#114232]"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#114232] hover:bg-[#0a2e22] text-[#FCDC2A] font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            Tambah Santri Baru
          </button>
        </div>
      </div>

      {/* Table Santri */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#114232] text-[#FCDC2A] font-mono text-[10px]">
              <tr>
                <th className="p-3.5">NIS & Nama Santri</th>
                <th className="p-3.5">Jenjang & Kelas</th>
                <th className="p-3.5">Wali Santri & Kontak</th>
                <th className="p-3.5">Target Hafalan</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {santriList
                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm))
                .map((santri) => (
                  <tr key={santri.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{santri.name}</div>
                      <div className="text-[10px] font-mono text-[#87A922] font-semibold">{santri.nis}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#114232]">{santri.kelas}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">Diniyah {santri.jenjang}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-800">{santri.waliName}</div>
                      <div className="text-[10px] font-mono text-emerald-700">{santri.waliPhone}</div>
                    </td>
                    <td className="p-3.5 font-medium text-gray-700">{santri.hafalanTarget}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        santri.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {santri.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(santri)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Data Santri"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data santri ${santri.name}?`)) {
                              onDeleteSantri(santri.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Santri"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Add/Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-[#114232] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#114232]">
                {editingSantri ? 'Edit Data Santri' : 'Input Santri Baru MDT'}
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
                  <label className="block text-gray-700 font-bold mb-1">Nomor Induk Santri (NIS)</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl font-mono focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Santri"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Jenjang Diniyah</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="Ula">Diniyah Ula (Usia 7-12 thn)</option>
                    <option value="Wustha">Diniyah Wustha (Usia 13-15 thn)</option>
                    <option value="Ulya">Diniyah Ulya (Usia 16-18 thn)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Tingkat Kelas</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: Kelas 1 Ula"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nama Wali Santri</label>
                  <input
                    type="text"
                    required
                    value={waliName}
                    onChange={(e) => setWaliName(e.target.value)}
                    placeholder="Nama Ayah/Ibu/Wali"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">No. WhatsApp Wali</label>
                  <input
                    type="tel"
                    required
                    value={waliPhone}
                    onChange={(e) => setWaliPhone(e.target.value)}
                    placeholder="08XXXXXXXX"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Target Capaian Hafalan</label>
                  <input
                    type="text"
                    value={hafalanTarget}
                    onChange={(e) => setHafalanTarget(e.target.value)}
                    placeholder="Juz 30 / Hadits Arbain"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Status Keaktifan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Mutasi">Mutasi / Pindah</option>
                  </select>
                </div>
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
                  {editingSantri ? 'Simpan Perubahan' : 'Tambah Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
