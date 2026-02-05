import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEncryptionSession } from '../crypto/useEncryptionSession';
import { decryptEvent, decryptTask, type DecryptedEvent, type DecryptedTask } from './encryptedCalendarCodec';
import { useRef, useEffect } from 'react';

// Hook to create a session fingerprint that changes on each login
function useSessionFingerprint() {
  const { identity } = useInternetIdentity();
  const sessionFingerprintRef = useRef<string>(Date.now().toString());
  
  // Update session fingerprint when identity changes
  useEffect(() => {
    if (identity) {
      sessionFingerprintRef.current = Date.now().toString();
    }
  }, [identity]);
  
  const principal = identity?.getPrincipal().toString();
  const sessionFingerprint = identity ? sessionFingerprintRef.current : 'anonymous';
  
  return { principal, sessionFingerprint };
}

export function useGetEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { key } = useEncryptionSession();
  const { principal, sessionFingerprint } = useSessionFingerprint();

  return useQuery<DecryptedEvent[], Error>({
    queryKey: ['events', principal, sessionFingerprint],
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
        throw new Error(error.message || 'Failed to load events. Please try logging out and back in.');
      }
    },
    enabled: !!actor && !actorFetching && !!key && !!principal,
    retry: 1,
    // Refetch on mount to ensure fresh data after session changes
    refetchOnMount: true,
    // Don't use cached data from previous sessions
    staleTime: 0,
  });
}

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { key } = useEncryptionSession();
  const { principal, sessionFingerprint } = useSessionFingerprint();

  return useQuery<DecryptedTask[], Error>({
    queryKey: ['tasks', principal, sessionFingerprint],
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
        throw new Error(error.message || 'Failed to load tasks. Please try logging out and back in.');
      }
    },
    enabled: !!actor && !actorFetching && !!key && !!principal,
    retry: 1,
    // Refetch on mount to ensure fresh data after session changes
    refetchOnMount: true,
    // Don't use cached data from previous sessions
    staleTime: 0,
  });
}
