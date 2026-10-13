import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Flame, 
  Crown,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PEPE_AVATARS, 
  PepeAvatar, 
  getPepeAvatarUrl 
} from '../../../data/pepeAvatars';

interface PepeAvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  isEn?: boolean;
}

export const PepeAvatarPickerModal: React.FC<PepeAvatarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
  isEn = false
}) => {
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');
  const [previewAvatar, setPreviewAvatar] = useState<PepeAvatar>(() => {
    return PEPE_AVATARS.find(a => a.id === selectedAvatarId) || PEPE_AVATARS[0];
  });

  if (!isOpen) return null;

  const filteredAvatars = PEPE_AVATARS.filter(a => {
    if (filter === 'male') return a.gender === 'male';
    if (filter === 'female') return a.gender === 'female';
    return true;
  });

  const handlePick = (avatar: PepeAvatar) => {
    setPreviewAvatar(avatar);
    onSelectAvatar(avatar.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#090C15]/95 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-400" />

          {/* Modal Header */}
          <div className="p-6 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isEn ? 'Institutional Pepe Identity' : 'Identidad Institucional Pepe'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                    10 Avatares
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {isEn ? 'Select your verified avatar persona for the Eklipse trading desk.' : 'Elige tu avatar oficial para la terminal y mesa de fondeo.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-none">
            
            {/* Filter Tabs & Preview Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              
              {/* Active Preview Mini Card */}
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-14 h-14 rounded-2xl p-1 shrink-0 relative overflow-hidden flex items-center justify-center bg-black/40 border transition-all duration-300"
                  style={{
                    borderColor: previewAvatar.accentColor,
                    boxShadow: `0 0 20px ${previewAvatar.glowColor}`
                  }}
                >
                  <img 
                    src={getPepeAvatarUrl(previewAvatar)} 
                    alt={previewAvatar.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{previewAvatar.name}</span>
                    <span 
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{ 
                        backgroundColor: `${previewAvatar.accentColor}20`,
                        color: previewAvatar.accentColor
                      }}
                    >
                      {previewAvatar.rarity}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{previewAvatar.title}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5 max-w-sm line-clamp-1">{previewAvatar.description}</div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/8 font-mono text-xs self-start sm:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    filter === 'all' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isEn ? 'All (10)' : 'Todos (10)'}
                </button>
                <button
                  onClick={() => setFilter('male')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    filter === 'male' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isEn ? 'Chicos (7)' : 'Chicos (7)'}
                </button>
                <button
                  onClick={() => setFilter('female')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    filter === 'female' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isEn ? 'Damas (3)' : 'Damas (3)'}
                </button>
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                const isPreview = previewAvatar.id === avatar.id;

                return (
                  <button
                    key={avatar.id}
                    onClick={() => handlePick(avatar)}
                    onMouseEnter={() => setPreviewAvatar(avatar)}
                    className={`group relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-2.5 overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/15 via-[#0E1322] to-black/90 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                        : isPreview
                        ? 'bg-white/[0.06] border-white/20 shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Avatar Image Pod */}
                    <div 
                      className="w-20 h-20 rounded-2xl p-1 relative overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                      style={{
                        filter: isSelected ? `drop-shadow(0 0 12px ${avatar.glowColor})` : 'none'
                      }}
                    >
                      <img 
                        src={getPepeAvatarUrl(avatar)} 
                        alt={avatar.name} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    {/* Avatar Label */}
                    <div className="w-full">
                      <div className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                        {avatar.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {avatar.title}
                      </div>
                    </div>

                    {/* Gender & Rarity Pill */}
                    <div className="flex items-center gap-1">
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        avatar.gender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {avatar.gender === 'female' ? (isEn ? 'LADY' : 'DAMA') : 'PEPE'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cloudflare Hosting Note */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/8 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{isEn ? 'Storage: Cloudflare R2 / Images Ready' : 'Almacenamiento: Listo para Cloudflare R2 / CDN'}</span>
              </div>
              <span className="text-[10px] text-slate-500">
                VITE_CLOUDFLARE_AVATARS_CDN
              </span>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/8 bg-[#07090F] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {isEn ? 'Avatar saves instantly to your profile.' : 'El avatar se guarda al instante en tu perfil.'}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-400/20 cursor-pointer"
            >
              {isEn ? 'Done' : 'Listo'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
