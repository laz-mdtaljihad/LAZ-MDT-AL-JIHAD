/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("Waspada: GEMINI_API_KEY tidak dikonfigurasi. Chatbot akan berjalan dalam Mode Simulasi (Fallback lokal).");
    return null;
  }
  
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini client initialized successfully.");
    } catch (err) {
      console.error("Gagal menginisialisasi GoogleGenAI client:", err);
      return null;
    }
  }
  return aiClient;
}

/// System Instruction for Mascot "Jihad si Amil Cilik Lucu"
const SYSTEM_INSTRUCTION = `
Anda adalah asisten / maskot interaktif bernama "Jihad si Amil Cilik Lucu" dari lembaga LAZ MDT Al Jihad.
Berperandalah secara konsisten dengan karakteristik berikut:
- Wujud Anda: Petugas amil cilik / humas cilik Al Jihad yang berpakaian koko putih rapi, memakai peci (songkok) hitam, memiliki raut wajah yang lucu, imut, menggemaskan, dan ramah, serta mengalungkan selendang hijau-emas bertuliskan "LAZ MDT AL JIHAD" di bahu.
- Gaya Bicara: Sangat ramah, bersahabat, sopan, sedikit humoris tetapi tetap berwibawa, Islami, menggunakan bahasa Indonesia yang santun namun santai (cocok untuk seluruh golongan usia). Selalu gunakan kata panggilan "Sahabat" atau "Sahabat Al Jihad" untuk merujuk kepada pengguna.
- Salam Pembuka: Selalu mulai percakapan atau jawaban pertama Anda dengan salam Islami hangat, contoh: "Assalamu’alaikum wr. wb., Sahabat Al Jihad! Jihad si Amil Cilik Lucu & Menggemaskan siap membantu! 👦🏻💚" atau sejenisnya.
- Informasi Lembaga:
  - Nama Lembaga: Lembaga Amil Zakat, Infak dan Sedekah MDT Al Jihad (LAZ MDT Al Jihad).
  - Naungan: Unit pelaksana teknis di bawah Yayasan Al Hamid Hadum. Berdiri sejak tahun 2026.
  - Alamat: Kp. Bantarjati RT.02 RW.08, Desa Bagendit, Kecamatan Banyuresmi, Kabupaten Garut, Jawa Barat.
  - Kontak Resmi: WhatsApp Admins di nomor "08211857851", Email "mdtaljihad2026@gmail.com".
  - Visi: Menjadi lembaga pengelola zakat, infak, sedekah, dan wakaf yang amanah, profesional, transparan, serta terpercaya demi mendukung pendidikan agama dan kesejahteraan sosial.
  - Penyaluran Dana: Dana disalurkan untuk operasional guru mengajar MDT Al Jihad (asatidzah), santunan yatim piatu dhuafa di Desa Bagendit Banyuresmi Garut, pengadaan sarana bangku belajar mengajar santri, renovasi masjid/sekolah, serta modal kerja mikro kelompok dhuafa kecil.
- Pengetahuan Syariah (Panduan Singkat):
  - Zakat Fitrah: Kewajiban setiap jiwa di bulan Ramadhan. Besaran standarnya adalah 2.5 kg atau 3.5 liter beras berkualitas baik, atau disetarakan dengan uang tunai (sekitar Rp 40.000 s/d Rp 45.000 per jiwa sesuai harga pasar daerah Garut).
  - Zakat Maal (Harta): Ditunaikan ketika harta (seperti emas, tabungan, perniagaan) telah mencapai nishob (setara 85 gram emas) dan haul (1 tahun kepemilikan). Tarifnya adalah 2.5%.
  - Infak & Sedekah: Amalan sunnah sukarela tanpa batas jumlah dan waktu untuk mendukung kesejahteraan santri dan dhuafa.
  - Wakaf: Menyerahkan harta yang tahan lama (seperti tanah, bangunan, meja belajar) untuk kemaslahatan umat dengan pahala yang terus mengalir tanpa terputus.
- Penanganan Masalah Khusus:
  - Jika Anda tidak tahu jawabannya, katakan dengan rendah hati: "Aduh maaf sekali Sahabat, sebagai amil cilik yang masih belajar, Jihad belum mengetahui jawaban atas pertanyaan itu. Tapi jangan khawatir, Sahabat bisa mengajukan aduan atau bertanya langsung ke admin yayasan kami di WhatsApp 08211857851 ya! Atau ajukan lewat tombol Menu Pengaduan di atas! 👦🏻📞"
`;

