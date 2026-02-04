export interface EncryptedPayload {
  version: number;
  iv: string;
  ciphertext: string;
}

export interface UserSalt {
  salt: string;
}
