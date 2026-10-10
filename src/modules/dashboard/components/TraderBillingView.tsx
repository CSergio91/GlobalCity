import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CreditCard, 
  Coins, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  X, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../context/LanguageContext';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  planId: string;
  category: 'solar' | 'lunar';
  accountSize: number;
  basePrice: number;
  addonsCost: number;
  totalPrice: number;
  addons: string[];
  paymentGateway: string;
  paymentStatus: string;
  billingAddress: any;
  createdAt: string;
}

interface TraderBillingViewProps {
  userEmail?: string;
  userId?: string;
  userDisplayName?: string;
}

export const TraderBillingView: React.FC<TraderBillingViewProps> = ({
  userEmail,
  userId,
  userDisplayName = 'Trader'
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const cacheKey = `eklipse_billing_cache_${userEmail || 'anon'}`;

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const cached = sessionStorage.getItem(`eklipse_billing_cache_${userEmail || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data)) return parsed.data;
      }
    } catch (_) {}
    return [];
  });

  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`eklipse_billing_cache_${userEmail || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) return false;
      }
    } catch (_) {}
    return true;
  });

  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null);

  useEffect(() => {
    loadBillingOrders(false);
  }, [userEmail, userId]);

  const loadBillingOrders = async (forceRefresh = false) => {
    if (forceRefresh || orders.length === 0) {
      setIsLoading(true);
    }
    try {
      const loaded: OrderRecord[] = [];

      // 1. Cargar desde PostgreSQL public.orders
      if (userEmail || userId) {
        let query = supabase.from('orders').select('*');
        if (userEmail) {
          query = query.eq('trader_email', userEmail.toLowerCase().trim());
        }
        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            loaded.push({
              id: row.id,
              orderNumber: row.order_number || `ORD-${row.id.slice(0, 8)}`,
              planId: row.plan_id || 'solar-25k',
              category: row.category || (row.plan_id?.includes('lunar') ? 'lunar' : 'solar'),
              accountSize: Number(row.account_size || 25000),
              basePrice: Number(row.base_price || 199),
              addonsCost: Number(row.addons_cost || 0),
              totalPrice: Number(row.total_price || 199),
              addons: Array.isArray(row.addons) ? row.addons : [],
              paymentGateway: row.payment_gateway || 'crypto',
              paymentStatus: row.payment_status || 'COMPLETED',
              billingAddress: row.billing_address || {},
              createdAt: row.created_at || new Date().toISOString()
            });
          });
        }
      }

      // 2. Sincronizar también con almacenamiento local (redundancia)
      try {
        const localAssigned = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        if (Array.isArray(localAssigned)) {
          localAssigned.forEach((item: any, idx: number) => {
            const fakeId = `local_ord_${idx}_${item.purchasedAt || Date.now()}`;
            const exists = loaded.some(
              (o) => o.createdAt === item.purchasedAt || (o.totalPrice === item.price && o.accountSize === item.accountSize)
            );
            if (!exists) {
              loaded.push({
                id: fakeId,
                orderNumber: `ORD-${Date.now().toString().slice(-6)}-${idx + 100}`,
                planId: item.planId || 'solar-25k',
                category: item.category || 'solar',
                accountSize: Number(item.accountSize || 25000),
                basePrice: Number(item.basePrice || item.price || 199),
                addonsCost: Number(item.addonsCost || 0),
                totalPrice: Number(item.price || 199),
                addons: Array.isArray(item.addons) ? item.addons : [],
                paymentGateway: 'crypto',
                paymentStatus: 'COMPLETED',
                billingAddress: { email: userEmail, name: userDisplayName },
                createdAt: item.purchasedAt || new Date().toISOString()
              });
            }
          });
        }
      } catch (_) {}

      // Ordenar por fecha descendente
      loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(loaded);

      // Persistencia en sessionStorage para navegación en 0ms
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: loaded, timestamp: Date.now() }));
      } catch (_) {}
    } catch (err) {
      console.warn('[BillingView] Error cargando órdenes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalPurchases = orders.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header con Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B0E17]/90 border border-white/5 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Receipt className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEn ? 'Billing & Order History' : 'Facturación e Historial de Compras'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            {isEn
              ? 'Institutional invoices, challenge purchases and official payment receipts.'
              : 'Facturas institucionales, compras de retos y comprobantes oficiales de pago.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadBillingOrders(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? 'Refresh' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* 2. Métricas de Facturación (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invertido */}
        <div className="p-5 rounded-2xl bg-[#0B0E17]/80 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {isEn ? 'Total Invested' : 'Total Invertido'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white font-mono tracking-tight">
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs text-slate-400 ml-1 font-sans">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEn ? 'Settled on-chain / card' : 'Liquidado on-chain / tarjeta'}</span>
          </div>
        </div>

        {/* Retos Adquiridos */}
        <div className="p-5 rounded-2xl bg-[#0B0E17]/80 border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {isEn ? 'Purchased Challenges' : 'Retos Comprados'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white font-mono tracking-tight">
            {totalPurchases}
            <span className="text-xs text-slate-400 ml-1 font-sans">{isEn ? 'accounts' : 'cuentas'}</span>
          </div>
          <div className="mt-1 text-[11px] text-purple-300 font-mono">
            {isEn ? 'Instant provisioning' : 'Aprovisionamiento instantáneo'}
          </div>
        </div>

        {/* Método Predilecto */}
        <div className="p-5 rounded-2xl bg-[#0B0E17]/80 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {isEn ? 'Payment Venue' : 'Método de Pago'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white font-mono tracking-tight">
            USDT / Card
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-mono">
            {isEn ? '0% Chargeback Shield' : 'Protección 0% contracargos'}
          </div>
        </div>

        {/* Estado Fiscal */}
        <div className="p-5 rounded-2xl bg-[#0B0E17]/80 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {isEn ? 'Tax Status' : 'Estado de Facturas'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {isEn ? 'Exempt (0% VAT)' : 'Exento (0% IVA)'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            {isEn ? 'B2B Reverse Charge' : 'Inversión sujeto pasivo'}
          </div>
        </div>

      </div>

      {/* 3. Tabla de Compras & Facturas */}
      <div className="rounded-2xl bg-[#0B0E17]/90 border border-white/5 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Purchase & Invoice Ledger' : 'Libro de Facturas y Compras'}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {orders.length} {isEn ? 'records' : 'registros'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono">{isEn ? 'Loading billing history...' : 'Cargando historial de facturación...'}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Receipt className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium text-slate-400">
              {isEn ? 'No purchases registered under this email yet.' : 'Aún no tienes compras registradas con este correo.'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isEn 
                ? 'When you acquire an institutional challenge, your official invoice and receipt will be listed here automatically.'
                : 'Cuando adquieras un reto institucional, tu factura y comprobante oficial aparecerán aquí automáticamente.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6">{isEn ? 'Invoice / Order' : 'Factura / Orden'}</th>
                  <th className="py-3 px-6">{isEn ? 'Plan & Tier' : 'Plan y Reto'}</th>
                  <th className="py-3 px-6">{isEn ? 'Date' : 'Fecha'}</th>
                  <th className="py-3 px-6">{isEn ? 'Add-ons' : 'Add-ons'}</th>
                  <th className="py-3 px-6">{isEn ? 'Amount' : 'Importe'}</th>
                  <th className="py-3 px-6">{isEn ? 'Status' : 'Estado'}</th>
                  <th className="py-3 px-6 text-right">{isEn ? 'Action' : 'Acción'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const isLunar = order.category === 'lunar';
                  const dateStr = new Date(order.createdAt).toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Orden */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {order.paymentGateway === 'card' ? (isEn ? 'Credit Card' : 'Tarjeta') : 'USDT Crypto'}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isLunar ? 'bg-purple-400' : 'bg-amber-400'}`} />
                          <span className="font-semibold text-slate-200">
                            ${order.accountSize.toLocaleString()} {isLunar ? 'Lunar' : 'Solar'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {isLunar ? '2-Phase Evaluation' : '1-Phase Fast Track'}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="py-4 px-6 text-slate-400 text-[11px]">
                        {dateStr}
                      </td>

                      {/* Add-ons */}
                      <td className="py-4 px-6">
                        {order.addons && order.addons.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {order.addons.map((add) => (
                              <span 
                                key={add}
                                className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/25"
                              >
                                {add.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Importe */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-500">USD</span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isEn ? 'COMPLETED' : 'PAGADO'}</span>
                        </span>
                      </td>

                      {/* Acción Ver Factura */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedInvoice(order)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEn ? 'Receipt' : 'Recibo'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Modal de Factura / Recibo Oficial (Diseño Limpio y Claro) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Top Controls */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="font-mono text-xs font-bold text-slate-700">
                  {isEn ? 'Official Payment Receipt' : 'Recibo Oficial de Pago'} #{selectedInvoice.orderNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded text-xs font-mono font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>{isEn ? 'Print' : 'Imprimir'}</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Document Body (Pure Light Editorial) */}
            <div className="p-8 space-y-6 text-sm">
              
              {/* Header con Marca */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="inline-block px-3 py-1 bg-slate-900 rounded text-amber-400 font-mono font-black text-sm tracking-wider">
                    EKLIPSE FUNDED
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    Eklipse Funded Technologies Ltd.<br />
                    Financial Simulation & DMA Infrastructure<br />
                    support@eklipsefunded.com
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    INVOICE
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    #{selectedInvoice.orderNumber}
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-200 pb-6">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block font-bold mb-1">
                    {isEn ? 'Billed To:' : 'Facturado A:'}
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedInvoice.billingAddress?.firstName || selectedInvoice.billingAddress?.name || userDisplayName} {selectedInvoice.billingAddress?.lastName || ''}
                  </div>
                  <div className="text-slate-600">{userEmail}</div>
                  {selectedInvoice.billingAddress?.address1 && (
                    <div className="text-slate-500">
                      {selectedInvoice.billingAddress.address1}, {selectedInvoice.billingAddress.city || ''}
                    </div>
                  )}
                  {selectedInvoice.billingAddress?.country && (
                    <div className="text-slate-500">{selectedInvoice.billingAddress.country}</div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-slate-400 uppercase tracking-wider block font-bold mb-1">
                    {isEn ? 'Payment Details:' : 'Detalles de Pago:'}
                  </span>
                  <div className="font-bold text-emerald-600 text-sm">
                    {isEn ? 'PAID / COMPLETED' : 'PAGADO / APROBADO'}
                  </div>
                  <div className="text-slate-600">
                    {selectedInvoice.paymentGateway === 'card' ? 'Credit/Debit Card' : 'USDT Crypto On-Chain'}
                  </div>
                  <div className="text-slate-500">
                    {isEn ? 'Immediate Account Delivery' : 'Entrega Inmediata de Cuenta'}
                  </div>
                </div>
              </div>

              {/* Desglose de Línea */}
              <div className="space-y-2">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-left">
                      <th className="py-2">{isEn ? 'Item Description' : 'Descripción del Concepto'}</th>
                      <th className="py-2 text-right">{isEn ? 'Amount' : 'Importe'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">
                          {selectedInvoice.category === 'lunar' ? 'Lunar Orbit' : 'Solar Flare'} — ${selectedInvoice.accountSize.toLocaleString()} USD Challenge
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isEn 
                            ? 'Institutional trading evaluation program with simulated liquidity.'
                            : 'Programa de evaluación institucional con liquidez simulada.'}
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800">
                        ${selectedInvoice.basePrice.toFixed(2)}
                      </td>
                    </tr>
                    {selectedInvoice.addons && selectedInvoice.addons.length > 0 && (
                      <tr>
                        <td className="py-3">
                          <div className="font-bold text-slate-800">
                            {isEn ? 'Institutional Add-ons Package' : 'Paquete de Add-ons Institucionales'}
                          </div>
                          <div className="text-[11px] text-purple-600">
                            {selectedInvoice.addons.join(', ')}
                          </div>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-800">
                          +${selectedInvoice.addonsCost.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Final */}
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center font-mono">
                <div>
                  <span className="text-xs text-slate-500 block">
                    {isEn ? 'Tax Exempt: B2B Cross-Border Service' : 'Exento de IVA: Servicio B2B Transfronterizo'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isEn ? 'Zero chargeback protocol active' : 'Protocolo cero contracargos activo'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-bold block">{isEn ? 'Total Paid' : 'Total Abonado'}</span>
                  <span className="text-2xl font-black text-slate-900">
                    ${selectedInvoice.totalPrice.toFixed(2)} <span className="text-xs text-slate-500">USD</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
              Eklipse Funded &bull; Verified Institutional Receipt &bull; {selectedInvoice.orderNumber}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
