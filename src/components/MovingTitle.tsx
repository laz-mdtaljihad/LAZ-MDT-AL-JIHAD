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
          🌙 LAZ MDT AL JIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          SESUAI SYARIAT • AMANAH • TRANSPARAN • AKUNTABEL • TEPAT SASARAN
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          UNIT DI BAWAH YAYASAN AL HAMID HADUM
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
        <span className="mx-4 text-xs font-mono font-bold tracking-widest text-[#FCDC2A] uppercase flex items-center gap-2" aria-hidden="true">
          🌙 LAZ MDT AL JIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          SESUAI SYARIAT • AMANAH • TRANSPARAN • AKUNTABEL • TEPAT SASARAN
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          UNIT DI BAWAH YAYASAN AL HAMID HADUM
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
        <span className="mx-4 text-xs font-mono font-bold tracking-widest text-[#FCDC2A] uppercase flex items-center gap-2" aria-hidden="true">
          🌙 LAZ MDT AL JIHAD BANYURESMI GARUT
          <span className="h-2 w-2 rounded-full bg-[#87A922] inline-block animate-pulse"></span>
          SESUAI SYARIAT • AMANAH • TRANSPARAN • AKUNTABEL • TEPAT SASARAN
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          UNIT DI BAWAH YAYASAN AL HAMID HADUM
          <span className="h-2 w-2 rounded-full bg-[#FCDC2A] inline-block"></span>
        </span>
      </div>
    </div>
  );
};

export const PulseTitle: React.FC = () => {
  return (
    <div className="text-center py-8 select-none">
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
        <span className="inline-block animate-pulse-glow bg-gradient-to-r from-[#114232] via-[#87A922] to-[#b8860b] bg-clip-text text-transparent font-sans uppercase">
          LAZ MDT AL JIHAD
        </span>
      </h1>
      <p className="text-[#1a3c34]/80 text-xs font-mono tracking-widest uppercase font-semibold">
        Lembaga Amil Zakat, Infak & Sedekah — Garut, Jawa Barat
      </p>
    </div>
  );
};

