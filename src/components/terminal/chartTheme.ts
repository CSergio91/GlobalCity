import { DeepPartial, Styles, Chart } from 'klinecharts';
import { ALL_INDICATORS } from './types';

export const ZYTI_CHART_THEME: any = {
  grid: {
    show: true,
    horizontal: { show: true, size: 1, color: 'rgba(100,116,139,0.12)', style: 'dashed' as any, dashedValue: [4,4] },
    vertical: { show: true, size: 1, color: 'rgba(100,116,139,0.12)', style: 'dashed' as any, dashedValue: [4,4] }
  },
  candle: {
    type: 'candle_solid' as any,
    bar: {
      upColor: '#16a34a', downColor: '#dc2626', noChangeColor: '#94a3b8',
      upBorderColor: '#16a34a', downBorderColor: '#dc2626', noChangeBorderColor: '#94a3b8',
      upWickColor: '#16a34a', downWickColor: '#dc2626', noChangeWickColor: '#94a3b8'
    },
    priceMark: {
      show: true,
      high: { show: true, color: '#64748b', textOffset: 5, textSize: 10 },
      low:  { show: true, color: '#64748b', textOffset: 5, textSize: 10 },
      last: {
        show: true, upColor: '#16a34a', downColor: '#dc2626', noChangeColor: '#94a3b8',
        line: { show: true, style: 'dashed' as any, dashedValue: [4,4], size: 1 },
        text: { show: true, style: 'fill' as any, size: 11, paddingLeft: 5, paddingTop: 3, paddingRight: 5, paddingBottom: 3, color: '#ffffff', borderRadius: 4 }
      }
    },
    tooltip: { showRule: 'none' as any, showType: 'standard' as any, text: { size: 9, color: '#475569' } }
  },
  indicator: {
    lines: [{ color: '#2563eb', size: 1.5 }, { color: '#d97706', size: 1.5 }, { color: '#db2777', size: 1.5 }, { color: '#7c3aed', size: 1.5 }],
    tooltip: { showRule: 'always' as any, showType: 'standard' as any, text: { size: 9, color: '#475569' } }
  },
  xAxis: {
    show: true, size: 'auto' as any,
    axisLine: { show: true, color: 'rgba(100,116,139,0.2)', size: 1 },
    tickText: { show: true, color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
    tickLine: { show: true, size: 1, length: 3, color: 'rgba(100,116,139,0.2)' }
  },
  yAxis: {
    show: true, size: 'auto' as any, position: 'right' as any,
    axisLine: { show: true, color: 'rgba(100,116,139,0.2)', size: 1 },
    tickText: { show: true, color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
    tickLine: { show: true, size: 1, length: 3, color: 'rgba(100,116,139,0.2)' }
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: { show: true, style: 'dashed' as any, dashedValue: [4,4], size: 1, color: 'rgba(217,119,6,0.5)' },
      text: { show: true, color: '#0f172a', size: 10, family: 'JetBrains Mono, monospace', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderSize: 1, borderColor: 'rgba(217,119,6,0.5)', borderRadius: 3, backgroundColor: '#fef9ee' }
    },
    vertical: {
      show: true,
      line: { show: true, style: 'dashed' as any, dashedValue: [4,4], size: 1, color: 'rgba(217,119,6,0.5)' },
      text: { show: true, color: '#0f172a', size: 10, family: 'JetBrains Mono, monospace', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderSize: 1, borderColor: 'rgba(217,119,6,0.5)', borderRadius: 3, backgroundColor: '#fef9ee' }
    }
  }
};

export const applyIndicatorsToChart = (chart: any, indicators: string[]): void => {
  if (!chart) return;
  const hasOhlc = indicators.includes('OHLC');
  chart.setStyles({ candle: { tooltip: { showRule: (hasOhlc ? 'always' : 'none') as any, text: { size: 9, color: '#475569' } } } });
  indicators.forEach((name) => {
    if (name === 'OHLC') return;
    const indOption = ALL_INDICATORS.find((i) => i.name === name);
    if (!indOption) return;
    const targetPane = indOption.paneId || (indOption.category === 'main' ? 'candle_pane' : `pane_${name.toLowerCase()}`);
    try { chart.createIndicator(name, false, { id: targetPane }); } catch (_) {}
  });
};
