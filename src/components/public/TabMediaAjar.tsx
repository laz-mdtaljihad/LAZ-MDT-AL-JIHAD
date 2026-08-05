import React, { useState } from 'react';
import { LearningMedia } from '../../types';
import { BookOpen } from 'lucide-react';

interface TabMediaAjarProps {
  learningMediaList: LearningMedia[];
  onSelectKitab: (kitab: LearningMedia) => void;
}

export const TabMediaAjar: React.FC<TabMediaAjarProps> = ({
  learningMediaList,
  onSelectKitab,
}) => {
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState('ALL');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-[#114232] to-[#87A922] rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-md border-2 border-[#FCDC2A]/30">
        <span className="px-3 py-1 bg-[#FCDC2A] text-[#114232] font-mono font-bold text-[10px] rounded-full uppercase">
          Perpustakaan E-Kitab Digital
        </span>
        <h2 className="text-2xl md:text-3xl font-black">Media Ajar & Kitab Kuning MDT ALJIHAD</h2>
        <p className="text-xs md:text-sm text-neutral-100 max-w-2xl leading-relaxed">
          Akses teks matan Arab, terjemahan Indonesia, ringkasan hukum Fiqih, Aqidah, Tajwid, dan video tuntunan ibadah praktis bagi santri dan masyarakat.
        </p>

        {/* Category selector */}
        <div className="flex items-center gap-2 flex-wrap pt-3">
          {['ALL', 'Fiqih', 'Aqidah', 'Tajwid', 'Bahasa Arab', 'Video'].map((cat) => (
            <button
              key={cat}
              onClick={() => setMediaCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${mediaCategoryFilter === cat ? 'bg-[#FCDC2A] text-[#114232]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {cat === 'ALL' ? 'Semua Media' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningMediaList
          .filter(m => mediaCategoryFilter === 'ALL' || m.kategori === mediaCategoryFilter || (mediaCategoryFilter === 'Video' && m.mediaType === 'video'))
          .map((media) => (
            <div key={media.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 group shadow-soft flex flex-col justify-between hover:shadow-md transition">
              <div className="h-44 bg-emerald-950/20 relative overflow-hidden flex items-center justify-center p-4 text-center border-b border-gray-100">
                {media.thumbnailUrl ? (
                  <img src={media.thumbnailUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="space-y-1">
                    <span className="text-4xl block">📖</span>
                    <span className="text-[10px] font-mono font-bold text-[#114232] uppercase">{media.pengarang}</span>
                  </div>
                )}
                <span className="absolute top-3 right-3 px-2 py-1 bg-[#114232] text-[#FCDC2A] rounded-lg text-[9px] font-mono font-bold">
                  {media.kategori}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                    Jenjang: {media.jenjangTarget} • Pengarang: {media.pengarang}
                  </span>
                  <h4 className="font-extrabold text-base text-[#114232]">{media.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{media.description}</p>
                </div>

                <button
                  onClick={() => onSelectKitab(media)}
                  className="w-full py-2.5 bg-[#114232] hover:bg-[#0a2e22] text-[#FCDC2A] font-extrabold rounded-xl transition text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={14} />
                  Baca Kitab / Tonton Modul
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
