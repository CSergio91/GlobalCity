---
name: cloudflare-vps-deployment-and-security-hardening
description: "Guía maestra integral y operativa para Eklipse Funded: Adquisición de dominios a precio de costo en Cloudflare Registrar, blindaje perimetral gratuito de grado militar (Anti-DDoS, WAF, SSL Full Strict, WebSockets), aprovisionamiento de VPS Ubuntu (Nginx, PM2, Docker), erradicación de fuga de IP de origen con UFW, y despliegue continuo automatizado con GitHub Actions."
version: "1.0.0"
category: "DevOps, Cloud Security, Edge Architecture & VPS Hardening"
author: "Antigravity Infrastructure & Security Architect"
status: "Production Ready / Institutional Standard"
---

# Cloudflare Registrar, Edge Security, VPS Hardening & GitHub Actions CI/CD
### Manual Maestro de Infraestructura y Blindaje Perimetral para Eklipse Funded

---

## 1. Estrategia de Dominios para la Prop Firm (Cloudflare Registrar)

### 1.1. Recomendaciones de Dominios Institucionales
Para una empresa de fondeo cripto con terminal institucional propia, los nombres de dominio deben transmitir confianza bancaria, solidez y foco en capital:

| Dominio | TLD | Percepción de Marca | Caso de Uso |
| :--- | :--- | :--- | :--- |
| **`eklipsefunded.com`** | `.com` | **Primario (#1 Recomendado).** Máxima autoridad global y confianza retail. | Dominio principal de la plataforma, landing y terminal. |
| **`eklipsefunding.com`** | `.com` | Alternativo directo `.com`. | Redirección 301 al primario o dominio de contingencia. |
| **`eklipse.fund`** | `.fund` | TLD boutique especializado en fondos de inversión y prop trading. | Landing institucional para grandes capitales o B2B. |
| **`eklipse.pro`** | `.pro` | Corto, técnico y enfocado en operadores profesionales. | Enlace corto, portal de API o subdominio de terminal. |
| **`eklipsetrading.com`** | `.com` | Enfocado en la faceta operativa y ecosistema de trading. | Marca paraguas o campañas educativas. |

---

### 1.2. Por qué Comprar con Cloudflare Registrar (Cero Especulación)
A diferencia de registradores convencionales (GoDaddy, Namecheap, Hostinger) que cobran comisiones infladas y triplican el precio en la renovación:
1. **Precio al Costo Mayorista ICANN (*At-Cost Pricing*):** Cloudflare no añade margen de beneficio sobre los dominios. Un `.com` cuesta exactamente la tasa oficial de Verisign + ICANN (~$9.77 – $10.44 USD/año), y la renovación cuesta exactamente lo mismo de por vida.
2. **Privacidad WHOIS Gratuita de por Vida:** Tus datos personales (nombre, dirección, teléfono) están completamente ocultos sin cobros extras.
3. **DNSSEC con un Solo Clic:** Previene envenenamiento de caché DNS (*DNS spoofing*) mediante firmas criptográficas automatizadas.
4. **Dominio Nativo en el Edge:** Al comprarlo en Cloudflare, el dominio ya está integrado en la red CDN, sin necesidad de cambiar Nameservers ni esperar propagaciones de 24 horas.

---

### 1.3. Paso a Paso para la Compra en Cloudflare
1. Inicia sesión o crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com/).
2. En el menú lateral izquierdo, haz clic en **Domain Registration** > **Register Domains**.
3. Busca `eklipsefunded.com` (o el dominio elegido).
4. Introduce los datos de contacto corporativo y método de pago (Tarjeta o PayPal).
5. Confirma la compra. El dominio quedará activo de forma inmediata y vinculado a tu cuenta de Cloudflare.

---

## 2. Capa Gratuita de Blindaje Edge con Cloudflare (Protección Gratuita de Grado Militar)

Cloudflare ofrece en su plan gratuito el 95% de las capacidades que necesita una empresa de fondeo para resistir ciberataques y operar a latencia ultra-baja.

