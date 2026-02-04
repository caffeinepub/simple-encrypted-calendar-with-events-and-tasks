# Specification

## Summary
**Goal:** Build a simple encrypted calendar app where authenticated users can create and manage events and tasks, with all sensitive content encrypted client-side.

**Planned changes:**
- Add Internet Identity sign-in and gate all calendar/task functionality behind an authenticated session.
- Implement client-side encryption/decryption for event/task content using Web Crypto (PBKDF2-derived key + AES-GCM), requiring a user passphrase to view existing data after reload.
- Create a single Motoko actor backend with per-user CRUD endpoints/models for encrypted calendar items (supporting separate `event` and `task` types) and enforce access control by caller identity.
- Build a compact UI with minimal navigation: a month/week-style events view, a task list view, and lightweight create/edit forms.
- Use React Query for all list/create/update/delete interactions with loading/error states and automatic UI refresh after mutations.
- Apply a consistent visual theme (not blue/purple dominant) across all screens.

**User-visible outcome:** Users can sign in with Internet Identity, enter a passphrase to decrypt their data, then create/view/edit/delete encrypted events and tasks in a small, themed interface; unauthenticated users cannot access any calendar content.
