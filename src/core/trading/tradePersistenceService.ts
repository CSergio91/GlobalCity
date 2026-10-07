import { supabase, fetchTraderAccounts } from '../../lib/supabase';
import { ClosedTradeItem } from '../../components/terminal/types';
import { PositionItem } from './types';

export interface OpenedTradePayload {
  id: string;
  accountId?: string;
  userId?: string;
  traderEmail?: string;
  exchange?: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  leverage: number;
  entryPrice: number;
  slPrice?: number | null;
  tpPrice?: number | null;
  openedAt?: string;
}

export interface ClosedTradePayload {
  tradeId: string;
  accountId?: string;
  userId?: string;
  traderEmail?: string;
  exitPrice: number;
  realizedPnl: number;
  closeReason: 'TP' | 'SL' | 'MANUAL' | 'LIQUIDATION_BREACH';
  closedAt?: string;
  newBalance?: number;
}

/**
 * Servicio transaccional Write-Behind para persistencia de trades en Supabase.
 * Ejecuta en segundo plano sin bloquear el bucle de renderizado ni los 60 FPS de la terminal.
 * Se comunica exclusivamente con cuentas reales autenticadas.
 */
export const TradePersistenceService = {
  /**
   * Resuelve el ID de cuenta de fondeo real del usuario por accountId, userId o email
   */
  async resolveAccountId(accountId?: string, userId?: string, email?: string): Promise<string | null> {
    if (accountId) return accountId;

    const identifier = userId || email?.trim().toLowerCase();
    if (!identifier) {
      try {
        const cached = localStorage.getItem('zyti_active_account_id');
        if (cached) return cached;
      } catch (_) {}
      return null;
    }

    try {
      const accounts = await fetchTraderAccounts(identifier);
      if (accounts && accounts.length > 0 && accounts[0].id) {
        try { localStorage.setItem('zyti_active_account_id', accounts[0].id); } catch (_) {}
        return accounts[0].id;
      }
    } catch (err) {
      console.warn('[TradePersistence] Error resolviendo cuenta por identificador:', err);
    }

    return null;
  },

  /**
   * Registra una posición abierta en la tabla public.account_trades
   */
  async persistOpenedTrade(payload: OpenedTradePayload): Promise<void> {
    try {
      const resolvedAccountId = await this.resolveAccountId(payload.accountId, payload.userId, payload.traderEmail);
      if (!resolvedAccountId) {
        console.warn('[TradePersistence] No se pudo persistir orden abierta: falta cuenta para', payload.traderEmail || payload.userId);
        return;
      }

      const openedAt = payload.openedAt || new Date().toISOString();
      const { error } = await supabase
        .from('account_trades')
        .insert({
          id: payload.id,
          account_id: resolvedAccountId,
          exchange: payload.exchange || 'binance',
          symbol: payload.symbol,
          side: payload.side,
          size: payload.size,
          leverage: payload.leverage,
          entry_price: payload.entryPrice,
          sl_price: payload.slPrice ?? null,
          tp_price: payload.tpPrice ?? null,
          status: 'OPEN',
          opened_at: openedAt
        });

      if (error) {
        console.warn('[TradePersistence] Error al persistir orden abierta:', error.message);
      } else {
        console.log('[TradePersistence] Orden abierta registrada en DB:', payload.id, payload.symbol, resolvedAccountId);
      }
    } catch (err) {
      console.warn('[TradePersistence] Excepción persistiendo orden abierta:', err);
    }
  },

  /**
   * Actualiza los niveles de Stop Loss y Take Profit de una posición abierta en Supabase.
   * Ejecución asíncrona Write-Behind sin bloquear el hilo principal.
   */
  async updateTradeSLTP(tradeId: string, slPrice?: number | null, tpPrice?: number | null): Promise<void> {
    try {
      const updateData: { sl_price?: number | null; tp_price?: number | null } = {};
      if (slPrice !== undefined) updateData.sl_price = slPrice;
      if (tpPrice !== undefined) updateData.tp_price = tpPrice;

      const { error } = await supabase
        .from('account_trades')
        .update(updateData)
        .eq('id', tradeId);

      if (error) {
        console.warn('[TradePersistence] Error actualizando SL/TP en DB:', error.message);
      } else {
        console.log('[TradePersistence] SL/TP persistido en DB para trade:', tradeId, updateData);
      }
    } catch (err) {
      console.warn('[TradePersistence] Excepción actualizando SL/TP:', err);
    }
  },

  /**
   * Actualiza el trade al cerrarse (TP, SL o Manual) y sincroniza el balance de la cuenta oficial de 100K
   */
  async persistClosedTrade(payload: ClosedTradePayload): Promise<void> {
    try {
      const resolvedAccountId = await this.resolveAccountId(payload.accountId, payload.userId, payload.traderEmail);
      const closedAt = payload.closedAt || new Date().toISOString();

      // 1. Asentar cierre en public.account_trades
      const { error: tradeErr } = await supabase
        .from('account_trades')
        .update({
          status: 'CLOSED',
          exit_price: payload.exitPrice,
          realized_pnl: payload.realizedPnl,
          close_reason: payload.closeReason,
          closed_at: closedAt
        })
        .eq('id', payload.tradeId);

      if (tradeErr) {
        console.warn('[TradePersistence] Error actualizando trade cerrado:', tradeErr.message);
      } else {
        console.log('[TradePersistence] Trade cerrado liquidado en DB:', payload.tradeId, payload.closeReason, payload.realizedPnl);
      }

      // 2. Sincronizar nuevo balance consolidado y equidad en public.trading_accounts
      if (resolvedAccountId && payload.newBalance !== undefined) {
        const { error: accErr } = await supabase
          .from('trading_accounts')
          .update({
            current_balance: Number(payload.newBalance.toFixed(2)),
            equity: Number(payload.newBalance.toFixed(2)),
            updated_at: closedAt
          })
          .eq('id', resolvedAccountId);

        if (accErr) {
          console.warn('[TradePersistence] Error actualizando balance de cuenta:', accErr.message);
        }
      }
    } catch (err) {
      console.warn('[TradePersistence] Excepción persistiendo trade cerrado:', err);
    }
  },

  /**
   * Actualiza el balance y equidad de la cuenta de trading en public.trading_accounts
   */
  async persistAccountBalance(accountId?: string, userId?: string, email?: string, newBalance?: number): Promise<void> {
    if (newBalance === undefined || isNaN(newBalance)) return;
    try {
      const resolvedAccountId = await this.resolveAccountId(accountId, userId, email);
      if (!resolvedAccountId) return;

      const { error } = await supabase
        .from('trading_accounts')
        .update({
          current_balance: Number(newBalance.toFixed(2)),
          equity: Number(newBalance.toFixed(2)),
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedAccountId);

      if (error) {
        console.warn('[TradePersistence] Error persistiendo balance de cuenta:', error.message);
      } else {
        console.log('[TradePersistence] Balance sincronizado en DB:', resolvedAccountId, newBalance);
      }
    } catch (err) {
      console.warn('[TradePersistence] Excepción persistiendo balance:', err);
    }
  },

  /**
   * Carga las posiciones abiertas ('OPEN') del usuario desde Supabase para Reconciliación en Frío (Cold Sync)
   */
  async fetchOpenPositions(accountId?: string, userId?: string, email?: string): Promise<PositionItem[]> {
    const resolvedAccountId = await this.resolveAccountId(accountId, userId, email);
    if (!resolvedAccountId) return [];

    try {
      const { data, error } = await supabase
        .from('account_trades')
        .select('*')
        .eq('account_id', resolvedAccountId)
        .eq('status', 'OPEN')
        .order('opened_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => {
        const entry = Number(row.entry_price) || 1;
        const sizeUnits = Number(row.size) || 0;
        const leverage = Number(row.leverage) || 10;
        const collateralUsdt = (sizeUnits * entry) / leverage;

        return {
          id: row.id,
          userId: row.user_id,
          symbol: row.symbol,
          exchange: row.exchange || 'binance',
          side: (row.side as 'LONG' | 'SHORT') || 'LONG',
          orderType: 'market',
          status: 'OPEN',
          size: `${sizeUnits.toFixed(4)} ${row.symbol.split('/')[0] || ''}`.trim(),
          sizeUnits,
          entry,
          entryTimestamp: new Date(row.opened_at).getTime(),
          mark: entry,
          slPrice: row.sl_price ? Number(row.sl_price) : null,
          tpPrice: row.tp_price ? Number(row.tp_price) : null,
          leverage,
          collateralUsdt,
          pnlUsdt: 0,
          pnlPercentNum: 0,
          pnl: '$0.00',
          pnlPercent: '0.00%',
          isProfit: true,
          createdAt: row.opened_at
        };
      });
    } catch (err) {
      console.warn('[TradePersistence] Error consultando posiciones abiertas de Supabase:', err);
      return [];
    }
  },

  /**
   * Carga el historial real de trades cerrados desde Supabase
   */
  async fetchAccountTradesHistory(accountId?: string, userId?: string, email?: string): Promise<ClosedTradeItem[]> {
    const resolvedAccountId = await this.resolveAccountId(accountId, userId, email);
    if (!resolvedAccountId) return [];

    try {
      const { data, error } = await supabase
        .from('account_trades')
        .select('*')
        .eq('account_id', resolvedAccountId)
        .eq('status', 'CLOSED')
        .order('closed_at', { ascending: false })
        .limit(100);

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => {
        const pnl = Number(row.realized_pnl) || 0;
        const entry = Number(row.entry_price) || 1;
        const sizeUnits = Number(row.size) || 0;
        const marginUsd = entry > 0 && row.leverage > 0 ? (sizeUnits * entry) / row.leverage : 1;
        const pnlPct = marginUsd > 0 ? (pnl / marginUsd) * 100 : 0;
        const isProfit = pnl >= 0;

        return {
          id: row.id,
          symbol: row.symbol,
          side: (row.side as 'LONG' | 'SHORT') || 'LONG',
          size: `${sizeUnits.toFixed(4)} ${row.symbol.split('/')[0] || ''}`.trim(),
          sizeUnits,
          entry,
          exitPrice: Number(row.exit_price) || entry,
          pnlUsdt: Number(pnl.toFixed(2)),
          pnlPercentNum: Number(pnlPct.toFixed(2)),
          pnlPercent: `${isProfit ? '+' : ''}${pnlPct.toFixed(2)}%`,
          isProfit,
          openedAt: row.opened_at,
          closedAt: row.closed_at || new Date().toISOString(),
          leverage: row.leverage || 10,
          closeReason: row.close_reason as 'TP' | 'SL' | 'MANUAL' | 'LIQUIDATION_BREACH'
        };
      });
    } catch (err) {
      console.warn('[TradePersistence] Error consultando historial de Supabase:', err);
      return [];
    }
  },

  /**
   * Elimina por completo todo el historial de trades de una cuenta en Supabase
   * y restablece el saldo oficial a 100K limpio.
   */
  async purgeAccountTrades(accountId?: string, userId?: string, email?: string): Promise<boolean> {
    try {
      const resolvedAccountId = await this.resolveAccountId(accountId, userId, email);
      if (!resolvedAccountId) return false;

      // 1. Eliminar todos los trades de la cuenta en public.account_trades
      const { error: delErr } = await supabase
        .from('account_trades')
        .delete()
        .eq('account_id', resolvedAccountId);

      if (delErr) {
        console.warn('[TradePersistence] Error purgando account_trades:', delErr.message);
      }

      // 2. Restablecer balance de 100K en public.trading_accounts
      const { error: resetErr } = await supabase
        .from('trading_accounts')
        .update({
          current_balance: 100000.00,
          equity: 100000.00,
          peak_equity: 100000.00,
          daily_start_equity: 100000.00,
          status: 'ACTIVE',
          breach_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedAccountId);

      if (resetErr) {
        console.warn('[TradePersistence] Error restableciendo balance en trading_accounts:', resetErr.message);
      }

      console.log('[TradePersistence] Historial purgado con éxito en Supabase para cuenta:', resolvedAccountId);
      return true;
    } catch (err) {
      console.warn('[TradePersistence] Excepción purgando trades:', err);
      return false;
    }
  }
};