```
                           ARQUITECTURA DE TRÁFICO Y BLINDAJE EDGE
                           
 [ Traders / Internet ] 
         │
         ▼  (DNS Anycast de 300+ ciudades)
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        CLOUDFLARE EDGE NETWORK                         │
 │                                                                        │
 │  • Mitigación Anti-DDoS L3/L4/L7 Ilimitada (Automática)                 │
 │  • WAF (5 Reglas de Firewall Personalizadas Gratis)                    │
 │  • SSL/TLS: Modo "Full (Strict)" con Cifrado de Extremo a Extremo     │
 │  • WebSockets Proxy Ilimitado (/ws hacia el Trading Hub)               │
 │  • Caché Global Anycast + HTTP/3 (QUIC) + Brotli                       │
 │  • Ocultamiento de la IP Real del VPS (Nube Naranja: Proxied)          │
 └────────────────────────────────────────────────────────────────────────┘
         │
         │  (Túnel HTTPS cifrado solo hacia IPs de Cloudflare)
         ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              TU VPS LINUX                              │
 │                                                                        │
 │  • UFW Firewall: SOLO permite puertos 80/443 desde IPs de Cloudflare   │
 │  • Nginx: Desencripta SSL con Cloudflare Origin CA (15 años)          │
 │  • Frontend: /var/www/eklipse/dist (Compilado con Vite a 60 FPS)      │
 │  • Backend: PM2 ejecutando server/tradingHub.js en localhost:8080      │
 │  • Base de Datos: Docker PostgreSQL 16 + Redis 7                       │
 └────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. Configuración de Registros DNS (Nube Naranja / Proxied)
En el panel de Cloudflare, ve a **DNS** > **Records** y añade:

| Tipo | Nombre | Contenido (IP) | Proxy Status | TTL | Propósito |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (raíz) | `TU_IP_DEL_VPS` (ej. `195.201.x.x`) | **Proxied (Nube Naranja)** | Auto | Web principal `eklipsefunded.com` |
| **CNAME**| `www` | `eklipsefunded.com` | **Proxied (Nube Naranja)** | Auto | Alias `www.eklipsefunded.com` |
| **A** | `api` | `TU_IP_DEL_VPS` | **Proxied (Nube Naranja)** | Auto | Subdominio opcional API/WebSockets |

> **REGLA DE ORO:** NUNCA desactives la Nube Naranja en registros de cara al público. Si la nube está gris (*DNS Only*), cualquier atacante puede ver la IP pública de tu VPS en un simple comando `ping` y atacarlo directamente.

---

### 2.2. Configuración SSL/TLS: Modo Full (Strict) Obligatorio
1. Ve a **SSL/TLS** > **Overview**.
2. Selecciona **Full (strict)**.
   - *Off / Flexible:* Inseguro (Flexible conecta al VPS en HTTP sin cifrar, vulnerable a espionaje).
   - *Full:* Cifra pero no valida el certificado en el servidor.
   - *Full (strict):* Máximo estándar bancario. Requiere un certificado SSL válido en tu VPS (que Cloudflare te da gratis por 15 años).

---

### 2.3. Generación del Cloudflare Origin CA Certificate (15 Años Gratis)
Este certificado se instala en tu servidor Nginx para que Cloudflare y tu VPS se comuniquen de forma 100% cifrada:
1. Ve a **SSL/TLS** > **Origin Server**.
2. Haz clic en **Create Certificate**.
3. Deja seleccionadas las opciones por defecto:
   - Clave privada: RSA (2048) o ECDSA.
   - Nombres de host: `eklipsefunded.com`, `*.eklipsefunded.com`.
   - Validez: **15 years** (no tendrás que renovar certificados cada 3 meses como con Let's Encrypt).
4. Haz clic en **Create**.
5. Verás dos bloques de texto:
   - **Origin Certificate:** Guárdalo como `/etc/ssl/certs/eklipse_origin.pem`.
   - **Private Key:** Guárdalo como `/etc/ssl/private/eklipse_origin.key`.

---

### 2.4. WAF Gratuito: 5 Reglas Esenciales para Proteger una Prop Firm
Cloudflare incluye 5 reglas personalizadas gratuitas en **Security** > **WAF** > **Custom rules**:

#### Regla 1: Desafío a Amenazas y Bots Maliciosos Conocidos
- **Expresión:** `(cf.threat_score ge 15) or (cf.client.bot)`
- **Acción:** *Managed Challenge* (Muestra Turnstile invisible o puzzle anti-bot sin molestar a usuarios legítimos).

#### Regla 2: Blindaje de Rutas de Autenticación y Checkout
- **Expresión:** `(http.request.uri.path contains "/api/auth") or (http.request.uri.path contains "/login")`
- **Acción:** *Managed Challenge* si `cf.threat_score gt 5`.

#### Regla 3: Bloqueo de Scrapers y Herramientas Automatizadas sin Navegador
- **Expresión:** `(http.user_agent contains "curl") or (http.user_agent contains "python") or (http.user_agent contains "postman")` y `not (http.request.uri.path contains "/api/public")`
- **Acción:** *Block*.

#### Regla 4: Bloqueo Geográfico Quirúrgico (Opcional si hay países de alto fraude)
- Si detectas tráfico malicioso recurrente desde regiones donde no ofreces servicio, puedes aplicar *Managed Challenge* por país (`ip.geoip.country eq "XX"`).

---

### 2.5. Habilitar WebSockets para la Terminal de Trading
En Cloudflare, el soporte de WebSockets está activado por defecto en el plan gratuito para conexiones en puertos estándar (`443` HTTPS / `80` HTTP). Nginx redirige el path `/ws` hacia el puerto `8080` de Node.js sin ninguna limitación de ancho de banda.

---

## 3. Aprovisionamiento del VPS y Blindaje Anti-Fuga de IP

### 3.1. Elección del VPS (Hosting Propio sin Pagar Servidores Web)
- **Proveedores Recomendados:** Hetzner Cloud (Alemania/Finlandia, mejor relación calidad/precio: ~4 a 6 €/mes por 2 vCPU, 4GB RAM), Contabo, DigitalOcean o Vultr.
- **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS (x86_64).

---

### 3.2. Instalación de Paquetes Base en el VPS
Conéctate por SSH a tu VPS como `root`:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx fail2ban build-essential

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente para mantener el trading hub siempre vivo
sudo npm install -g pm2
```

