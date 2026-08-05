/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const MovingTitle: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-3.5 bg-[#114232] border-y-4 border-[#FCDC2A] shadow-md">
      {/* Running/marquee ticker text along with gold glow */}
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="mx-4 text-xs font-mono font-bold tracking-widest text-[#FCDC2A] uppercase flex items-center gap-2">
          🌙 MADRASAH DINIYYAH TAKMILIYYAH (MDT) ALJIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          MANAJEMEN MDT • MEDIA AJAR DIGITAL • PANITIA PEMBANGUNAN • KAS KEUANGAN TERBUKA
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          STANDAR OPERASIONAL PROSEDUR (SOP) KEMENAG RI
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
        <span className="mx-4 text-xs font-mono font-bold tracking-widest text-[#FCDC2A] uppercase flex items-center gap-2" aria-hidden="true">
          🌙 MADRASAH DINIYYAH TAKMILIYYAH (MDT) ALJIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          MANAJEMEN MDT • MEDIA AJAR DIGITAL • PANITIA PEMBANGUNAN • KAS KEUANGAN TERBUKA
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          STANDAR OPERASIONAL PROSEDUR (SOP) KEMENAG RI
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
        <span className="mx-4 text-xs font-mono font-bold tracking-widest text-[#FCDC2A] uppercase flex items-center gap-2" aria-hidden="true">
          🌙 MADRASAH DINIYYAH TAKMILIYYAH (MDT) ALJIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          MANAJEMEN MDT • MEDIA AJAR DIGITAL • PANITIA PEMBANGUNAN • KAS KEUANGAN TERBUKA
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          STANDAR OPERASIONAL PROSEDUR (SOP) KEMENAG RI
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
      </div>
    </div>
  );
};

export const PulseTitle: React.FC = () => {
  return (
    <div className="text-center py-6 select-none">
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
        <span className="inline-block animate-pulse-glow bg-gradient-to-r from-[#114232] via-[#87A922] to-[#b8860b] bg-clip-text text-transparent font-sans uppercase">
          MDT ALJIHAD GARUT
        </span>
      </h1>
      <p className="text-[#1a3c34]/90 text-xs md:text-sm font-mono tracking-widest uppercase font-bold">
        Sistem Manajemen MDT, Media Ajar Kitab Digital, Panitia Pembangunan & Transparansi Kas Keuangan
      </p>
      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/10 border border-emerald-800/30 rounded-full text-[11px] font-mono text-emerald-900 font-semibold">
        <span>🕌 SOP Diniyah Takmiliyah Kemenag RI</span>
        <span>•</span>
        <span>Banyuresmi Garut</span>
      </div>
    </div>
  );
};

