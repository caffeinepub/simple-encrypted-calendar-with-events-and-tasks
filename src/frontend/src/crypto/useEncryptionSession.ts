import { create } from 'zustand';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { deriveKey, generateSalt, getSalt, storeSalt } from './webCrypto';
import { useEffect } from 'react';

interface EncryptionSessionState {
  key: CryptoKey | null;
  isUnlocking: boolean;
  setKey: (key: CryptoKey | null) => void;
  setIsUnlocking: (isUnlocking: boolean) => void;
  lock: () => void;
  reset: () => void;
}

const useEncryptionStore = create<EncryptionSessionState>((set) => ({
  key: null,
  isUnlocking: false,
  setKey: (key) => set({ key }),
  setIsUnlocking: (isUnlocking) => set({ isUnlocking }),
  lock: () => set({ key: null }),
  reset: () => set({ key: null, isUnlocking: false }),
}));

export function useEncryptionSession() {
  const { identity } = useInternetIdentity();
  const store = useEncryptionStore();

  // Reset encryption state when identity changes (logout or principal change)
  useEffect(() => {
    if (!identity) {
      store.reset();
    }
  }, [identity, store]);

  const unlock = async (passphrase: string) => {
    if (!identity) throw new Error('Not authenticated');
    
    const principalId = identity.getPrincipal().toString();
    
    store.setIsUnlocking(true);
    try {
      let salt = getSalt(principalId);
      if (!salt) {
        salt = await generateSalt();
        storeSalt(principalId, salt);
      }

      const key = await deriveKey(passphrase, salt);
      store.setKey(key);
      store.setIsUnlocking(false);
    } catch (error) {
      store.setIsUnlocking(false);
      throw error;
    }
  };

  return {
    key: store.key,
    isUnlocked: store.key !== null,
    isUnlocking: store.isUnlocking,
    unlock,
    lock: store.lock,
  };
}