---

### 3.3. BLINDAJE CRÍTICO: Firewall UFW Solo para IPs de Cloudflare (Zero Origin Leak)
Si dejas el puerto 80 y 443 abierto a cualquier IP, un atacante que descubra tu IP de VPS podrá saturar tu servidor evadiendo a Cloudflare. Debemos forzar que **SOLO Cloudflare pueda comunicarse con los puertos web de tu VPS**.

Crea el script de actualización de IPs de Cloudflare:
```bash
sudo nano /usr/local/bin/update-cloudflare-ufw.sh
```

Pega el siguiente contenido:
```bash
#!/bin/bash
# Script para autorizar únicamente rangos oficiales de Cloudflare en UFW

# Borrar reglas previas de HTTP y HTTPS
ufw status numbered | grep '(v4)' | grep -E '80|443' | awk -F"[][]" '{print $2}' | sort -nr | while read num; do
    echo "y" | ufw delete $num
done

# Obtener IPs oficiales IPv4 de Cloudflare
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
    ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare IPv4'
done

# Obtener IPs oficiales IPv6 de Cloudflare (si tienes IPv6 activo)
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do
    ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare IPv6'
done

# Mantener SSH accesible (asegúrate de cambiar 22 si usas puerto personalizado)
ufw allow 22/tcp comment 'SSH Administration'

# Habilitar firewall si no estaba activo
echo "y" | ufw enable
ufw reload
echo "UFW actualizado exitosamente: Solo Cloudflare tiene acceso a los puertos 80/443."
```

Dar permisos de ejecución y correr el script:
```bash
sudo chmod +x /usr/local/bin/update-cloudflare-ufw.sh
sudo /usr/local/bin/update-cloudflare-ufw.sh
```

Añadir al cron para que se actualice automáticamente cada semana:
```bash
(crontab -l 2>/dev/null; echo "0 4 * * 1 /usr/local/bin/update-cloudflare-ufw.sh > /dev/null 2>&1") | crontab -
```

---

### 3.4. Guardar los Certificados SSL de Cloudflare en el VPS
Crea los archivos con los certificados generados en el paso 2.3:
```bash
# Certificado público
sudo nano /etc/ssl/certs/eklipse_origin.pem
# (Pega el bloque del Origin Certificate y guarda con CTRL+O, ENTER, CTRL+X)

# Clave privada
sudo nano /etc/ssl/private/eklipse_origin.key
# (Pega el bloque de la Private Key y guarda)

# Permisos seguros para la clave privada
sudo chmod 600 /etc/ssl/private/eklipse_origin.key
```

---

## 4. Configuración de Nginx (Frontend SPA + WebSocket Hub + IP Real)

Crea la configuración de Nginx para el sitio:
```bash
sudo nano /etc/nginx/sites-available/eklipsefunded.com
```

Pega la siguiente configuración institucional:

```nginx
# Upstream para el motor de WebSocket y Trading Hub en Node.js
upstream trading_engine_backend {
    server 127.0.0.1:8080;
    keepalive 64;
}

# Redirección de HTTP a HTTPS (manejado internamente si Cloudflare envía HTTP)
server {
    listen 80;
    listen [::]:80;
    server_name eklipsefunded.com www.eklipsefunded.com;
    return 301 https://$host$request_uri;
}

# Servidor Principal HTTPS (Cifrado Full Strict con Cloudflare Origin CA)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name eklipsefunded.com www.eklipsefunded.com;

    # Certificados Cloudflare Origin CA (15 años)
    ssl_certificate /etc/ssl/certs/eklipse_origin.pem;
    ssl_certificate_key /etc/ssl/private/eklipse_origin.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # RESTAURAR IP REAL DEL CLIENTE (Para telemetría forense y anti-fraude)
    # Rangos oficiales de Cloudflare
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    # Cabeceras de Seguridad Institucional
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Raíz del Frontend (Compilado de Vite)
    root /var/www/eklipse/dist;
    index index.html;

    # Compresión GZIP nativa
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Enrutamiento para SPA (React / Router Context)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché Inmutable para Assets Estáticos (Imágenes, WebP, JS, CSS con hash)
    location ~* \.(js|css|webp|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # PROXY PARA WEBSOCKETS Y ENGINE (Trading Hub en /ws o /socket.io)
    location /ws {
        proxy_pass http://trading_engine_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Tiempos de espera extendidos para WebSockets de trading en vivo
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # API Proxy hacia el Backend de Node.js
    location /api/ {
        proxy_pass http://trading_engine_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar el sitio y reiniciar Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/eklipsefunded.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Pipeline CI/CD Automatizado con GitHub Actions (Zero Downtime)

Con este flujo, cada vez que hagas `git push` a la rama `main` en tu repositorio de GitHub, el servidor compilará automáticamente la aplicación y reiniciará los servicios sin que tengas que entrar por SSH manualmente.

### 5.1. Configuración de Llave SSH para GitHub Actions en el VPS
En tu VPS:
```bash
# Crear directorio web
sudo mkdir -p /var/www/eklipse
sudo chown -R $USER:$USER /var/www/eklipse

