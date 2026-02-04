import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type EventId = bigint;
export type TaskId = bigint;
export interface EncryptedTask {
    id: TaskId;
    isCompleted: boolean;
    deadline?: Timestamp;
    encryptedDetails: string;
    encryptedTitle: string;
}
export interface EncryptedEvent {
    id: EventId;
    startTime: Timestamp;
    endTime: Timestamp;
    encryptedTitle: string;
    encryptedDescription: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEvent(startTime: Timestamp, endTime: Timestamp, encryptedTitle: string, encryptedDescription: string): Promise<EventId>;
    addTask(deadline: Timestamp | null, encryptedTitle: string, encryptedDetails: string): Promise<TaskId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllDataForCaller(): Promise<void>;
    clearAllDataForUser(user: Principal): Promise<void>;
    deleteEvent(id: EventId): Promise<void>;
    deleteTask(id: TaskId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvents(): Promise<Array<EncryptedEvent>>;
    getTasks(): Promise<Array<EncryptedTask>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTaskStatus(id: TaskId, newStatus: boolean): Promise<void>;
}
