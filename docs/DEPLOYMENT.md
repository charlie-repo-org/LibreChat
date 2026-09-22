# LibreChat Deployment Guide (Dokploy & Charlie Platform)

Dokumentasi deployment LibreChat sebagai micro-application yang terintegrasi di dalam ekosistem **Charlie Platform (`converion.cc`)** menggunakan **Dokploy**.

---

## 1. Arsitektur Deployment

```
Charlie Platform (https://converion.cc)
        │
        ▼ (Iframe Embedding via Subdomain)
LibreChat Service (https://chat.converion.cc)
        │
        ├──► Dokploy MongoDB (chat-mongodb:27017/LibreChat)
        └──► Aliyun Model Studio / MaaS (Qwen & LLaMA Models)
```

---

## 2. Spesifikasi Layanan & Komponen

| Komponen | Spesifikasi / Nilai | Keterangan |
|---|---|---|
| **Subdomain** | `https://chat.converion.cc` | Domain publik akses chat |
| **Container Port** | `3080` | Internal Node.js Express server |
| **Database** | MongoDB (`librechat-chatmongo-b3zmcu`) | Database users, convos, messages |
| **Custom AI Provider** | Alibaba Cloud MaaS (Compatible-mode) | Model Qwen & LLaMA |
| **Config File** | `/app/librechat.yaml` | Konfigurasi custom endpoint |

---

## 3. Konfigurasi Environment (`.env` / Dokploy Environment)

```env
# Server Binding
HOST=0.0.0.0
PORT=3080

# Database
MONGO_URI=mongodb://mongo:Donalbebek1@librechat-chatmongo-b3zmcu:27017/LibreChat?authSource=admin&directConnection=true

# Domain
DOMAIN_CLIENT=https://chat.converion.cc
DOMAIN_SERVER=https://chat.converion.cc

# Process & Auth Secrets
SCHEDULES_SINGLE_PROCESS=true
JWT_SECRET=super_secret_jwt_key_at_least_32_chars_long
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_32_chars_long
CREDS_KEY=f34be40772a19967722023d04a3f8393a1b2c3d4e5f60718293a4b5c6d7e8f90
CREDS_IV=e1234567890123456789012345678901
ALLOW_REGISTRATION=true

# Branding & Custom Title / Footer
APP_TITLE=Converion AI
CUSTOM_FOOTER=[Converion AI](https://converion.cc) - Enterprise AI Platform

# Custom Endpoint & Config Path
CONFIG_PATH=/app/librechat.yaml
CUSTOM_AI_API_KEY=sk-ws-H.DDRRYXR.xxxxxxxxxxx

# Iframe Embedding ke Charlie Platform
X_FRAME_OPTIONS=off
CSP_FRAME_ANCESTORS="'self' https://converion.cc https://*.converion.cc http://localhost:*"
```

---

## 4. Konfigurasi Custom AI Models & Memory (`librechat.yaml`)

File ditaruh pada root repository atau di-mount ke `/app/librechat.yaml`:

```yaml
version: 1.1.5
cache: true

# Aktifkan Long-Term Memory untuk User & Agent
memory:
  disabled: false
  tokenLimit: 10000
  personalize: true

endpoints:
  custom:
    - name: "Custom-AI"
      apiKey: "${CUSTOM_AI_API_KEY}"
      baseURL: "https://ws-bw7mh172fl7pvbnc.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1"
      models:
        default:
          - "qwen3.8-max"
          - "qwen3.8-flash"
          - "deepseek-v4.1-flash"
        fetch: false
      titleConvo: true
      titleMethod: "completion"
      titleModel: "qwen3.8-flash"
      modelDisplayLabel: "Converion AI"
```

---

## 5. Troubleshooting Cepat

1. **Custom Model Tidak Muncul:**
   - Pastikan `CONFIG_PATH=/app/librechat.yaml` ada di Environment Variables.
   - Pastikan `fetch: false` di `librechat.yaml`.
   - Cek log startup: `Custom config file loaded: /app/librechat.yaml`.

2. **Iframe Gagal Terbuka / Blank:**
   - Hapus middleware Traefik manual (seperti `allow-iframe-charlie@file`) agar tidak merusak script/CSS Vite.
   - Pastikan `X_FRAME_OPTIONS=off` dan `CSP_FRAME_ANCESTORS` sudah terpasang di Environment.
