import crypto from 'crypto';

/**
 * ============================================================================
 * EKLIPSE FUNDED — CRYPTOGRAPHIC JWT KEY GENERATOR
 * ============================================================================
 * Genera tokens JWT compatibles con PostgREST 12 y @supabase/supabase-js
 * con paridad 1:1 idéntica a Supabase Cloud para desarrollo local y VPS.
 * ============================================================================
 */

function generateSignature(headerB64, payloadB64, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
}

function buildToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = generateSignature(headerB64, payloadB64, secret);
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function generateInstitutionalKeys(existingSecret = null) {
  const secret = existingSecret || 'eklipse_jwt_secret_super_secure_institutional_32bytes_min';
  const now = Math.floor(Date.now() / 1000);
  const tenYearsExp = now + 315360000; // 10 años

  const anonToken = buildToken({
    role: 'anon',
    iss: 'supabase',
    iat: now,
    exp: tenYearsExp
  }, secret);

  const serviceRoleToken = buildToken({
    role: 'service_role',
    iss: 'supabase',
    iat: now,
    exp: tenYearsExp
  }, secret);

  return {
    jwtSecret: secret,
    anonKey: anonToken,
    serviceRoleKey: serviceRoleToken
  };
}

if (process.argv[1]?.endsWith('generateKeys.js')) {
  const args = process.argv.slice(2);
  const shouldWriteEnv = args.includes('--write-env');
  const secretArg = args.find(a => !a.startsWith('--')) || 'eklipse_jwt_secret_super_secure_institutional_32bytes_min';

  const keys = generateInstitutionalKeys(secretArg);

  console.log('\n===============================================================');
  console.log('🌘 EKLIPSE FUNDED — CREDENCIALES CRIPTOGRÁFICAS INSTITUCIONALES');
  console.log('===============================================================');
  console.log(`• JWT Secret (PGRST_JWT_SECRET):`);
  console.log(`  ${keys.jwtSecret}\n`);
  console.log(`• Clave Pública / Cliente (VITE_SUPABASE_ANON_KEY):`);
  console.log(`  ${keys.anonKey}\n`);
  console.log(`• Clave Maestra Servidor (SUPABASE_SERVICE_ROLE_KEY):`);
  console.log(`  ${keys.serviceRoleKey}`);

  if (shouldWriteEnv) {
    import('fs').then(fs => {
      import('path').then(path => {
        import('url').then(url => {
          const dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const envPath = path.resolve(dirname, '../.env');
          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, 'utf8');
            content = content.replace(/^VITE_SUPABASE_ANON_KEY=.*$/m, `VITE_SUPABASE_ANON_KEY=${keys.anonKey}`);
            content = content.replace(/^SUPABASE_SERVICE_ROLE_KEY=.*$/m, `SUPABASE_SERVICE_ROLE_KEY=${keys.serviceRoleKey}`);
            content = content.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${keys.jwtSecret}`);
            fs.writeFileSync(envPath, content);
            console.log('\n✔ Archivo .env actualizado con las nuevas credenciales criptográficas.');
          }
          console.log('===============================================================\n');
        });
      });
    });
  } else {
    console.log('===============================================================\n');
  }
}
