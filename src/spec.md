# Specification

## Summary
**Goal:** Fix events/tasks failing to load after signing out and back in by ensuring the frontend reinitializes the backend actor and React Query state for the new Internet Identity session, and by making unlock state transitions reliable.

**Planned changes:**
- Recreate/refetch the backend actor whenever the Internet Identity session changes (including re-login as the same principal) so access control initialization runs for the active session before events/tasks queries execute.
- Update React Query keys and refetch/invalidation behavior so events/tasks queries are scoped to the currently authenticated principal and do not reuse cached errors/data across sign-out/sign-in cycles.
- Harden encryption unlock flow state updates by using proper Zustand state updates (no direct mutation) to prevent stuck unlocking/loading states and ensure calendar queries enable and run once actor + key prerequisites are satisfied.

**User-visible outcome:** After signing out and signing back in (then unlocking), Events and Tasks load automatically without “Failed to load events/tasks” errors and without requiring a manual page refresh or Retry.
