import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, LogOut, Repeat, X, SlidersHorizontal, BookOpen, ListFilter, Check, 
  ChevronDown, ChevronRight, User, Globe, CheckCircle2, Settings, Edit3, ShieldCheck, Sparkles,
  Upload, Loader2, Trash2
} from 'lucide-react';
import { UserSession, saveUserProfile } from '../../lib/supabase';
import { Language } from '../../i18n/translations';
import { optimizeImageToWebP } from '../../utils/imageOptimizer';

interface TerminalSideNavProps {
  isEs: boolean;
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onUpdateUser?: (updated: UserSession) => void;
  quickTradeEnabled?: boolean;
  onToggleQuickTrade?: () => void;
  navPosition: 'left' | 'right';
  isMobileNavOpen: boolean;
  activeSection: string;
  user?: UserSession | null;
  isTradingSidebarOpen?: boolean;
  showOrderForm?: boolean;
  showOrderBook?: boolean;
  showPositions?: boolean;
  onOpenTradingPanel?: () => void;
  onToggleTradingSidebar?: () => void;
  onToggleOrderForm?: () => void;
  onToggleOrderBook?: () => void;
  onTogglePositions?: () => void;
  onToggleNavPosition: () => void;
  onSelectSection: (section: 'none' | 'exchange' | string) => void;
  onCloseMobileNav: () => void;
  onExit: () => void;
}

