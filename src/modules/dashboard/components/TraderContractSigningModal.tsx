import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  X, 
  Shield, 
  Printer, 
  AlertTriangle, 
  PenTool, 
  Lock,
  Globe,
  Download
} from 'lucide-react';
import { UserTradingAccount } from '../TraderDashboardApp';

interface TraderContractSigningModalProps {
  account: UserTradingAccount;
  userName?: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSignedSuccess: (signature: string) => void;
  isEnDefault?: boolean;
}

export const TraderContractSigningModal: React.FC<TraderContractSigningModalProps> = ({
  account,
  userName = 'Trader',
  userEmail = '',
  isOpen,
  onClose,
  onSignedSuccess,
  isEnDefault = false
}) => {
  const [lang, setLang] = useState<'es' | 'en'>(isEnDefault ? 'en' : 'es');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureText, setSignatureText] = useState(userName !== 'Trader' ? userName : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEn = lang === 'en';
  const contractId = `CTR-${account.accountNumber}`;
  const currentDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSign = async () => {
    if (!acceptedTerms) {
      setError(isEn ? 'You must accept the terms before signing.' : 'Debes aceptar los términos y condiciones antes de firmar.');
      return;
    }
    if (!signatureText.trim() || signatureText.trim().length < 3) {
      setError(isEn ? 'Please type your full legal name as digital signature.' : 'Por favor ingresa tu nombre y apellido completos como firma digital.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSignedSuccess(signatureText.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Error submitting signature.' : 'Error al registrar la firma digital.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="printable-contract"
        className="w-full max-w-3xl my-auto rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0A0D15] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* ENCABEZADO MODAL (FIJO) */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0E1220] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {contractId}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {account.category.toUpperCase()} EVALUATION
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {isEn ? 'Prop Trading Evaluation Agreement' : 'Acuerdo de Evaluación Institucional de Trading'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Idioma Selector */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded transition-colors ${lang === 'es' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              title={isEn ? 'Print / Save PDF' : 'Imprimir / Guardar en PDF'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL CONTRATO (SCROLLABLE) */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-[13px] text-slate-300 font-sans leading-relaxed">
          
          {/* Tarjeta de Metadatos del Contrato */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">
                {isEn ? 'TRADER' : 'TRADER TITULAR'}
              </span>
              <strong className="text-white truncate block">{userName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">
                {isEn ? 'ACCOUNT NUMBER' : 'NÚMERO DE CUENTA'}
              </span>
              <strong className="text-amber-400 block">{account.accountNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">
                {isEn ? 'EVALUATION SIZE' : 'CAPITAL ASIGNADO'}
              </span>
              <strong className="text-emerald-400 block">${account.initialBalance.toLocaleString()} USD</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">
                {isEn ? 'DATE' : 'FECHA'}
              </span>
              <strong className="text-slate-300 block">{currentDate}</strong>
            </div>
          </div>

          {/* Cláusulas en Español o Inglés */}
          {lang === 'es' ? (
            <div className="space-y-4 text-justify">
              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">1.</span> OBJETO Y CONDICIÓN DE EVALUACIÓN SIMULADA
                </h3>
                <p>
                  El presente Acuerdo regula la participación del <strong>Trader Titular</strong> en el programa de evaluación institucional provisto por <strong>Eklipse Capital Group Ltd. (&quot;Eklipse Funded&quot;)</strong>. 
                  El Trader reconoce y acepta que durante las fases de evaluación opera en un entorno simulado conectado a libros de órdenes institucionales en tiempo real, sin riesgo sobre fondos propios más allá del precio del reto adquirido.
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">2.</span> REGLAS DE GESTIÓN DE RIESGO OBLIGATORIAS
                </h3>
                <p>
                  El Trader se compromete a respetar en todo momento los parámetros paramétricos de riesgo calculados por el motor centinela en memoria:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 font-mono text-[12px] text-slate-200">
                  <li><strong>Límite de Pérdida Diaria (Daily Loss):</strong> No superar el <strong>{account.maxDailyDrawdownPct}%</strong> del capital inicial o balance al inicio de la jornada (EOD).</li>
                  <li><strong>Pérdida Máxima Total (Max Drawdown):</strong> No superar el <strong>{account.maxTotalDrawdownPct}%</strong> de caída total sobre el balance inicial.</li>
                  <li><strong>Objetivo de Ganancias (Profit Target):</strong> Alcanzar un mínimo de <strong>{account.profitTargetPct}%</strong> para superar la fase de evaluación.</li>
                  <li><strong>Apalancamiento Máximo:</strong> Configurado en <strong>{account.leverage || '1:50'}</strong>.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">3.</span> DISCIPLINA DE MERCADO Y PRÁCTICAS PROHIBIDAS
                </h3>
                <p>
                  Queda estrictamente prohibido el uso de latencia artificial, aprovechamiento de fallos de feed de precios (toxic order flow), y microscalping abusivo (duración mínima por trade de 10 segundos). 
                  Asimismo, rige la <strong>Regla de Consistencia del 40%</strong>: ningún trade individual o día único podrá representar más del 40% del beneficio total acumulado.
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">4.</span> PARTICIPACIÓN EN BENEFICIOS (PROFIT SPLIT)
                </h3>
                <p>
                  Una vez superadas satisfactoriamente las fases y verificada la identidad del Trader (KYC), el Trader pasará a cuenta fondeada institucional con derecho a percibir el <strong>{account.profitSplit}%</strong> de las ganancias netas generadas, pagaderas de forma periódica mediante pasarela cripto o transferencia internacional.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-4 text-justify">
              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">1.</span> PURPOSE & SIMULATED EVALUATION ENVIRONMENT
                </h3>
                <p>
                  This Agreement governs the Trader&apos;s participation in the institutional evaluation program provided by <strong>Eklipse Capital Group Ltd. (&quot;Eklipse Funded&quot;)</strong>. 
                  The Trader acknowledges that during the evaluation phase, all trades are executed in a simulated institutional environment with real order book pricing, with zero risk to personal capital beyond the initial challenge fee.
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">2.</span> MANDATORY RISK MANAGEMENT PARAMETERS
                </h3>
                <p>
                  The Trader agrees to adhere strictly to the real-time automated risk rules enforced by the RAM Sentinel Engine:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 font-mono text-[12px] text-slate-200">
                  <li><strong>Maximum Daily Loss:</strong> Must not exceed <strong>{account.maxDailyDrawdownPct}%</strong> of initial balance or End-of-Day balance.</li>
                  <li><strong>Maximum Total Drawdown:</strong> Must not exceed <strong>{account.maxTotalDrawdownPct}%</strong> of the initial capital.</li>
                  <li><strong>Profit Target:</strong> Reach at least <strong>{account.profitTargetPct}%</strong> to successfully pass the phase.</li>
                  <li><strong>Maximum Leverage:</strong> Fixed at <strong>{account.leverage || '1:50'}</strong>.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">3.</span> PROHIBITED TRADING PRACTICES & CONSISTENCY
                </h3>
                <p>
                  Latency arbitrage, toxic flow exploitation, and ultra-high-frequency spamming (trades lasting under 10 seconds) are strictly prohibited. 
                  The <strong>40% Consistency Rule</strong> applies: no single day or trade may account for more than 40% of total accumulated challenge profits.
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold text-sm mb-1 font-mono flex items-center gap-2">
                  <span className="text-amber-400">4.</span> PROFIT SPLIT & WITHDRAWALS
                </h3>
                <p>
                  Upon successful completion of the evaluation phase and KYC verification, the Trader will be granted an institutional funded account entitled to receive <strong>{account.profitSplit}%</strong> of net generated trading profits, payable via cryptocurrency or bank wire.
                </p>
              </section>
            </div>
          )}

          {/* Banner de Seguridad Legal */}
          <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-start gap-3 text-amber-200 text-xs">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong>{isEn ? 'Legal Notice:' : 'Nota Legal:'}</strong>{' '}
              {isEn 
                ? 'Your electronic signature carries legal binding effect under international electronic commerce standards. Submitting this signature permanently unlocks trading execution for this account.'
                : 'Tu firma electrónica tiene plena validez legal bajo las normativas internacionales de comercio digital. La firma desbloquea inmediatamente la ejecución de órdenes para esta cuenta.'}
            </div>
          </div>

          {/* SECCIÓN DE FIRMA ELECTRÓNICA */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/15 space-y-4">
            
            {/* Checkbox de Aceptación */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-amber-400/50 bg-black/40 cursor-pointer"
              />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors select-none">
                {isEn 
                  ? 'I have read, understood, and accept all risk rules, parameters, and terms of this Evaluation Agreement.'
                  : 'He leído, comprendo y acepto todas las reglas de riesgo, parámetros y términos del presente Acuerdo de Evaluación.'}
              </span>
            </label>

            {/* Input de Firma Digital */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                {isEn ? 'Digital Signature (Type your Full Legal Name):' : 'Firma Digital (Escribe tu Nombre y Apellidos Completos):'}
              </label>
              <div className="relative">
                <PenTool className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder={isEn ? 'e.g. John Doe' : 'ej. Carlos Sergio Martinez Vergel'}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/40 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-slate-600 italic"
                />
              </div>
              <span className="text-[10.5px] font-mono text-slate-500 mt-1 block">
                {isEn 
                  ? 'This name will be stamped into the cryptographic audit log along with your timestamp and account ID.'
                  : 'Este nombre quedará grabado en la auditoría criptográfica junto con tu marca de tiempo e ID de cuenta.'}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

        </div>

        {/* PIE DE PÁGINA (BOTONES DE ACCIÓN) */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0E1220] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEn ? 'Secured by Eklipse Risk Audit Engine' : 'Protegido por el Motor de Auditoría Eklipse'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>

            <button
              type="button"
              onClick={handleSign}
              disabled={isSubmitting || !acceptedTerms || signatureText.trim().length < 3}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                acceptedTerms && signatureText.trim().length >= 3 && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-400/20'
                  : 'bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isEn ? 'Signing...' : 'Firmando...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? 'Sign Agreement & Enable Trading' : 'Firmar Acuerdo y Habilitar Trading'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
