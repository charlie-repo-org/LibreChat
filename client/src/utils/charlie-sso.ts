import { dataService } from 'librechat-data-provider';
import type * as t from 'librechat-data-provider';

export interface CharlieUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'leader' | 'staff';
  division_id?: string;
  division_name?: string;
}

export interface CharlieAuthPayload {
  type: 'CHARLIE_AUTH_PAYLOAD';
  token: string;
  refreshToken?: string;
  user: CharlieUser;
  timestamp: number;
}

let isSynced = false;
let lastSyncedToken = '';

export function initCharlieSSO(onAuthSuccess: (data: t.TLoginResponse) => void): () => void {
  // Only activate when running inside an iframe (e.g. embedded in Charlie Platform)
  if (typeof window === 'undefined' || window.parent === window) {
    return () => {};
  }

  const handleMessage = async (event: MessageEvent) => {
    if (event.data?.type === 'CHARLIE_AUTH_PAYLOAD') {
      const payload = event.data as CharlieAuthPayload;

      if (!payload.user?.email) {
        return;
      }

      if (isSynced && lastSyncedToken === payload.token) {
        return;
      }

      try {
        lastSyncedToken = payload.token;
        const response = await dataService.charlieSSO(payload);
        if (response && response.token) {
          isSynced = true;
          onAuthSuccess(response);
        }
      } catch (err) {
        isSynced = false;
        console.error('[Charlie SSO] Failed to exchange SSO session:', err);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  const notifyReady = () => {
    try {
      window.parent.postMessage({ type: 'CHARLIE_APP_READY' }, '*');
    } catch (e) {
      // Ignore cross-origin postMessage errors
    }
  };

  // Multiple handshake ticks to ensure parent shell receives readiness
  notifyReady();
  const t1 = setTimeout(notifyReady, 100);
  const t2 = setTimeout(notifyReady, 300);
  const t3 = setTimeout(notifyReady, 800);
  const t4 = setTimeout(notifyReady, 1500);

  return () => {
    window.removeEventListener('message', handleMessage);
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
    clearTimeout(t4);
  };
}
