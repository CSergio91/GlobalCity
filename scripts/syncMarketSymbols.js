import pg from 'pg';
import https from 'https';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://eklipse_admin:eklipse_secret_db_2026_pass@localhost:5432/eklipse_funded';

const MEME_TOKENS = new Set([
  'PEPE', '1000PEPE', 'DOGE', 'SHIB', '1000SHIB', 'FLOKI', '1000FLOKI', 
  'BONK', '1000BONK', 'WIF', 'BOME', 'MEME', 'MYRO', 'TURBO', 'NEIRO', 
  '1000SATS', '1000RATS', 'BABYDOGE', 'CATI', 'DOGS', 'POPCAT', 'MOODENG', 
  'GOAT', 'PNUT', 'ACT', 'MEW', 'PEOPLE', 'BRETT'
]);

const MAJOR_TOKENS = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'LINK', 'DOT', 
  'NEAR', 'SUI', 'APT', 'LTC', 'BCH', 'TRX', 'MATIC', 'POL'
]);

const DEFI_TOKENS = new Set([
  'UNI', 'AAVE', 'MKR', 'SNX', 'CRV', 'LDO', 'PENDLE', 'INJ', 'RUNE', 
  'COMP', 'DYDX', '1INCH', 'SUSHI', 'JUP', 'RAY', 'ENA'
]);

const AI_TOKENS = new Set([
  'TAO', 'RENDER', 'FET', 'NEAR', 'WLD', 'GRT', 'ARKM', 'AI', 'IO', 'OCEAN', 'AGIX'
]);

const LAYER1_TOKENS = new Set([
  'SOL', 'SUI', 'APT', 'NEAR', 'AVAX', 'TON', 'SEI', 'TIA', 'FTM', 'KAS', 'ALGO', 'ICP', 'HBAR'
]);

function getCategory(base) {
  const u = base.toUpperCase();
  if (MEME_TOKENS.has(u) || u.includes('PEPE') || u.includes('DOGE') || u.includes('SHIB')) return 'MEME';
  if (MAJOR_TOKENS.has(u)) return 'MAJOR';
  if (AI_TOKENS.has(u)) return 'AI';
  if (DEFI_TOKENS.has(u)) return 'DEFI';
  if (LAYER1_TOKENS.has(u)) return 'LAYER1';
  return 'OTHERS';
}

async function sync() {
  console.log('[Sync] Conectando a PostgreSQL:', DATABASE_URL.replace(/:[^:]+@/, ':****@'));
  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  console.log('[Sync] Descargando catálogo público de Binance Futures (fapi.binance.com)...');
  const responseData = await new Promise((resolve, reject) => {
    https.get('https://fapi.binance.com/fapi/v1/exchangeInfo', (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });

  const pairs = (responseData.symbols || []).filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING');
  console.log(`[Sync] ${pairs.length} pares activos USDT localizados en Binance. Insertando en PostgreSQL...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let inserted = 0;

    for (const s of pairs) {
      const cat = getCategory(s.baseAsset);
      const priceFilter = s.filters ? s.filters.find(f => f.filterType === 'PRICE_FILTER') : null;
      const lotFilter = s.filters ? s.filters.find(f => f.filterType === 'LOT_SIZE') : null;
      const tickSize = priceFilter ? parseFloat(priceFilter.tickSize) : null;
      const minQty = lotFilter ? parseFloat(lotFilter.minQty) : null;

      await client.query(
        `INSERT INTO public.market_symbols (
          symbol, display_name, base_asset, quote_asset, category, status, is_enabled, tick_size, min_qty, source, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, 'BINANCE_FUTURES', NOW())
        ON CONFLICT (symbol) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          tick_size = EXCLUDED.tick_size,
          min_qty = EXCLUDED.min_qty,
          updated_at = NOW()`,
        [
          s.symbol,
          `${s.baseAsset}/${s.quoteAsset}`,
          s.baseAsset,
          s.quoteAsset,
          cat,
          s.status,
          tickSize,
          minQty
        ]
      );
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`[Sync] ¡Éxito! ${inserted} pares de Binance guardados y actualizados en la tabla market_symbols.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Sync] Error ejecutando transacción:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

sync().catch(err => {
  console.error('[Sync] Fallo crítico:', err);
  process.exit(1);
});
