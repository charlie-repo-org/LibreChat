# Charlie Platform Micro-App & SSO Integration Guide

Dokumentasi ini menjelaskan integrasi LibreChat sebagai Micro-App di dalam **Charlie Platform (`https://converion.cc`)**, termasuk dukungan Iframe dan mekanisme SSO / Login otomatis berbasis user profil Charlie Platform.

---

## 1. Iframe Embedding Setup

Agar LibreChat dapat di-embed secara mulus di dalam dashboard Charlie Platform:

### Konfigurasi Environment (Dokploy)
```env
X_FRAME_OPTIONS=off
CSP_FRAME_ANCESTORS="'self' https://converion.cc https://*.converion.cc http://localhost:*"
```

### Registrasi di Charlie Module Catalog
1. Login ke `https://converion.cc` sebagai Super Admin.
2. Buka menu **Module Catalog & Permissions (`/modules`)** $\rightarrow$ **Register Application**:
   - **Title**: `AI Assistant` (atau `LibreChat`)
   - **Slug**: `ai-chat`
   - **Subdomain URL**: `https://chat.converion.cc`
   - **Icon**: `Bot` / `MessageSquare`
   - **Category**: `AI & Automation`
   - **Active**: `true`
3. Atur hak akses user di **Permission Matrix**.

---

## 2. Mekanisme Login Berdasarkan User Platform Profile (SSO)

LibreChat telah diintegrasikan dengan arsitektur SSO Charlie Platform berbasis `postMessage` (meniru arsitektur `Charlie-KPI-Tracking`):

### Alur Autentikasi:
```
1. Charlie Platform (converion.cc) me-load iframe LibreChat (chat.converion.cc)
2. LibreChat Client mengirim sinyal: CHARLIE_APP_READY
3. Charlie Platform membalas: CHARLIE_AUTH_PAYLOAD (berisi email, name, token)
4. LibreChat Client memanggil API: POST /api/auth/charlie-sso
5. LibreChat Server:
   - Mencari atau membuat akun user di MongoDB secara otomatis
   - Mengenerate session token LibreChat
6. LibreChat Client menerima session dan langsung masuk ke Chat (tanpa halaman login)
```

### File-file Terkait Integrasi:
- **Client Helper:** `client/src/utils/charlie-sso.ts`
- **Client Context:** `client/src/hooks/AuthContext.tsx`
- **API Endpoint:** `api/server/routes/auth.js` (`POST /api/auth/charlie-sso`)
- **API Controller:** `api/server/controllers/auth/CharlieSSOController.js`
- **Validation:** `packages/api/src/auth/charlieSSO.ts`
