import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield } from 'lucide-react';

export function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Encrypted Calendar</CardTitle>
            <CardDescription className="mt-2">
              Secure calendar with military-grade encryption
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 text-primary" />
              <p>All events and tasks are encrypted client-side</p>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 text-primary" />
              <p>Your data is protected with AES-256-GCM encryption</p>
            </div>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
