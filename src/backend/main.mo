import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Timestamp = Nat64;
  type EventId = Nat;
  type TaskId = Nat;

  type EncryptedEvent = {
    id : EventId;
    startTime : Timestamp;
    endTime : Timestamp;
    encryptedTitle : Text;
    encryptedDescription : Text;
  };

  type EncryptedTask = {
    id : TaskId;
    deadline : ?Timestamp;
    isCompleted : Bool;
    encryptedTitle : Text;
    encryptedDetails : Text;
  };

  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Each user is mapped to a set of unique event IDs
  let nextEventId = Map.empty<Principal, EventId>();
  let userEvents = Map.empty<Principal, Map.Map<EventId, EncryptedEvent>>();

  // Each user is mapped to a set of unique task IDs
  let nextTaskId = Map.empty<Principal, TaskId>();
  let userTasks = Map.empty<Principal, Map.Map<TaskId, EncryptedTask>>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Calendar event management functions
  public shared ({ caller }) func addEvent(startTime : Timestamp, endTime : Timestamp, encryptedTitle : Text, encryptedDescription : Text) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };

    // Get next ID for the user, default to 0 if not present
    let id = switch (nextEventId.get(caller)) {
      case (null) { 0 };
      case (?current) { current + 1 };
    };
    nextEventId.add(caller, id);

    let event : EncryptedEvent = {
      id;
      startTime;
      endTime;
      encryptedTitle;
      encryptedDescription;
    };

    // Retrieve current events or create new map if not present
    let eventsMap = switch (userEvents.get(caller)) {
      case (null) { Map.empty<EventId, EncryptedEvent>() };
      case (?existing) { existing };
    };

    eventsMap.add(id, event);
    userEvents.add(caller, eventsMap);
    id;
  };

  public shared ({ caller }) func addTask(deadline : ?Timestamp, encryptedTitle : Text, encryptedDetails : Text) : async TaskId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    // Get next ID for the user, default to 0 if not present
    let id = switch (nextTaskId.get(caller)) {
      case (null) { 0 };
      case (?current) { current + 1 };
    };
    nextTaskId.add(caller, id);

    let task : EncryptedTask = {
      id;
      deadline;
      isCompleted = false;
      encryptedTitle;
      encryptedDetails;
    };

    // Retrieve current tasks or create new map if not present
    let tasksMap = switch (userTasks.get(caller)) {
      case (null) { Map.empty<TaskId, EncryptedTask>() };
      case (?existing) { existing };
    };

    tasksMap.add(id, task);
    userTasks.add(caller, tasksMap);
    id;
  };

  public query ({ caller }) func getEvents() : async [EncryptedEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access events");
    };

    switch (userEvents.get(caller)) {
      case (null) { [] };
      case (?eventMap) { eventMap.values().toArray() };
    };
  };

  public query ({ caller }) func getTasks() : async [EncryptedTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?taskMap) { taskMap.values().toArray() };
    };
  };

  public shared ({ caller }) func updateTaskStatus(id : TaskId, newStatus : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task status");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        switch (tasks.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            let updatedTask : EncryptedTask = {
              id = task.id;
              deadline = task.deadline;
              isCompleted = newStatus;
              encryptedTitle = task.encryptedTitle;
              encryptedDetails = task.encryptedDetails;
            };
            tasks.add(id, updatedTask);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteEvent(id : EventId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete events");
    };

    switch (userEvents.get(caller)) {
      case (null) { Runtime.trap("Event not found") };
      case (?events) {
        if (not events.containsKey(id)) {
          Runtime.trap("Event not found");
        };
        events.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        if (not tasks.containsKey(id)) {
          Runtime.trap("Task not found");
        };
        tasks.remove(id);
      };
    };
  };

  public shared ({ caller }) func clearAllDataForCaller() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear data");
    };

    userEvents.remove(caller);
    userTasks.remove(caller);
    nextEventId.remove(caller);
    nextTaskId.remove(caller);
  };

  public shared ({ caller }) func clearAllDataForUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear all data for a user");
    };

    userEvents.remove(user);
    userTasks.remove(user);
    nextEventId.remove(user);
    nextTaskId.remove(user);
  };
};
