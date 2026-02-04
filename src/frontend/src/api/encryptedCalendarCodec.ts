import { type EncryptedEvent, type EncryptedTask, type Timestamp } from '../backend';
import { encryptText, decryptText } from '../crypto/webCrypto';

export interface DecryptedEvent {
  id: bigint;
  startTime: Timestamp;
  endTime: Timestamp;
  title: string;
  description: string;
}

export interface DecryptedTask {
  id: bigint;
  deadline: Timestamp | null;
  isCompleted: boolean;
  title: string;
  details: string;
}

export async function encryptEvent(
  event: Omit<DecryptedEvent, 'id'>,
  key: CryptoKey
): Promise<{ startTime: Timestamp; endTime: Timestamp; encryptedTitle: string; encryptedDescription: string }> {
  const encryptedTitle = await encryptText(event.title, key);
  const encryptedDescription = await encryptText(event.description, key);

  return {
    startTime: event.startTime,
    endTime: event.endTime,
    encryptedTitle,
    encryptedDescription,
  };
}

export async function decryptEvent(event: EncryptedEvent, key: CryptoKey): Promise<DecryptedEvent> {
  const title = await decryptText(event.encryptedTitle, key);
  const description = await decryptText(event.encryptedDescription, key);

  return {
    id: event.id,
    startTime: event.startTime,
    endTime: event.endTime,
    title,
    description,
  };
}

export async function encryptTask(
  task: Omit<DecryptedTask, 'id' | 'isCompleted'>,
  key: CryptoKey
): Promise<{ deadline: Timestamp | null; encryptedTitle: string; encryptedDetails: string }> {
  const encryptedTitle = await encryptText(task.title, key);
  const encryptedDetails = await encryptText(task.details, key);

  return {
    deadline: task.deadline,
    encryptedTitle,
    encryptedDetails,
  };
}

export async function decryptTask(task: EncryptedTask, key: CryptoKey): Promise<DecryptedTask> {
  const title = await decryptText(task.encryptedTitle, key);
  const details = await decryptText(task.encryptedDetails, key);

  return {
    id: task.id,
    deadline: task.deadline || null,
    isCompleted: task.isCompleted,
    title,
    details,
  };
}
