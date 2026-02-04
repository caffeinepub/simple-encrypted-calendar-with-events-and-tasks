import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useEncryptionSession } from '../crypto/useEncryptionSession';
import { decryptEvent, decryptTask, type DecryptedEvent, type DecryptedTask } from './encryptedCalendarCodec';

export function useGetEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { key } = useEncryptionSession();

  return useQuery<DecryptedEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor || !key) return [];
      const encryptedEvents = await actor.getEvents();
      return Promise.all(encryptedEvents.map(event => decryptEvent(event, key)));
    },
    enabled: !!actor && !actorFetching && !!key,
  });
}

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { key } = useEncryptionSession();

  return useQuery<DecryptedTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor || !key) return [];
      const encryptedTasks = await actor.getTasks();
      return Promise.all(encryptedTasks.map(task => decryptTask(task, key)));
    },
    enabled: !!actor && !actorFetching && !!key,
  });
}
