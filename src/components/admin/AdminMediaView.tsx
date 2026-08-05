import React, { useState } from 'react';
import { LearningMedia } from '../../types';
import { Plus, Edit2, Trash2, BookOpen, Video, FileText } from 'lucide-react';

interface AdminMediaViewProps {
  learningMediaList: LearningMedia[];
  onAddMedia: (media: Omit<LearningMedia, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateMedia: (id: string, media: Partial<LearningMedia>) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
}

export const AdminMediaView: React.FC<AdminMediaViewProps> = ({
  learningMediaList,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<LearningMedia | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [kategori, setKategori] = useState('Fiqih');
  const [pengarang, setPengarang] = useState('Syaikh Salim bin Samir Al-Hadhrami');
  const [description, setDescription] = useState('');
  const [jenjangTarget, setJenjangTarget] = useState('Ula');
  const [mediaType, setMediaType] = useState<'kitab' | 'video' | 'pdf'>('kitab');
  const [matanArab, setMatanArab] = useState('');
  const [terjemahan, setTerjemahan] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleOpenAddModal = () => {
    setEditingMedia(null);
    setTitle('');
    setKategori('Fiqih');
    setPengarang('Syaikh Salim bin Samir Al-Hadhrami');
    setDescription('');
    setJenjangTarget('Ula');
    setMediaType('kitab');
    setMatanArab('');
    setTerjemahan('');
    setRingkasan('');
    setFileUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (media: LearningMedia) => {
    setEditingMedia(media);
    setTitle(media.title);
    setKategori(media.kategori);
    setPengarang(media.pengarang);
    setDescription(media.description);
    setJenjangTarget(media.jenjangTarget);
    setMediaType(media.mediaType);
    setMatanArab(media.matanArab || '');
    setTerjemahan(media.terjemahan || '');
    setRingkasan(media.ringkasan || '');
    setFileUrl(media.fileUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pengarang || !description) return;

    if (editingMedia) {
      await onUpdateMedia(editingMedia.id, {
        title,
        kategori,
        pengarang,
        description,
        jenjangTarget,
        mediaType,
        matanArab,
        terjemahan,
        ringkasan,
        fileUrl,
      });
    } else {
      await onAddMedia({
        title,
        kategori,
        pengarang,
        description,
        jenjangTarget,
        mediaType,
        matanArab,
        terjemahan,
        ringkasan,
        fileUrl,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-[#114232]">Kelola Media Ajar & E-Kitab Kuning MDT</h3>
          <p className="text-xs text-gray-500">Unggah matan Arab, terjemahan Indonesia, ringkasan Fiqih/Aqidah, dan URL video tutorial KBM.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#114232] hover:bg-[#0a2e22] text-[#FCDC2A] font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus size={14} />
          Tambah Kitab / Video Ajar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningMediaList.map((media) => (
          <div key={media.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-soft flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  {media.kategori} • {media.mediaType.toUpperCase()}
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-bold">Target: {media.jenjangTarget}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-[#114232]">{media.title}</h4>
                <span className="text-xs text-gray-500 font-semibold block">Pengarang: {media.pengarang}</span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{media.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleOpenEditModal(media)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus media ${media.title}?`)) {
                    onDeleteMedia(media.id);
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

      {/* Modal Form Add/Edit Media */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-[#114232] w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#114232]">
                {editingMedia ? 'Edit Media Ajar' : 'Input Kitab / Media Ajar Baru'}
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
                  <label className="block text-gray-700 font-bold mb-1">Judul Kitab / Modul</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kitab Safinatun Najah"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Pengarang / Mu'allif</label>
                  <input
                    type="text"
                    required
                    value={pengarang}
                    onChange={(e) => setPengarang(e.target.value)}
                    placeholder="Syaikh Salim bin Samir"
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Kategori Pelajaran</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="Fiqih">Fiqih Ibadah</option>
                    <option value="Aqidah">Aqidah & Tauhid</option>
                    <option value="Tajwid">Tajwid & Qur'an</option>
                    <option value="Bahasa Arab">Bahasa Arab</option>
                    <option value="SKI">Sejarah Islam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Jenjang Target</label>
                  <select
                    value={jenjangTarget}
                    onChange={(e) => setJenjangTarget(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="Ula">Diniyah Ula</option>
                    <option value="Wustha">Diniyah Wustha</option>
                    <option value="Ulya">Diniyah Ulya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Format Media</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  >
                    <option value="kitab">E-Kitab Kuning</option>
                    <option value="video">Video Pembelajaran</option>
                    <option value="pdf">Dokumen PDF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Deskripsi Singkat / Pengantar</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan isi kitab dan materi pembelajaran..."
                  className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232] resize-none"
                />
              </div>

              {mediaType === 'kitab' && (
                <div className="space-y-3 bg-[#f9faf9] p-4 rounded-2xl border border-gray-200">
                  <div>
                    <label className="block text-[#114232] font-bold mb-1">Matan Teks Bahasa Arab</label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={matanArab}
                      onChange={(e) => setMatanArab(e.target.value)}
                      placeholder="Ketik / Paste teks Arab matan kitab..."
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-xl font-serif text-sm focus:outline-[#114232] text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-[#114232] font-bold mb-1">Terjemahan Indonesia</label>
                    <textarea
                      rows={2}
                      value={terjemahan}
                      onChange={(e) => setTerjemahan(e.target.value)}
                      placeholder="Terjemahan Indonesia matan kitab..."
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232] resize-none"
                    />
                  </div>
                </div>
              )}

              {mediaType === 'video' && (
                <div>
                  <label className="block text-gray-700 font-bold mb-1">URL Video Pembelajaran (mp4 / YouTube)</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl focus:outline-[#114232]"
                  />
                </div>
              )}

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
                  {editingMedia ? 'Simpan Perubahan' : 'Tambah Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
