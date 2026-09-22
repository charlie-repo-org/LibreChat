export interface CharlieUserPayload {
  id?: string;
  name?: string;
  email: string;
  role?: string;
  division_id?: string;
  division_name?: string;
}

export interface CharlieSSORequestBody {
  type?: string;
  token?: string;
  refreshToken?: string;
  user?: CharlieUserPayload;
  timestamp?: number;
}

export function validateCharlieSSOPayload(body: unknown): {
  valid: boolean;
  email?: string;
  name?: string;
  user?: CharlieUserPayload;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const payload = body as CharlieSSORequestBody;
  const user = payload.user;

  if (!user || typeof user !== 'object' || !user.email || typeof user.email !== 'string') {
    return { valid: false, error: 'Missing or invalid user email in Charlie SSO payload' };
  }

  const email = user.email.toLowerCase().trim();
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }

  const name = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : email.split('@')[0];

  return {
    valid: true,
    email,
    name,
    user,
  };
}
