import { type EncryptedPayload, type UserSalt } from './cryptoTypes';

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer);
}

export async function deriveKey(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = base64ToArrayBuffer(saltBase64);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const payload: EncryptedPayload = {
    version: 1,
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertext),
  };

  return JSON.stringify(payload);
}

export async function decryptText(encryptedData: string, key: CryptoKey): Promise<string> {
  const payload: EncryptedPayload = JSON.parse(encryptedData);
  
  const iv = base64ToArrayBuffer(payload.iv);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export function getUserSaltKey(principalId: string): string {
  return `encryption_salt_${principalId}`;
}

export function getSalt(principalId: string): string | null {
  const key = getUserSaltKey(principalId);
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    const data: UserSalt = JSON.parse(stored);
    return data.salt;
  } catch {
    return null;
  }
}

export function storeSalt(principalId: string, salt: string): void {
  const key = getUserSaltKey(principalId);
  const data: UserSalt = { salt };
  localStorage.setItem(key, JSON.stringify(data));
}
