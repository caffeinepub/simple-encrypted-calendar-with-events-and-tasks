import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { PassphraseUnlockModal } from './components/crypto/PassphraseUnlockModal';
import { Shell } from './components/layout/Shell';
import { useEncryptionSession } from './crypto/useEncryptionSession';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isUnlocked } = useEncryptionSession();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showPassphraseUnlock = isAuthenticated && userProfile !== null && !isUnlocked;
  const showApp = isAuthenticated && userProfile !== null && isUnlocked;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {!isAuthenticated && <LoginScreen />}
        {showProfileSetup && <ProfileSetupModal />}
        {showPassphraseUnlock && <PassphraseUnlockModal onLogout={clear} />}
        {showApp && <Shell />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
