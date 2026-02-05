import { useState } from 'react';
import { useEncryptionSession } from '../../crypto/useEncryptionSession';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PassphraseUnlockModalProps {
  onLogout: () => void;
}

export function PassphraseUnlockModal({ onLogout }: PassphraseUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const { unlock, isUnlocking } = useEncryptionSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!passphrase) {
      setError('Please enter your passphrase');
      return;
    }

    try {
      await unlock(passphrase);
      toast.success('Calendar unlocked');
    } catch (err) {
      setError('Failed to unlock. Please check your passphrase.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Unlock Your Calendar</DialogTitle>
          <DialogDescription>
            Enter your passphrase to decrypt and access your calendar data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              autoFocus
              disabled={isUnlocking}
            />
            <p className="text-xs text-muted-foreground">
              This passphrase encrypts all your calendar data. Choose a strong, memorable passphrase.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isUnlocking}>
              {isUnlocking ? 'Unlocking...' : 'Unlock'}
            </Button>
            <Button type="button" variant="outline" onClick={onLogout} disabled={isUnlocking}>
              Logout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
