import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useEncryptionSession } from '../../crypto/useEncryptionSession';
import { EventsView } from '../../features/events/EventsView';
import { TasksView } from '../../features/tasks/TasksView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckSquare, LogOut, Lock, Unlock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function Shell() {
  const [activeTab, setActiveTab] = useState<'events' | 'tasks'>('events');
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { lock } = useEncryptionSession();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    // Clear encryption state first
    lock();
    // Clear all cached queries
    queryClient.clear();
    // Then logout
    await clear();
  };

  const handleLock = () => {
    // Lock clears the encryption key
    lock();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Encrypted Calendar</h1>
              <p className="text-xs text-muted-foreground">Welcome, {userProfile?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLock}>
              <Unlock className="w-4 h-4 mr-2" />
              Lock
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'events' | 'tasks')}>
          <TabsList className="mb-6">
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
          </TabsList>
          <TabsContent value="events">
            <EventsView />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksView />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © 2026. Built with <span className="text-destructive">♥</span> using{' '}
        <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
