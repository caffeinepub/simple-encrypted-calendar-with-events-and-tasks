import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEncryptionSession } from '../crypto/useEncryptionSession';
import { decryptEvent, decryptTask, type DecryptedEvent, type DecryptedTask } from './encryptedCalendarCodec';

export function useGetEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { key, sessionVersion } = useEncryptionSession();
  
  const principal = identity?.getPrincipal().toString();

  return useQuery<DecryptedEvent[], Error>({
    queryKey: ['events', principal, sessionVersion],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Connection not ready. Please wait or refresh the page.');
      }
      if (!key) {
        throw new Error('Encryption key not available. Please unlock your calendar.');
      }
      
      try {
        const encryptedEvents = await actor.getEvents();
        return Promise.all(encryptedEvents.map(event => decryptEvent(event, key)));
      } catch (error: any) {
        console.error('Failed to fetch events:', error);
        throw new Error(error.message || 'Failed to load events. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!key && !!principal && sessionVersion > 0,
    retry: 1,
    refetchOnMount: true,
    staleTime: 0,
  });
}

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { key, sessionVersion } = useEncryptionSession();
  
  const principal = identity?.getPrincipal().toString();

  return useQuery<DecryptedTask[], Error>({
    queryKey: ['tasks', principal, sessionVersion],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Connection not ready. Please wait or refresh the page.');
      }
      if (!key) {
        throw new Error('Encryption key not available. Please unlock your calendar.');
      }
      
      try {
        const encryptedTasks = await actor.getTasks();
        return Promise.all(encryptedTasks.map(task => decryptTask(task, key)));
      } catch (error: any) {
        console.error('Failed to fetch tasks:', error);
        throw new Error(error.message || 'Failed to load tasks. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!key && !!principal && sessionVersion > 0,
    retry: 1,
    refetchOnMount: true,
    staleTime: 0,
  });
}
