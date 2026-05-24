// Single-admin auth: password -> signed JWT in an httpOnly cookie.
import { SignJWT, jwtVerify } from 'jose';

// Simple setup: you only have to set BLOG_ADMIN_PASSWORD. If you don't set a
// separate BLOG_AUTH_SECRET, we sign sessions with the password itself — one
// less env var to configure or forget. Set BLOG_AUTH_SECRET only if you want
// the signing key decoupled from the password.
const PASSWORD = process.env.BLOG_ADMIN_PASSWORD || '';
const SECRET = process.env.BLOG_AUTH_SECRET || PASSWORD || '';
const COOKIE = 'rt_admin';
const MAX_AGE = 60 * 60 * 12; // 12h

function key() {
  if (!SECRET) {
    const e = new Error('BLOG_AUTH_SECRET is not set.');
    e.status = 503;
    throw e;
  }
  return new TextEncoder().encode(SECRET);
}

export function adminConfigured() {
  return Boolean(SECRET && PASSWORD);
}

/** Constant-time-ish password check. */
export function passwordOk(input) {
  if (!PASSWORD) return false;
  const a = Buffer.from(String(input || ''));
  const b = Buffer.from(PASSWORD);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function issueToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export function sessionCookie(token) {
  const parts = [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE}`,
  ];
  return parts.join('; ');
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(req, name) {
  const raw = req.headers?.cookie || '';
  for (const pair of raw.split(';')) {
    const i = pair.indexOf('=');
    if (i === -1) continue;
    if (pair.slice(0, i).trim() === name) return pair.slice(i + 1).trim();
  }
  return null;
}

/** Throws httpError(401) if the request lacks a valid admin session. */
export async function requireAdmin(req) {
  const token = readCookie(req, COOKIE);
  if (!token) {
    const e = new Error('Not authenticated');
    e.status = 401;
    throw e;
  }
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.role !== 'admin') throw new Error('bad role');
    return payload;
  } catch {
    const e = new Error('Session expired');
    e.status = 401;
    throw e;
  }
}
