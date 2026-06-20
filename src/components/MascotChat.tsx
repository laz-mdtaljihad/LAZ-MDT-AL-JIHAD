/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { MessageSquare, X, Send, Sparkles, HelpCircle } from 'lucide-react';

export const MascotChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Assalamu’alaikum Wr. Wb. Sahabat Al Jihad! 👦🏻💚 Berjumpa dengan Jihad, petugas amil humas cilik Al Jihad yang lucu dan menggemaskan. \n\nJihad siap siaga menerangkan seputar zakat, infak, sedekah, maupun penyaluran dana sosial keagamaan yang amanah di lingkungan Desa Bagendit, Banyuresmi Garut. Ada yang bisa kita diskusikan saat ini, Sahabat?",
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBubblePrompt, setShowBubblePrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Hide the initial callout bubble after some time or when opened
  useEffect(() => {
    if (isOpen) {
      setShowBubblePrompt(false);
    }
  }, [isOpen]);

  const presetQuestions = [
    "Berapa besaran zakat fitrah?",
    "Apa aturan Zakat Maal?",
    "Ke mana dana disalurkan?",
    "Bagaimana cara berdonasi?",
    "Dimana alamat kantor LAZ?"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi satelit asisten Jihad');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const assistantMsg: Message = {
        role: 'assistant',
        content: "Aduh sahabat Al Jihad, jembatan nirkabel Jihad agak tersendat rintangan nih. Tapi sebagai amil yang amanah, Jihad tetap tersenyum ramah! 😊💚\n\nSahabat bisa langsung menanyakan atau melaporkan ke admin yayasan kami di WhatsApp **08211857851** ya!",
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Little Callout speech prompt bubble when closed */}
      {showBubblePrompt && !isOpen && (
        <div className="mb-3 bg-white border-2 border-[#114232] text-gray-800 py-2.5 px-4 rounded-2xl rounded-br-none shadow-2xl max-w-xs text-xs relative animate-bounce font-sans text-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowBubblePrompt(false); }}
            className="absolute -top-1.5 -left-1.5 p-0.5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 cursor-pointer"
          >
            <X size={10} />
          </button>
          <span>Tanya zakat & infak ke <strong>Jihad si Amil Cilik Lucu</strong> yuk! 👦🏻💚</span>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen 
            ? 'bg-gray-800 border-2 border-[#114232] text-white' 
            : 'bg-[#114232] hover:bg-[#0a2e22] border-2 border-[#FCDC2A] text-white'
        }`}
        title="Tanya Jihad (Asisten Amil)"
      >
        {isOpen ? (
          <X size={26} className="text-[#FCDC2A]" />
        ) : (
          <div className="relative">
            {/* Styled interactive cartoon graphics of Amil Kid drawing */}
            <span className="text-3xl" role="img" aria-label="amil">👦🏻</span>
            {/* Miniature Peci indicator overlay */}
            <span className="absolute -top-2 right-1.5 text-xs bg-neutral-900 border border-[#87A922] text-[8px] px-1 rounded font-mono font-bold leading-none text-[#FCDC2A]">PECI</span>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCDC2A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[360px] md:w-[420px] h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans border-t-4 border-t-[#FCDC2A]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#114232] via-[#0a2e22] to-gray-900 p-4 border-b border-[#114232]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#114232] border-2 border-[#FCDC2A] flex items-center justify-center text-2xl relative">
                👦🏻
                {/* Micro gold ring decoration */}
                <div className="absolute -top-1 -right-0.5 bg-neutral-900 text-[6px] text-[#FCDC2A] border border-[#87A922] px-0.5 rounded leading-none font-bold">PECI</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white">Jihad</h4>
                  <span className="inline-block px-1.5 py-0.5 bg-[#FCDC2A]/20 text-[#FCDC2A] border border-[#FCDC2A]/30 rounded text-[9px] font-bold tracking-wide">
                    Penjaga Amanah
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span>Amil Otomatis Al Jihad</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
            {/* Watermark in background */}
            <div className="absolute inset-x-0 top-1/4 opacity-[0.03] flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-9xl font-sans">👦🏻</span>
              <span className="text-xs font-mono tracking-widest font-bold mt-2">MDT AL JIHAD</span>
            </div>

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5 px-1 font-mono">
                  <span>{msg.role === 'user' ? 'Sahabat' : 'Jihad'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#114232] text-white rounded-tr-none border border-[#114232] font-medium'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-150 hover:border-[#114232]/25 transition-colors font-medium'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Chatbot Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1 font-mono">
                  <span>Jihad sedang berpikir...</span>
                </div>
                <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 shadow-xs">
                  <div className="w-2 h-2 bg-[#114232] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#87A922] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#114232] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts / Chips */}
          <div className="p-2 bg-slate-50 border-t border-gray-150">
            <div className="text-[10px] text-gray-400 px-2 pb-1.5 font-mono flex items-center gap-1">
              <HelpCircle size={10} className="text-[#87A922]" />
              <span>Pertanyaan umum siap jawab:</span>
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 px-1 scrollbar-hide">
              {presetQuestions.map((q, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(q)}
                  className="flex-shrink-0 text-[11px] bg-white hover:bg-gray-100 border border-gray-200 hover:border-[#114232]/50 text-[#114232] px-2.5 py-1.5 rounded-full transition cursor-pointer select-none font-bold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan ke Jihad..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#114232] text-sm py-2 px-3.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-[#114232] hover:bg-[#0a2e22] disabled:bg-gray-100 text-[#FCDC2A] disabled:text-gray-400 rounded-xl transition flex-shrink-0 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