// Local simulation Q&A bank in case Gemini API is not configured (demo fallback)
function getSimulatedChatbotResponse(userInput: string): string {
  const query = userInput.toLowerCase();
  
  if (query.includes("zakat fitrah")) {
    return "Assalamu’alaikum wr. wb. Sahabat Al Jihad! 👦🏻 Berdasarkan ketentuan syariah di daerah Garut, besaran zakat fitrah adalah 2,5 kg atau 3,5 liter beras per jiwa. Jika disetarakan dengan uang tunai, jumlahnya bermuara sekitar Rp 40.000 s/d Rp 45.000. Jihad yang imut siap menjaga amanah zakat sahabat!";
  }
  if (query.includes("zakat maal") || query.includes("zakat harta")) {
    return "Assalamu’alaikum wr. wb. Sahabat Al Jihad! 👦🏻 Zakat Maal adalah zakat atas harta yang kita miliki jika sudah mencapai nishab (setara harga 85 gram emas) dan sudah tersimpan selama 1 tahun (haul). Besaran zakatnya adalah 2,5% dari total harta tabungan, emas, atau aset dagang Sahabat. Jihad bisa bantu hitungkan kalau perlu!";
  }
  if (query.includes("zakat") && !query.includes("fitrah")) {
    return "Assalamu’alaikum wr. wb., Sahabat! 👦🏻 Zakat terbagi dua utama: Zakat Fitrah (pembersih diri di bulan Ramadhan) dan Zakat Maal (zakat atas harta kekayaan). Menunaikan zakat di LAZ MDT Al Jihad dijamin dikelola transparan dan disalurkan ke asatidzah serta 8 asnaf berhak di Banyuresmi Garut!";
  }
  if (query.includes("saluran") || query.includes("dana disalurkan") || query.includes("ke mana") || query.includes("kemana")) {
    return "Assalamu’alaikum wr. wb., Sahabat! 👦🏻 Dana amanah zakat, infak, sedekah, dan wakaf yang kami himpun disalurkan secara terukur untuk: \n1. Operasional guru-guru mengajar MDT Al Jihad (Insentif asatidzah).\n2. Santunan beasiswa yatim piatu berprestasi dhuafa di Desa Bagendit.\n3. Pengadaan meja belajar santri serta renovasi kelas.\n4. Bantuan modal usaha mikro dhuafa keliling. \nTiap rupiah tercatat rapi pada laporan keuangan!";
  }
  if (query.includes("donasi") || query.includes("cara berdonasi") || query.includes("cara donas")) {
    return "Assalamu’alaikum, Sahabat Al Jihad! 👦🏻 Caranya sangat mudah sekalee! Sahabat bisa langsung isi Formulir Donasi Cepat di halaman utama aplikasi kami, pilih jenis dana (Zakat/Infak/Sedekah/Wakaf), lalu transfer melalui BANK BRI (rekening resmi atas nama MDT AL JIHAD) ke nomor rekening operasional kami, atau serahkan tunai langsung ke kantor LAZ. Bukti donasi langsung tercatat!";
  }
  if (query.includes("lokasi") || query.includes("alamat") || query.includes("dimana") || query.includes("di mana") || query.includes("kantor")) {
    return "Assalamu’alaikum wr. wb. Sahabat! Kantor LAZ MDT Al Jihad beralamat lengkap di Kp. Bantarjati RT.02 RW.08, Desa Bagendit, Kecamatan Banyuresmi, Kabupaten Garut, Jawa Barat 44162 (Di bawah Yayasan Al Hamid Hadum). Mampir ya sahabat, nanti kita silaturahmi bareng Jihad! 👦🏻🌸";
  }
  if (query.includes("visi") || query.includes("misi") || query.includes("profil") || query.includes("tentang")) {
    return "Assalamu’alaikum! LAZ MDT Al Jihad didirikan tahun 2026 di bawah naungan Yayasan Al Hamid Hadum. Visi kami adalah menjadi amil zakat yang amanah, profesional, dan 100% transparan, menghubungkan kemuliaan donatur dengan kebutuhan santri dan warga dhuafa di Banyuresmi. Kami terapkan pisah kas zakat demi kehati-hatian syariah! 👦🏻✨";
  }
  if (query.includes("kontak") || query.includes("no") || query.includes("nomor") || query.includes("admin") || query.includes("wa") || query.includes("whatsapp")) {
    return "Assalamu’alaikum, Sahabat! Hubungi tim admin kami di WhatsApp 08211857851 atau kirim surat elektronik ke mdtaljihad2026@gmail.com. Kami selalu senang mendengar amanah dan kolaborasi dari Sahabat! 👦🏻📱";
  }

  return "Assalamu’alaikum wr. wb., Sahabat Al Jihad! 👦🏻 Jihad si Amil Cilik Lucu & Menggemaskan dengan peci hitam siap siaga menjaga amanah umat. Maaf sekali sahabat, Jihad belum begitu mengerti pertanyaan itu. Sobat bisa bertanya seputar zakat fitrah, alamat kami, cara berdonasi, visi misi kami, atau langsung klik tombol menu pengaduan untuk terhubung ke nomor WA admin yayasan di 08211857851 ya!";
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // REST API for Mascot AI chat
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Kolom pesan (message) harus diisi" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Falls back to local smart mock answers
      const responseText = getSimulatedChatbotResponse(message);
      return res.json({ text: responseText, source: "simulation_fallback" });
    }

    try {
      // Setup message structure mapping historical context
      const parts = [
        { text: `Pertanyaan dari User: ${message}` }
      ];

      // Query Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          topP: 0.9,
        }
      });

      const responseText = response.text || "Aduh sahabat, sinyal Jihad agak lambat. Bisa kamu ulangi? 🐢";
      return res.json({ text: responseText, source: "gemini_api" });
    } catch (err: any) {
      console.error("Kesalahan API Gemini: ", err);
      // Failure resilient response
      const fallbackText = getSimulatedChatbotResponse(message);
      return res.json({ 
        text: fallbackText + "\n\n*(Catatan: Maaf sahabat, layanan satelit asisten cerdas terhambat gangguan teknis, Jihad beralih ke memori cadangan!)*", 
        source: "error_fallback" 
      });
    }
  });

  // Configure Vite integration for SPA fallback
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🚀 LAZ MDT Al Jihad Server running on http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer().catch((err) => {
  console.error("Gagal memulai server LAZ MDT Al Jihad:", err);
});
