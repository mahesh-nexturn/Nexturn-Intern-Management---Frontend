import api from './api'
import type { ApiResponse } from './api'

function base64ToBytes(b64: string) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: Uint8Array) {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

// The key is fetched on every call: the backend generates a new key pair on restart.
export async function encryptPassword(password: string) {
  const { data } = await api.get<ApiResponse<string>>('/auth/public-key')
  const publicKey = await crypto.subtle.importKey(
    'spki',
    base64ToBytes(data.data),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  )
  const cipher = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    new TextEncoder().encode(password),
  )
  return bytesToBase64(new Uint8Array(cipher))
}
