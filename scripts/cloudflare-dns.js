// scripts/cloudflare-dns.js
// Automatización para creación/actualización de registros DNS en Cloudflare
import dotenv from 'dotenv';
dotenv.config();

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.argv[2];
const ZONE_NAME = process.env.CLOUDFLARE_ZONE_NAME || 'eklipsefunded.com';
const SUBDOMAIN = process.env.CLOUDFLARE_SUBDOMAIN || process.argv[3] || 'dashapp';
const TARGET = process.env.CLOUDFLARE_TARGET || process.argv[4] || 'eklipsefunded.com';

if (!API_TOKEN) {
  console.log(`
Uso del script de Cloudflare DNS:
  node scripts/cloudflare-dns.js <TU_CLOUDFLARE_API_TOKEN> [subdominio] [target]

Ejemplo:
  node scripts/cloudflare-dns.js cf_token_123456789 dashapp eklipsefunded.com
  `);
  process.exit(1);
}

async function run() {
  console.log(`🔍 1. Buscando Zone ID para ${ZONE_NAME}...`);
  const zoneRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(ZONE_NAME)}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const zoneData = await zoneRes.json();
  if (!zoneData.success || !zoneData.result.length) {
    console.error('❌ Error buscando zona en Cloudflare:', zoneData.errors);
    process.exit(1);
  }

  const zoneId = zoneData.result[0].id;
  console.log(`✔ Zona encontrada: ${zoneId}`);

  const recordName = `${SUBDOMAIN}.${ZONE_NAME}`;
  console.log(`🔍 2. Verificando si existe el registro ${recordName}...`);

  const listRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${recordName}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const listData = await listRes.json();
  const existing = listData.result?.[0];

  const payload = {
    type: 'CNAME',
    name: SUBDOMAIN,
    content: TARGET,
    ttl: 1, // Auto
    proxied: true // Proxy naranja activado (WAF + SSL)
  };

  if (existing) {
    console.log(`🔄 3. Actualizando registro existente (ID: ${existing.id})...`);
    const updateRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const updateData = await updateRes.json();
    if (updateData.success) {
      console.log(`🎉 ¡Registro CNAME actualizado con éxito!: ${recordName} -> ${TARGET} (Proxied: true)`);
    } else {
      console.error('❌ Error actualizando registro:', updateData.errors);
    }
  } else {
    console.log(`➕ 3. Creando nuevo registro CNAME...`);
    const createRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const createData = await createRes.json();
    if (createData.success) {
      console.log(`🎉 ¡Registro CNAME creado con éxito!: ${recordName} -> ${TARGET} (Proxied: true)`);
    } else {
      console.error('❌ Error creando registro:', createData.errors);
    }
  }
}

run().catch(console.error);
