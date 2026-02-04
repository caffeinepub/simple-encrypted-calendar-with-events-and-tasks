import { useState } from 'react';
import { type DecryptedTask } from '../../api/encryptedCalendarCodec';
import { useUpdateTaskStatus, useDeleteTask } from '../../api/calendarMutations';
import { TaskFormDialog } from './TaskFormDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TaskCardProps {
  task: DecryptedTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const handleToggle = async () => {
    try {
      await updateStatus.mutateAsync({ id: task.id, completed: !task.isCompleted });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const deadline = task.deadline ? new Date(Number(task.deadline) / 1_000_000) : null;

  return (
    <>
      <Card className={task.isCompleted ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={handleToggle}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className={`text-base ${task.isCompleted ? 'line-through' : ''}`}>
                {task.title}
              </CardTitle>
              {deadline && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  Due: {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </CardDescription>
              )}
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
        {task.details && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{task.details}</p>
          </CardContent>
        )}
      </Card>

      <TaskFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        task={task}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
