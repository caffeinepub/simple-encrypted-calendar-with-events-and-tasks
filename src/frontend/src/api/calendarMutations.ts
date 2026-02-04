import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useEncryptionSession } from '../crypto/useEncryptionSession';
import { encryptEvent, encryptTask, type DecryptedEvent, type DecryptedTask } from './encryptedCalendarCodec';
import { type Timestamp, type EventId, type TaskId } from '../backend';

export function useAddEvent() {
  const { actor } = useActor();
  const { key } = useEncryptionSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<DecryptedEvent, 'id'>) => {
      if (!actor || !key) throw new Error('Not ready');
      const encrypted = await encryptEvent(event, key);
      return actor.addEvent(
        encrypted.startTime,
        encrypted.endTime,
        encrypted.encryptedTitle,
        encrypted.encryptedDescription
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: EventId) => {
      if (!actor) throw new Error('Not ready');
      return actor.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const { key } = useEncryptionSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<DecryptedTask, 'id' | 'isCompleted'>) => {
      if (!actor || !key) throw new Error('Not ready');
      const encrypted = await encryptTask(task, key);
      return actor.addTask(
        encrypted.deadline,
        encrypted.encryptedTitle,
        encrypted.encryptedDetails
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: TaskId; completed: boolean }) => {
      if (!actor) throw new Error('Not ready');
      return actor.updateTaskStatus(id, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: TaskId) => {
      if (!actor) throw new Error('Not ready');
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
