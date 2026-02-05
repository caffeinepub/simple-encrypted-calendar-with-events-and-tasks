import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { LoginScreen } from './components/auth/LoginScreen';
import { AuthenticatedLoadingScreen } from './components/auth/AuthenticatedLoadingScreen';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { PassphraseUnlockModal } from './components/crypto/PassphraseUnlockModal';
import { Shell } from './components/layout/Shell';
import { useEncryptionSession } from './crypto/useEncryptionSession';
import { useActor } from './hooks/useActor';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isUnlocked } = useEncryptionSession();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  
  // Wait for actor to be ready before showing profile setup or unlock
  const actorReady = !!actor && !actorFetching;
  
  // Show authenticated loading screen while prerequisites are resolving
  const showAuthenticatedLoading = isAuthenticated && (!actorReady || (profileLoading && !isFetched));
  
  const showProfileSetup = isAuthenticated && actorReady && !profileLoading && isFetched && userProfile === null;
  const showPassphraseUnlock = isAuthenticated && actorReady && userProfile !== null && !isUnlocked;
  const showApp = isAuthenticated && actorReady && userProfile !== null && isUnlocked;

  const handleLogout = async () => {
    queryClient.clear();
    await clear();
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {!isAuthenticated && <LoginScreen />}
        {showAuthenticatedLoading && <AuthenticatedLoadingScreen />}
        {showProfileSetup && <ProfileSetupModal />}
        {showPassphraseUnlock && <PassphraseUnlockModal onLogout={handleLogout} />}
        {showApp && <Shell />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
