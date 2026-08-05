import React, { useState } from 'react';
import { Asatidzah } from '../../types';
import { Plus, Edit2, Trash2, Search, Award } from 'lucide-react';

interface AdminAsatidzahViewProps {
  asatidzahList: Asatidzah[];
  onAddAsatidzah: (ustadz: Omit<Asatidzah, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAsatidzah: (id: string, ustadz: Partial<Asatidzah>) => Promise<void>;
  onDeleteAsatidzah: (id: string) => Promise<void>;
}

export const AdminAsatidzahView: React.FC<AdminAsatidzahViewProps> = ({
  asatidzahList,
  onAddAsatidzah,
  onUpdateAsatidzah,
  onDeleteAsatidzah,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUst, setEditingUst] = useState<Asatidzah | null>(null);

  // Form states
  const [npk, setNpk] = useState('');
  const [name, setName] = useState('');
  const [jabatan, setJabatan] = useState('Guru Pengajar');
  const [mataPelajaran, setMataPelajaran] = useState('Fiqih Ibadah & Safinatun Najah');
  const [pendidikan, setPendidikan] = useState('Alumni Pondok Pesantren');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Non-Aktif'>('Aktif');

  const handleOpenAddModal = () => {
    setEditingUst(null);
    setNpk(`NPK-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setJabatan('Guru Pengajar Kitab Kuning');
    setMataPelajaran('Fiqih Ibadah & Safinatun Najah');
    setPendidikan('Alumni Ponpes');
    setPhone('');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ust: Asatidzah) => {
    setEditingUst(ust);
    setNpk(ust.npk);
    setName(ust.name);
    setJabatan(ust.jabatan);
    setMataPelajaran(ust.mataPelajaran);
    setPendidikan(ust.pendidikan);
    setPhone(ust.phone);
    setStatus(ust.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !npk || !mataPelajaran) return;

    if (editingUst) {
      await onUpdateAsatidzah(editingUst.id, {
        npk,
        name,
        jabatan,
        mataPelajaran,
        pendidikan,
        phone,
        status,
      });
    } else {
      await onAddAsatidzah({
        npk,
        name,
        jabatan,
        mataPelajaran,
        pendidikan,
        phone,
        status,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-[#114232]">Manajemen Dewan Asatidzah / Pengajar MDT</h3>
          <p className="text-xs text-gray-500">Kelola direktori Ustadz, Ustadzah, NPK, mata pelajaran diampu, dan kualifikasi alumni.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Cari NPK / Nama Ustadz..."
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
            Tambah Pengajar Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {asatidzahList
          .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.npk.includes(searchTerm))
          .map((ust) => (
            <div key={ust.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#114232] to-[#87A922] text-[#FCDC2A] font-bold text-lg flex items-center justify-center">
                      👳‍♂️
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#87A922] uppercase block">NPK: {ust.npk}</span>
                      <h4 className="font-extrabold text-sm text-[#114232]">{ust.name}</h4>
                      <span className="text-xs text-emerald-700 font-semibold block">{ust.jabatan}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ust.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {ust.status}
                  </span>
                </div>

                <div className="bg-[#f9faf9] p-3.5 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] font-mono block">Mata Pelajaran Diampu:</span>
                    <span className="font-bold text-gray-800">{ust.mataPelajaran}</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200/60">
                    <span className="text-gray-400 text-[10px] font-mono block">Kualifikasi Alumni:</span>
                    <span className="font-medium text-emerald-900">{ust.pendidikan}</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200/60">
                    <span className="text-gray-400 text-[10px] font-mono block">No. WA Kontak:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{ust.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEditModal(ust)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus pengajar ${ust.name}?`)) {
                      onDeleteAsatidzah(ust.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal Form Add/Edit Asatidzah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-[#114232] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#114232]">
                {editingUst ? 'Edit Pengajar' : 'Tambah Pengajar MDT Baru'}
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
                  <label className="block text-gray-700 font-bold mb-1">Nomor NPK Pengajar</label>
                  <input
                    type="text"
                    required
                    value={npk}
                    onChange={(e) => setNpk(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl font-mono focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nama Ustadz / Ustadzah</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ust. Ahmad Jalaluddin"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Jabatan di MDT</label>
                  <input
                    type="text"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Wali Kelas / Guru Kitab"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Mata Pelajaran Diampu</label>
                  <input
                    type="text"
                    required
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                    placeholder="Fiqih / Aqidah / Tajwid"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Latar Belakang Pendidikan / Alumni</label>
                  <input
                    type="text"
                    required
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    placeholder="Pesantren Alumni / S1 PAI"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08XXXXXXXX"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Status Keaktifan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                >
                  <option value="Aktif">Aktif Mengajar</option>
                  <option value="Cuti">Cuti Temporary</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
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
                  {editingUst ? 'Simpan Perubahan' : 'Tambah Pengajar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