// Icono personalizado de Velas Japonesas en blanco, negro y una roja
export const JapaneseCandlesticksIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} shrink-0`}
  >
    {/* Vela 1: Blanca con contorno y mecha negra */}
    <line x1="4.5" y1="2" x2="4.5" y2="18" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="2.5" y="6" width="4" height="7" rx="0.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.25" />

    {/* Vela 2: Roja viva sólida */}
    <line x1="10" y1="1.5" x2="10" y2="18.5" stroke="#ef4444" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="8" y="4" width="4" height="9" rx="0.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.5" />

    {/* Vela 3: Negra sólida */}
    <line x1="15.5" y1="3" x2="15.5" y2="17" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="13.5" y="7" width="4" height="6" rx="0.5" fill="#0f172a" />
  </svg>
);

export const TerminalSideNav: React.FC<TerminalSideNavProps> = ({
  isEs,
  currentLang = 'es',
  onLanguageChange,
  onUpdateUser,
  quickTradeEnabled = false,
  onToggleQuickTrade,
  navPosition,
  isMobileNavOpen,
  activeSection,
  user,
  isTradingSidebarOpen = true,
  showOrderForm = true,
  showOrderBook = true,
  showPositions = true,
  onOpenTradingPanel,
  onToggleTradingSidebar,
  onToggleOrderForm,
  onToggleOrderBook,
  onTogglePositions,
  onToggleNavPosition,
  onSelectSection,
  onCloseMobileNav,
  onExit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getInitialEmail = (u?: UserSession | null): string => {
    if (!u?.email) return '';
    if (u.email.endsWith('@telegram.org')) return '';
    return u.email;
  };

  const [isClickedExpanded, setIsClickedExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(getInitialEmail(user));
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) setEditName(user.name);
    if (user?.avatarUrl) setEditAvatarUrl(user.avatarUrl);
    setEditEmail(getInitialEmail(user));
  }, [user]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOptimizingImage(true);
    try {
      // Optimización automática en cliente a WebP (256x256 max, calidad 0.85)
      const webpDataUrl = await optimizeImageToWebP(file, { maxWidth: 256, maxHeight: 256, quality: 0.85 });
      setEditAvatarUrl(webpDataUrl);
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      alert(err?.message || (isEs ? 'Error al procesar la imagen' : 'Error processing image'));
    } finally {
      setIsOptimizingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      const updatedUser = await saveUserProfile(user, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        avatarUrl: editAvatarUrl.trim() || undefined
      });

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [isTradingSubmenuOpen, setIsTradingSubmenuOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_trading_submenu_open');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const handleToggleTradingSubmenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsTradingSubmenuOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_trading_submenu_open', String(next));
      } catch {}
      return next;
    });
  };

  const renderProfilePanel = () => (
    <div className="absolute inset-0 bg-[#fbf9f4] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
      {/* HEADER DEL PANEL DE PERFIL */}
      <div className="px-3.5 py-3 border-b border-[#ded5c5] flex items-center justify-between bg-[#f6f2e9] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-900">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 leading-tight">
              {isEs ? 'Perfil de Usuario' : 'User Profile'}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              {isEs ? 'Ajustes y preferencias' : 'Settings & preferences'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsProfileOpen(false)}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          title={isEs ? 'Cerrar' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CONTENIDO SCROLLEABLE IDÉNTICO AL MÓVIL */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* 1. TARJETA DE IDENTIDAD */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative mb-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-sm"
              />
            ) : user?.provider === 'telegram' ? (
              <div className="w-16 h-16 rounded-full bg-[#229ED9] flex items-center justify-center shadow-sm">
                <svg className="w-9 h-9 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500 text-amber-950 font-black text-xl flex items-center justify-center shadow-sm">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'T'}
              </div>
            )}
            <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title={isEs ? 'En línea' : 'Online'} />
          </div>

          {/* Nombre y referencia centrados */}
          <h3 className="text-sm font-black text-slate-900 leading-tight">
            {user?.name || (user?.telegramUsername ? `@${user.telegramUsername}` : (isEs ? 'Trader ZYTI' : 'ZYTI Trader'))}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-full">
            {user?.telegramUsername ? `@${user.telegramUsername}` : (user?.email && !user.email.endsWith('@telegram.org') ? user.email : '')}
          </p>

          {/* Badges centrados */}
          <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isEs ? 'Trader Verificado' : 'Verified Trader'}
            </span>
            {user?.provider === 'telegram' ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#229ED9]/15 text-[#1b8bc2] border border-[#229ED9]/30 flex items-center gap-1">
                <svg className="w-2.5 h-2.5 fill-[#229ED9]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Telegram Auth
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Email Auth
              </span>
            )}
          </div>

          {/* Notificación de guardado */}
          {saveSuccess && (
            <div className="mt-2.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEs ? 'Perfil actualizado con éxito' : 'Profile updated successfully'}</span>
            </div>
          )}
        </div>

        {/* 2. TARJETA EDITAR PERFIL */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEs ? 'Editar Perfil' : 'Edit Profile'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              {isEditingProfile ? (isEs ? 'Cancelar' : 'Cancel') : (isEs ? 'Modificar' : 'Modify')}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {isEs ? 'Nombre para mostrar / Alias' : 'Display Name / Alias'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={isEs ? 'Ej: Alex Trader' : 'e.g. Alex Trader'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {isEs ? 'Correo Electrónico (Opcional)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder={isEs ? 'ej: usuario@gmail.com' : 'e.g. user@gmail.com'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {isEs ? 'Foto de Perfil (Dispositivo o URL)' : 'Profile Photo (Device or URL)'}
                </label>

                {/* Input oculto de subida de archivo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Botón para subir directamente desde el dispositivo */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOptimizingImage}
                    className="flex-1 py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-950 font-bold text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    {isOptimizingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                        <span>{isEs ? 'Optimizando a WebP...' : 'Optimizing to WebP...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isEs ? 'Subir desde dispositivo (WebP)' : 'Upload from device (WebP)'}</span>
                      </>
                    )}
                  </button>

                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarUrl('')}
                      className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title={isEs ? 'Quitar foto' : 'Remove photo'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Preview en vivo si hay avatarUrl */}
                {editAvatarUrl && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 mb-2">
                    <img
                      src={editAvatarUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded-full object-cover border border-amber-400"
                    />
                    <div className="text-[10px] text-slate-500 truncate flex-1 font-mono">
                      {editAvatarUrl.startsWith('data:image/webp') ? '✅ WebP Optimizado' : editAvatarUrl}
                    </div>
                  </div>
                )}

                {/* Opcional: escribir URL manualmente */}
                <input
                  type="url"
                  value={editAvatarUrl.startsWith('data:') ? '' : editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder={editAvatarUrl.startsWith('data:') ? (isEs ? 'Foto cargada desde dispositivo (WebP)' : 'Photo loaded from device (WebP)') : 'https://...'}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile || !editName.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors active:scale-98"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingProfile ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Cambios' : 'Save Changes')}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">{isEs ? 'Nombre' : 'Name'}:</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">{user?.name || (isEs ? 'Sin definir' : 'Not set')}</span>
              </div>
              {user?.telegramUsername && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Telegram:</span>
                  <span className="font-mono text-[#1b8bc2] font-bold truncate max-w-[150px]">@{user.telegramUsername}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">{isEs ? 'Correo' : 'Email'}:</span>
                <span className="font-mono text-slate-700 truncate max-w-[150px]">
                  {user?.email && !user.email.endsWith('@telegram.org') 
                    ? user.email 
                    : (isEs ? 'No configurado (Opcional)' : 'Not configured (Optional)')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. SELECCIÓN DE IDIOMA (ESPAÑOL / ENGLISH) */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs">
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 text-xs font-bold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEs ? 'Selección de Idioma' : 'Language Selection'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* BOTÓN ESPAÑOL */}
            <button
              type="button"
              onClick={() => onLanguageChange?.('es')}
              className={`py-2 px-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                currentLang === 'es'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base leading-none">🇪🇸</span>
                <span className="text-xs font-bold truncate">Español</span>
              </div>
              {currentLang === 'es' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
            </button>

            {/* BOTÓN ENGLISH */}
            <button
              type="button"
              onClick={() => onLanguageChange?.('en')}
              className={`py-2 px-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base leading-none">🇬🇧</span>
                <span className="text-xs font-bold truncate">English</span>
              </div>
              {currentLang === 'en' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* 4. PREFERENCIAS DE INTERFAZ & OPERATIVA */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEs ? 'Preferencias de Interfaz' : 'Interface Preferences'}</span>
          </div>

          {/* TOGGLE 1-TOQUE */}
          {onToggleQuickTrade && (
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">
                  {isEs ? 'Operaciones Rápidas (1-Toque)' : 'Quick 1-Tap Trading'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isEs ? 'Botones de COMPRA y VENTA flotantes' : 'Floating BUY and SELL quick buttons'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleQuickTrade}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  quickTradeEnabled ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    quickTradeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* TOGGLE POSICIÓN BARRA LATERAL */}
          {onToggleNavPosition && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">
                  {isEs ? 'Lado de Navegación Lateral' : 'Lateral Navigation Position'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {navPosition === 'left' ? (isEs ? 'Izquierda' : 'Left') : (isEs ? 'Derecha' : 'Right')}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleNavPosition}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3 text-amber-600" />
                <span>{isEs ? 'Alternar' : 'Toggle'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. DATOS DE SESIÓN Y CUENTA */}
        <div className="p-3 rounded-2xl bg-white/70 border border-[#ded5c5] space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-400">{isEs ? 'ID de Usuario' : 'User ID'}:</span>
            <span className="font-mono font-bold text-slate-800">#{user?.id ? user.id.slice(0, 10).toUpperCase() : 'ZYTI-USER-01'}</span>
          </div>
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-400">{isEs ? 'Método de Acceso' : 'Login Method'}:</span>
            <span className="font-bold text-slate-800 capitalize">{user?.provider || 'Telegram'}</span>
          </div>
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-400">{isEs ? 'Estado de Cuenta' : 'Account Status'}:</span>
            <span className="font-bold text-emerald-600">{isEs ? 'Activa y Segura' : 'Active and Secure'}</span>
          </div>
        </div>

        {/* 6. BOTÓN CERRAR SESIÓN */}
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isEs ? 'Cerrar Sesión Segura' : 'Secure Log Out'}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. BARRA LATERAL EN ESCRITORIO (>= 1024px) */}
      <aside 
        className="terminal-side-nav"
        onMouseLeave={() => {
          if (!isProfileOpen) setIsClickedExpanded(false);
        }}
      >
        {/* Contenedor base de 48px para reservar el espacio permanente en el layout */}
        <div className={`w-12 h-full ${navPosition === 'left' ? 'border-r' : 'border-l'} border-[#ded5c5] bg-[#fbf9f4]`} />
        
        {/* Menú flotante al hover o al click que vuela por encima del gráfico sin redimensionarlo ni empujarlo */}
        <div 
          onMouseLeave={() => {
            if (!isProfileOpen) setIsClickedExpanded(false);
          }}
          className={`absolute top-0 bottom-0 ${navPosition === 'left' ? 'left-0 border-r' : 'right-0 border-l'} ${
            isProfileOpen
              ? 'w-80 shadow-2xl z-50'
              : isClickedExpanded
                ? 'w-64 shadow-2xl z-40'
                : 'w-12 hover:w-64 shadow-xs hover:shadow-2xl z-40'
          } bg-[#fbf9f4] border-[#ded5c5] transition-all duration-300 ease-out flex flex-col justify-between py-3 px-1.5 group overflow-hidden`}
        >
          {/* PANEL DESPLEGABLE HACIA ARRIBA DE PERFIL EN LA MISMA NAVEGACIÓN LATERAL */}
          {isProfileOpen && renderProfilePanel()}
          {/* SECCIONES ARRIBA */}
          <div className="space-y-2">
            {/* SECCIÓN 1: TRADING CON SUBMENÚS */}
            <div className="space-y-1">
              <div
                className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all ${
                  isTradingSidebarOpen && showOrderForm
                    ? 'bg-amber-100/90 text-amber-950 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/90'
                }`}
              >
                {/* Botón principal Trading: Abre panel si está oculto y expande opciones */}
                <button
                  type="button"
                  onClick={() => {
                    setIsClickedExpanded(true);
                    setIsTradingSubmenuOpen(true);
                    try { localStorage.setItem('zyti_trading_submenu_open', 'true'); } catch {}
                    if (onOpenTradingPanel) {
                      onOpenTradingPanel();
                    } else if (onToggleTradingSidebar) {
                      onToggleTradingSidebar();
                    }
                  }}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer outline-none py-0.5"
                  title={isEs ? 'Mostrar Panel de Trading' : 'Show Trading Panel'}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <JapaneseCandlesticksIcon className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                    Trading
                  </span>
                </button>

                {/* Botón chevron desacoplado para colapsar/desplegar submenú */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClickedExpanded(true);
                    handleToggleTradingSubmenu(e);
                  }}
                  className={`p-1 rounded-md hover:bg-amber-200/70 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer outline-none ${
                    isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title={isTradingSubmenuOpen ? (isEs ? 'Plegar submenú' : 'Collapse submenu') : (isEs ? 'Desplegar submenú' : 'Expand submenu')}
                >
                  {isTradingSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-amber-900" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>

              {/* SUBMENÚ DE PANELES DE TRADING */}
              {isTradingSubmenuOpen && (
                <div className={`pl-3 pr-1 py-1 space-y-1 ${isClickedExpanded ? 'block' : 'hidden group-hover:block'} transition-all`}>
                  {/* SUBITEM 1: FORMULARIO DE ÓRDENES */}
                  {onToggleOrderForm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onToggleOrderForm();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Panel de Órdenes' : 'Order Form'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showOrderForm ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showOrderForm && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* SUBITEM 2: LIBRO DE ÓRDENES */}
                  {onToggleOrderBook && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onToggleOrderBook();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Libro de Órdenes' : 'Order Book'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showOrderBook ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showOrderBook && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* SUBITEM 3: POSICIONES Y ÓRDENES PENDIENTES */}
                  {onTogglePositions && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onTogglePositions();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ListFilter className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Posiciones & Órdenes' : 'Positions & Orders'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showPositions ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showPositions && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: EXCHANGE */}
            <button
              type="button"
              onClick={() => {
                onSelectSection(activeSection === 'exchange' ? 'none' : 'exchange');
                setIsClickedExpanded(!isClickedExpanded);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'exchange'
                  ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
              }`}
              title="Exchange"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <Repeat className={`w-4 h-4 ${activeSection === 'exchange' ? 'text-amber-600' : 'text-slate-700'}`} />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                Exchange
              </span>
            </button>
          </div>

          {/* PIE DE NAVEGACIÓN ABAJO: PERFIL DE USUARIO + ACCESO CRM + CAMBIAR SENTIDO + CERRAR SESIÓN */}
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            {/* BADGE DE PERFIL DE USUARIO EN ESCRITORIO (CLICK PARA ABRIR PERFIL HACIA ARRIBA) */}
            <button 
              type="button"
              onClick={() => {
                setIsProfileOpen(true);
                setIsClickedExpanded(true);
              }}
              className={`w-full flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/70 hover:border-amber-400 overflow-hidden select-none transition-all cursor-pointer text-left ${
                isClickedExpanded ? 'justify-start' : 'justify-center group-hover:justify-start'
              }`}
              title={isEs ? 'Ver y editar perfil' : 'View and edit profile'}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-400" />
              ) : user?.provider === 'telegram' ? (
                <div className="w-6 h-6 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                </div>
              ) : user ? (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.telegramUsername?.[0]?.toUpperCase() || 'T'}
                </div>
              ) : (
                <img src="/logo-zyti.png" alt="ZYTI Trade" className="w-5 h-5 object-contain shrink-0" />
              )}
              <div className={`flex flex-col text-left leading-tight min-w-0 ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                <span className="text-[11px] font-black text-slate-900 truncate">
                  {user ? (user?.name || (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.email && !user.email.endsWith('@telegram.org') ? user.email.split('@')[0] : 'Trader'))) : 'ZYTI Trade'}
                </span>
                <span className="text-[9px] font-bold text-amber-800 truncate">
                  {user ? (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.role === 'admin' ? 'Admin' : (isEs ? 'Editar Perfil' : 'Edit Profile'))) : 'Live Terminal'}
                </span>
              </div>
            </button>

            {/* ENTRADA DIRECTA AL CRM NEXUS (JUSTO DEBAJO DEL USER) */}
            {(user?.role === 'admin' || user?.role === 'soporte' || user?.role === 'marketing') && (
              <a
                href={`/${currentLang}/nexus`}
                className={`w-full flex items-center gap-2 p-1.5 rounded-xl transition-all cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/90 shadow-2xs select-none ${
                  isClickedExpanded ? 'justify-start' : 'justify-center group-hover:justify-start'
                }`}
                title="Panel Nexus ERP"
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 text-purple-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className={`flex flex-col text-left leading-tight min-w-0 ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                  <span className="text-[11px] font-black text-purple-950 truncate">Nexus ERP</span>
                  <span className="text-[9px] font-bold text-purple-600 truncate uppercase">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </a>
            )}

            {/* BOTÓN CAMBIO DE POSICIÓN IZQUIERDA / DERECHA */}
            <button
              type="button"
              onClick={onToggleNavPosition}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
              title={navPosition === 'left' ? (isEs ? 'Mover menú a la derecha' : 'Move menu to right') : (isEs ? 'Mover menú a la izquierda' : 'Move menu to left')}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-4 h-4 text-slate-600" />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                {navPosition === 'left' ? (isEs ? 'Mover a Derecha' : 'Move to Right') : (isEs ? 'Mover a Izquierda' : 'Move to Left')}
              </span>
            </button>

            {/* BOTÓN CERRAR SESIÓN (AL FONDO) */}
            <button
              type="button"
              onClick={onExit}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50/70 transition-colors cursor-pointer"
              title={isEs ? 'Cerrar sesión' : 'Log Out'}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                {isEs ? (user ? 'Cerrar Sesión' : 'Volver al Inicio') : (user ? 'Log Out' : 'Back to Home')}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. DRAWER DE NAVEGACIÓN EN MÓVIL (< 1024px) */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-72 h-full bg-[#fbf9f4] border-l border-[#ded5c5] shadow-2xl p-4 flex flex-col justify-between animate-slide-in-right relative overflow-hidden">
            {isProfileOpen && renderProfilePanel()}
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900">Menú ZYTI Trade</span>
                <button
                  type="button"
                  onClick={onCloseMobileNav}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PERFIL DE USUARIO EN EL DRAWER MÓVIL */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="w-full mb-3 p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/80 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
                title={isEs ? 'Ver y editar perfil' : 'View and edit profile'}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User'} className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400" />
                ) : user?.provider === 'telegram' ? (
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                  </div>
                ) : user ? (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.telegramUsername?.[0]?.toUpperCase() || 'T'}
                  </div>
                ) : (
                  <img src="/logo-zyti.png" alt="ZYTI Trade" className="w-7 h-7 object-contain shrink-0" />
                )}
                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="text-xs font-black text-slate-900 truncate">
                    {user ? (user?.name || (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.email && !user.email.endsWith('@telegram.org') ? user.email.split('@')[0] : 'Trader'))) : 'ZYTI Trade'}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 truncate">
                    {user ? (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.role === 'admin' ? 'Administrador' : (isEs ? 'Editar Perfil' : 'Edit Profile'))) : 'Live Terminal'}
                  </span>
                </div>
              </button>

              {/* ENTRADA AL CRM NEXUS (MÓVIL - JUSTO DEBAJO DEL USER) */}
              {(user?.role === 'admin' || user?.role === 'soporte' || user?.role === 'marketing') && (
                <a
                  href={`/${currentLang}/nexus`}
                  className="w-full mb-3 p-2 rounded-xl flex items-center gap-2.5 text-xs font-black transition-colors cursor-pointer bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                  <div className="flex flex-col text-left leading-tight min-w-0">
                    <span className="text-xs font-black text-purple-950">Nexus ERP Core</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase">{user?.role || 'Admin'}</span>
                  </div>
                </a>
              )}

              {/* SECCIONES TRADING Y EXCHANGE */}
              <div className="space-y-1">
                <div
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    isTradingSidebarOpen && showOrderForm
                      ? 'bg-amber-100 text-amber-950 font-black'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTradingPanel) onOpenTradingPanel();
                      setIsTradingSubmenuOpen(true);
                      onCloseMobileNav();
                    }}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <JapaneseCandlesticksIcon className="w-4 h-4" />
                    <span>Trading</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleTradingSubmenu}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {isTradingSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isTradingSubmenuOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1.5 animate-in fade-in duration-150">
                    {onToggleOrderForm && (
                      <button
                        type="button"
                        onClick={onToggleOrderForm}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Panel de Órdenes' : 'Order Form'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showOrderForm ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showOrderForm && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    {onToggleOrderBook && (
                      <button
                        type="button"
                        onClick={onToggleOrderBook}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Libro de Órdenes' : 'Order Book'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showOrderBook ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showOrderBook && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    {onTogglePositions && (
                      <button
                        type="button"
                        onClick={onTogglePositions}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Posiciones & Órdenes' : 'Positions & Orders'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showPositions ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showPositions && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectSection('exchange');
                    onCloseMobileNav();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeSection === 'exchange'
                      ? 'bg-amber-100 text-amber-950 font-black'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Repeat className="w-4 h-4 text-amber-600" />
                  <span>Exchange</span>
                </button>
              </div>
            </div>

            {/* CERRAR SESIÓN */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onExit}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isEs ? (user ? 'Cerrar Sesión' : 'Volver al Inicio') : (user ? 'Log Out' : 'Back to Home')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
