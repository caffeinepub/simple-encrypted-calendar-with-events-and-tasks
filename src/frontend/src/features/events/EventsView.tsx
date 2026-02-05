import { useState } from 'react';
import { useGetEvents } from '../../api/calendarQueries';
import { EventFormDialog } from './EventFormDialog';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export function EventsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: events, isLoading, error, refetch } = useGetEvents();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load events</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{error.message}</p>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-sm text-muted-foreground">Manage your encrypted calendar events</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id.toString()} event={event} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>No events yet</CardTitle>
            <CardDescription>Create your first encrypted event to get started</CardDescription>
            <div className="pt-4">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <EventFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
