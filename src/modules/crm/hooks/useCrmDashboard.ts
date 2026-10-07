/**
-- ============================================================================
-- ZYTI TRADE / PROP FIRM CRM — HOOK MAESTRO ERP
-- Estado reactivo de módulos ERP, Traders reales y Cuentas Demo
-- ============================================================================
*/

import { useState, useEffect, useCallback, useMemo } from 'react';
import { crmService } from '../api/crmService';
import { 
  ApiCredentialEntity, 
  CrmKpiStats, 
  CrmModuleId, 
  MonitoredPosition, 
  RiskRuleConfigEntity, 
  TraderClientEntity 
} from '../types/crm.types';
import { zytiTradingClient } from '../../../core/trading/gateway/TradingWebSocketClient';

export function useCrmDashboard() {
  const [activeModule, setActiveModule] = useState<CrmModuleId>('hub');
  const [kpis, setKpis] = useState<CrmKpiStats | null>(null);
  const [traders, setTraders] = useState<TraderClientEntity[]>([]);
  const [riskRules, setRiskRules] = useState<RiskRuleConfigEntity[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [selectedTraderForAudit, setSelectedTraderForAudit] = useState<TraderClientEntity | null>(null);
  const [apiCredentials, setApiCredentials] = useState<ApiCredentialEntity[]>([]);
  const [monitoredPositions, setMonitoredPositions] = useState<MonitoredPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<RiskRuleConfigEntity | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiCredentialEntity | null>(null);

  // Carga inicial de datos reales
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tradersRes, rulesRes, keysRes] = await Promise.all([
        crmService.getTradersClients(),
        crmService.getRiskRules(),
        crmService.getApiCredentials()
      ]);

      setTraders(tradersRes);
      if (tradersRes.length > 0) {
        setSelectedTraderForAudit(prev => prev ? tradersRes.find(t => t.id === prev.id) || prev : tradersRes[0]);
      }
      setRiskRules(rulesRes);
      if (rulesRes.length > 0) {
        setSelectedRuleId(rulesRes[0].id);
      }
      setApiCredentials(keysRes);

      // Métricas y posiciones en vivo basadas en el Risk Daemon del Servidor y Supabase
      const kpisRes = await crmService.getKpiStats(tradersRes.length);
      setKpis(kpisRes);
      const livePositions = await crmService.getLiveMonitoredPositions();
      setMonitoredPositions(livePositions);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Conexión en tiempo real con el Centinela de Riesgo del Servidor (WebSocket + Risk Daemon)
  useEffect(() => {
    if (!zytiTradingClient.isConnected()) {
      zytiTradingClient.connect('crm_admin_watcher');
    }

    const timer = setTimeout(() => {
      zytiTradingClient.sendAction({ action: 'SUBSCRIBE_CRM_RISK' });
    }, 300);

    const unsubscribe = zytiTradingClient.onRawMessage((msg) => {
      if (msg.type === 'CRM_MONITORED_POSITIONS' && Array.isArray(msg.positions)) {
        setMonitoredPositions(msg.positions);
      } else if (msg.type === 'CRM_ACCOUNT_BREACHED' && msg.data) {
        const breach = msg.data;
        setMonitoredPositions((prev) =>
          prev.map((pos) =>
            pos.accountNumber === breach.accountNumber
              ? { ...pos, ruleHealth: 'BREACHED', breachReason: breach.reason }
              : pos
          )
        );
      } else if (msg.type === 'CRM_DAILY_ROLLOVER' && msg.data) {
        const rollover = msg.data;
        setTraders((prev) =>
          prev.map((t) =>
            (t.id === rollover.accountId || t.accountNumber === rollover.accountNumber)
              ? {
                  ...t,
                  dailyStartEquity: rollover.newDailyStartEquity,
                  dailyStartDate: rollover.date,
                  tradingDaysCount: rollover.tradingDaysCount,
                  dailyDrawdownPct: 0
                }
              : t
          )
        );
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const activeRule = useMemo(() => {
    return riskRules.find(r => r.id === selectedRuleId) || riskRules[0];
  }, [riskRules, selectedRuleId]);

  // Modificar tamaño de cuenta de un trader
  const handleUpdateTraderAccountSize = async (traderId: string, newSize: number) => {
    await crmService.updateTraderAccountSize(traderId, newSize);
    setTraders(prev => prev.map(t => {
      if (t.id === traderId) {
        return {
          ...t,
          accountSize: newSize,
          currentBalance: newSize + t.floatingPnl,
          equity: newSize + t.floatingPnl
        };
      }
      return t;
    }));

    // Actualizar también en el Risk Engine si está presente
    setMonitoredPositions(prev => prev.map(p => {
      if (p.id.includes(traderId)) {
        return {
          ...p,
          accountSize: newSize
        };
      }
      return p;
    }));
  };

  // Resetear balance de cuenta demo en DB Supabase, Terminal y Servidor
  const handleResetTraderBalance = async (traderId: string, customSize?: number) => {
    const target = traders.find(t => t.id === traderId);
    const balanceToSet = customSize || target?.accountSize || 100000;

    await crmService.resetTraderAccount(traderId, balanceToSet);

    setTraders(prev => prev.map(t => {
      if (t.id === traderId) {
        return {
          ...t,
          currentBalance: balanceToSet,
          equity: balanceToSet,
          floatingPnl: 0,
          dailyDrawdownPct: 0,
          totalDrawdownPct: 0,
          status: 'ACTIVE'
        };
      }
      return t;
    }));

    // Limpiar posiciones en el Sentinel
    setMonitoredPositions(prev => prev.filter(p => !p.id.includes(traderId) && !p.accountNumber.includes(traderId)));
  };

  // Modificar rol de un usuario (trader, soporte, admin, marketing)
  const handleUpdateTraderRole = async (traderId: string, newRole: any) => {
    await crmService.updateTraderRole(traderId, newRole);
    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, role: newRole } : t));
  };

  // Modificar estado de una cuenta (ACTIVE, WARNING, BREACHED, FROZEN)
  const handleUpdateTraderStatus = async (traderId: string, newStatus: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN') => {
    await crmService.updateTraderStatus(traderId, newStatus);
    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, status: newStatus } : t));
    // Reflejar de inmediato en el Sentinel
    setMonitoredPositions(prev => prev.map(p => {
      if (p.id.includes(traderId) || p.accountNumber.includes(traderId)) {
        return {
          ...p,
          ruleHealth: newStatus === 'BREACHED' ? 'BREACHED' : newStatus === 'WARNING' ? 'WARNING' : 'HEALTHY'
        };
      }
      return p;
    }));
  };

  // Acciones de Reglas de Riesgo
  const handleSaveRule = async (ruleData: Partial<RiskRuleConfigEntity>) => {
    const saved = await crmService.saveRiskRule(ruleData);
    setRiskRules(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setSelectedRuleId(saved.id);
    setIsRuleModalOpen(false);
    setEditingRule(null);

    // Sincronizar regla en caliente con el Risk Daemon del Servidor
    zytiTradingClient.sendAction({
      action: 'UPDATE_RISK_RULE',
      rule: saved
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    await crmService.deleteRiskRule(ruleId);
    setRiskRules(prev => prev.filter(r => r.id !== ruleId));
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(riskRules.find(r => r.id !== ruleId)?.id || '');
    }
  };

  // Acciones de API Credentials
  const handleCreateApiKey = async (params: {
    name: string;
    keyType: any;
    scopes: any;
    ipWhitelist: string[];
    rateLimitRpm: number;
  }) => {
    const created = await crmService.createApiCredential(params);
    setApiCredentials(prev => [created, ...prev]);
    setNewlyCreatedKey(created);
  };

  const handleToggleApiKey = async (id: string, isActive: boolean) => {
    await crmService.toggleApiKeyStatus(id, isActive);
    setApiCredentials(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));
  };

  const handleDeleteApiKey = async (id: string) => {
    await crmService.deleteApiKey(id);
    setApiCredentials(prev => prev.filter(c => c.id !== id));
  };

  const handleEmergencyLiquidation = (positionId: string) => {
    const pos = monitoredPositions.find(p => p.id === positionId);
    setMonitoredPositions(prev => prev.filter(p => p.id !== positionId));

    // Despachar orden de liquidación forzosa real al Risk Daemon
    zytiTradingClient.sendAction({
      action: 'EMERGENCY_LIQUIDATE',
      accountId: pos?.accountNumber || pos?.id,
      positionId
    });
  };

  return {
    activeModule,
    setActiveModule,
    kpis,
    traders,
    selectedTraderForAudit,
    setSelectedTraderForAudit,
    riskRules,
    selectedRuleId,
    setSelectedRuleId,
    activeRule,
    apiCredentials,
    monitoredPositions,
    isLoading,
    isRuleModalOpen,
    setIsRuleModalOpen,
    editingRule,
    setEditingRule,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    newlyCreatedKey,
    setNewlyCreatedKey,
    handleUpdateTraderAccountSize,
    handleUpdateTraderRole,
    handleUpdateTraderStatus,
    handleResetTraderBalance,
    handleSaveRule,
    handleDeleteRule,
    handleCreateApiKey,
    handleToggleApiKey,
    handleDeleteApiKey,
    handleEmergencyLiquidation,
    refreshData: loadData
  };
}