# Generar par de llaves ed25519 para el bot de despliegue
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# Autorizar la llave pública
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Mostrar la llave privada (cópiala completa, incluyendo BEGIN y END)
cat ~/.ssh/github_deploy
```

---

### 5.2. Añadir Secretos en el Repositorio de GitHub
En tu repositorio de GitHub, ve a **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

1. `SSH_HOST`: La IP pública de tu VPS (ej. `195.201.x.x`).
2. `SSH_USER`: Tu usuario en el VPS (ej. `root` o tu usuario sudo).
3. `SSH_KEY`: El contenido de la llave privada que copiaste (`cat ~/.ssh/github_deploy`).
4. `SSH_PORT`: `22` (o tu puerto SSH personalizado).

---

### 5.3. Crear el Workflow de Despliegue en el Repositorio
Crea el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy Eklipse Funded to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Build & Zero-Downtime Deploy
    runs-on: ubuntu-latest

    steps:
      - name: 1. Checkout Repository
        uses: actions/checkout@v4

      - name: 2. Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 3. Install Dependencies & Build Frontend
        run: |
          npm ci
          npm run build

      - name: 4. Setup SSH Agent
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_KEY }}

      - name: 5. Deploy Frontend to VPS (/var/www/eklipse/dist)
        run: |
          # Sincronizar bundle compilado dist/ al VPS
          rsync -avz -e "ssh -p ${{ secrets.SSH_PORT }} -o StrictHostKeyChecking=no" --delete dist/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/var/www/eklipse/dist/

      - name: 6. Deploy Server Core & Reload PM2
        run: |
          # Sincronizar directorio de servidor y dependencias
          rsync -avz -e "ssh -p ${{ secrets.SSH_PORT }} -o StrictHostKeyChecking=no" server/ package.json ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/var/www/eklipse/server/

          # Ejecutar instalación y recarga sin tiempo de inactividad
          ssh -p ${{ secrets.SSH_PORT }} -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd /var/www/eklipse/server
            npm install --production
            
            # Iniciar o recargar el demonio con PM2
            pm2 describe eklipse-trading-hub > /dev/null
            if [ $? -eq 0 ]; then
              pm2 reload eklipse-trading-hub
            else
              pm2 start tradingHub.js --name "eklipse-trading-hub" --max-memory-restart 500M
              pm2 save
            fi
            
            sudo systemctl reload nginx
          EOF
```

---

## 6. Lista de Verificación Forense Pre-Lanzamiento (Checklist)

Antes de abrir el checkout y aceptar traders con cuentas de evaluación:

- [ ] **Dominio:** Comprado en Cloudflare Registrar con WHOIS privado y DNSSEC activo.
- [ ] **DNS Proxy:** Registros `A` y `CNAME` con Nube Naranja (*Proxied*) activada.
- [ ] **Modo SSL:** Configurado en `Full (strict)`.
- [ ] **Origin Certificate:** Instalado en `/etc/ssl/certs/eklipse_origin.pem` con permisos `600` en la key.
- [ ] **Firewall UFW:** Solo permite tráfico web en 80/443 desde las IPs de Cloudflare (`update-cloudflare-ufw.sh` en cron semanal).
- [ ] **Restauración de IP:** Nginx configurado con `real_ip_header CF-Connecting-IP` para auditar IPs reales de traders en auditoría forense.
- [ ] **WebSockets:** Conexión `/ws` verificada con `proxy_http_version 1.1` y headers de upgrade.
- [ ] **CI/CD:** GitHub Actions probado con éxito tras un `push` a la rama `main`.
- [ ] **PM2:** Servicio `eklipse-trading-hub` configurado con inicio automático al reiniciar el servidor (`pm2 startup` y `pm2 save`).
