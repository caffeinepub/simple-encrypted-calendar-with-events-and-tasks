import { create } from 'zustand';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { deriveKey, generateSalt, getSalt, storeSalt } from './webCrypto';

interface EncryptionSessionState {
  key: CryptoKey | null;
  isUnlocking: boolean;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
}

const useEncryptionStore = create<EncryptionSessionState>((set) => ({
  key: null,
  isUnlocking: false,
  unlock: async (passphrase: string) => {
    set({ isUnlocking: true });
    try {
      // This will be set properly in the hook
      throw new Error('Use the hook version');
    } finally {
      set({ isUnlocking: false });
    }
  },
  lock: () => {
    set({ key: null });
  },
}));

export function useEncryptionSession() {
  const { identity } = useInternetIdentity();
  const store = useEncryptionStore();

  const unlock = async (passphrase: string) => {
    if (!identity) throw new Error('Not authenticated');
    
    const principalId = identity.getPrincipal().toString();
    
    store.isUnlocking = true;
    try {
      let salt = getSalt(principalId);
      if (!salt) {
        salt = await generateSalt();
        storeSalt(principalId, salt);
      }

      const key = await deriveKey(passphrase, salt);
      useEncryptionStore.setState({ key, isUnlocking: false });
    } catch (error) {
      useEncryptionStore.setState({ isUnlocking: false });
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
