import { ClosedTradeItem } from '../components/terminal/types';

/**
 * Genera y descarga un archivo CSV con el historial de operaciones de trading
 * Incluye cabecera UTF-8 BOM para soporte total en Microsoft Excel y LibreOffice
 */
export const exportTradesToCSV = (
  trades: ClosedTradeItem[],
  isEs: boolean = true,
  customFilename?: string
): void => {
  if (!trades || trades.length === 0) return;

  const headers = isEs
    ? [
        'Ticket ID',
        'Fecha Apertura',
        'Fecha Cierre',
        'Par',
        'Lado',
        'Apalancamiento',
        'Tamaño',
        'Precio Entrada',
        'Precio Salida',
        'Motivo Cierre',
        'PnL Realizado (USDT)',
        'PnL (%)'
      ]
    : [
        'Ticket ID',
        'Open Time',
        'Close Time',
        'Symbol',
        'Side',
        'Leverage',
        'Size',
        'Entry Price',
        'Exit Price',
        'Close Reason',
        'Realized PnL (USDT)',
        'PnL (%)'
      ];

  const rows = trades.map((t) => [
    `"${t.id}"`,
    `"${t.openedAt ? new Date(t.openedAt).toISOString().replace('T', ' ').substring(0, 19) : ''}"`,
    `"${t.closedAt ? new Date(t.closedAt).toISOString().replace('T', ' ').substring(0, 19) : ''}"`,
    `"${t.symbol}"`,
    `"${t.side}"`,
    `"${t.leverage || 1}x"`,
    `"${t.size}"`,
    Number(t.entry || 0).toFixed(4),
    Number(t.exitPrice || 0).toFixed(4),
    `"${t.closeReason || 'MANUAL'}"`,
    Number(t.pnlUsdt || 0).toFixed(2),
    `"${t.pnlPercent || (t.pnlPercentNum ? t.pnlPercentNum.toFixed(2) + '%' : '0%')}"`
  ]);

  // Anteponer BOM UTF-8 (\uFEFF) para visualización nativa correcta en Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', customFilename || `ZYTI_Trade_History_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
