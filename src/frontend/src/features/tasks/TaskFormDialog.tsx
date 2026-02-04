import { useState, useEffect } from 'react';
import { type DecryptedTask } from '../../api/encryptedCalendarCodec';
import { useAddTask } from '../../api/calendarMutations';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: DecryptedTask;
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');

  const addTask = useAddTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDetails(task.details);
      if (task.deadline) {
        setHasDeadline(true);
        const date = new Date(Number(task.deadline) / 1_000_000);
        setDeadlineDate(date.toISOString().split('T')[0]);
      } else {
        setHasDeadline(false);
        setDeadlineDate('');
      }
    } else {
      setTitle('');
      setDetails('');
      setHasDeadline(false);
      setDeadlineDate('');
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    let deadline: bigint | null = null;
    if (hasDeadline && deadlineDate) {
      const date = new Date(deadlineDate);
      deadline = BigInt(date.getTime() * 1_000_000);
    }

    try {
      await addTask.mutateAsync({
        title: title.trim(),
        details: details.trim(),
        deadline,
      });
      toast.success(task ? 'Task updated' : 'Task created');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update your encrypted task details' : 'Create a new encrypted task'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Task details (optional)"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hasDeadline">Set deadline</Label>
            <Switch
              id="hasDeadline"
              checked={hasDeadline}
              onCheckedChange={setHasDeadline}
            />
          </div>
          {hasDeadline && (
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addTask.isPending}>
              {addTask.isPending ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
