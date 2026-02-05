# Specification

## Summary
**Goal:** Ensure calendar Events/Tasks screens only load after auth, actor, profile, and unlock prerequisites are satisfied, and make events/tasks data reliably refetch after logout/login/unlock cycles.

**Planned changes:**
- Gate rendering of EventsView/TasksView behind prerequisite readiness (authenticated, actor ready, profile fetched/setup complete, encryption session unlocked) and show a clear non-destructive English loading state while resolving.
- Refine React Query enable/refetch/invalidation logic for events/tasks so queries refetch and display fresh decrypted data automatically after logout/login (including same principal) and unlock, without requiring manual refresh or “Retry”.
- Preserve actionable error states for real backend/decryption failures while preventing transient startup query-error alerts during normal initialization.

**User-visible outcome:** After login (including re-login), users see a consistent loading screen until everything is ready; once unlocked, events and tasks load automatically and reliably (including after a logout/login cycle) without transient “failed to load” alerts unless a real error occurs.
