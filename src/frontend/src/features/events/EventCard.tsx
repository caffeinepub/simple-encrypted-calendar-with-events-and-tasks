import { useState } from 'react';
import { type DecryptedEvent } from '../../api/encryptedCalendarCodec';
import { useDeleteEvent } from '../../api/calendarMutations';
import { EventFormDialog } from './EventFormDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EventCardProps {
  event: DecryptedEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteEvent = useDeleteEvent();

  const startDate = new Date(Number(event.startTime) / 1_000_000);
  const endDate = new Date(Number(event.endTime) / 1_000_000);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success('Event deleted');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {formatDate(startDate)}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
          )}
        </CardContent>
      </Card>

      <EventFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        event={event}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteEvent.isPending}>
              {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
