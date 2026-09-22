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

Saat ini Charlie Platform mengirimkan event `postMessage` saat micro-app dibuka di dalam iframe:

```javascript
{
  type: "CHARLIE_AUTH_PAYLOAD",
  token: "eyJhbGciOi...",           // Supabase JWT
  refreshToken: "...",
  user: {
    id: "uuid-string",
    name: "Agil Fahmi",
    email: "agil@converion.id",
    role: "super_admin"
  }
}
```

### Apakah LibreChat Bisa Login Otomatis Berdasarkan User Profile Charlie?
**Bisa.** Ada 2 pendekatan implementasi:

---

### Opsi 1: Menggunakan OpenID Connect (OIDC) / Supabase OAuth (Native LibreChat)
LibreChat memiliki modul OIDC bawaan yang bisa langsung dihubungkan ke Supabase Auth milik Charlie Platform:

1. **Di Supabase Project Charlie Platform**:
   - Dapatkan `SUPABASE_URL` dan konfigurasi OAuth provider.
2. **Di Environment Dokploy LibreChat**:
   ```env
   OPENID_CLIENT_ID=your-supabase-or-charlie-client-id
   OPENID_CLIENT_SECRET=your-supabase-client-secret
   OPENID_ISSUER=https://<supabase-project-id>.supabase.co/auth/v1
   OPENID_SESSION_SECRET=super_secret_session_key
   OPENID_BUTTON_LABEL=Login with Charlie Account
   OPENID_AUTO_REDIRECT=true # Otomatis redirect login jika belum ada session
   ```
3. **Keuntungan**:
   - Standar industri (OAuth2/OIDC).
   - Akun user di LibreChat otomatis dibuat sesuai email & nama profil Charlie saat pertama kali masuk.

---

### Opsi 2: SSO Listener via `postMessage` (Custom Handler di LibreChat Client)
Mirip dengan template `charlie-sso.ts` pada micro-app standard Charlie:

1. Client LibreChat (`client/src/`) mendengarkan event `CHARLIE_AUTH_PAYLOAD`.
2. Token JWT / email user dikirim ke endpoint backend (`/api/auth/charlie-sso`) untuk otomatis login / sign-in tanpa interaksi manual dari user.
3. User langsung masuk ke tampilan chat dengan profile name yang sama dengan Charlie Platform.
