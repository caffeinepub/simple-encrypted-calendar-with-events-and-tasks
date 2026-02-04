import { useState } from 'react';
import { useGetTasks } from '../../api/calendarQueries';
import { TaskFormDialog } from './TaskFormDialog';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, CheckSquare, AlertCircle } from 'lucide-react';

export function TasksView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: tasks, isLoading, error } = useGetTasks();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load tasks. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const incompleteTasks = tasks?.filter(t => !t.isCompleted) || [];
  const completedTasks = tasks?.filter(t => t.isCompleted) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage your encrypted to-do list</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-6">
          {incompleteTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Active Tasks</h3>
              {incompleteTasks.map((task) => (
                <TaskCard key={task.id.toString()} task={task} />
              ))}
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              {completedTasks.map((task) => (
                <TaskCard key={task.id.toString()} task={task} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription>Create your first encrypted task to get started</CardDescription>
            <div className="pt-4">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <TaskFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
