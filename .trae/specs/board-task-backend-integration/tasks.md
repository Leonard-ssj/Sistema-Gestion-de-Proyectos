# Implementation Plan: Board and Task Backend Integration with Checklist Support

## Overview

This implementation plan integrates the Board page and Task Detail page with the backend API, replacing mock data with live API calls. It includes complete checklist functionality with backend persistence, proper permission enforcement, optimistic UI updates, error handling, and comprehensive testing.

The implementation follows a backend-first approach, ensuring data persistence is in place before building frontend features. Each task builds incrementally, with checkpoints to validate functionality before proceeding.

## Tasks

- [x] 1. Backend - Database migration for checklist support
  - Create Alembic migration to add checklist JSON column to tasks table
  - Run migration in development environment
  - Verify column exists with correct type (JSON, nullable)
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 2. Backend - Update Task model and schemas
  - [x] 2.1 Add checklist field to Task model
    - Add `checklist = db.Column(db.JSON, nullable=True, default=list)` to Task model
    - Update `to_dict()` method to include checklist field with empty array default
    - _Requirements: 9.1, 9.4_
  
  - [x] 2.2 Create ChecklistItemSchema for validation
    - Create ChecklistItemSchema with id, text, and completed fields
    - Add validation for UUID format on id field
    - Add length validation for text field (1-500 characters)
    - _Requirements: 9.4_
  
  - [x] 2.3 Update TaskCreateSchema and TaskUpdateSchema
    - Add checklist field as List of Nested ChecklistItemSchema
    - Set max length validation to 50 items
    - Make field optional (required=False, allow_none=True)
    - _Requirements: 9.1, 9.3, 10.5_
  
  - [x] 2.4 Update TaskSchema for responses
    - Add checklist field as dump_only List of Nested ChecklistItemSchema
    - _Requirements: 9.2, 9.5_

- [x] 3. Backend - Implement checklist permission validation
  - [x] 3.1 Create validate_checklist_modification function
    - Implement function in task_service.py to check if user can modify checklist
    - Return True if user is Owner (allow any change)
    - Return True if user is Employee and only 'completed' field changed
    - Return False if Employee attempts to modify structure (add/remove/edit text)
    - _Requirements: 11.6, 12.7_
  
  - [x] 3.2 Integrate permission validation in update_task
    - Call validate_checklist_modification when checklist is in update data
    - Raise PermissionError with clear message if validation fails
    - Ensure 403 status code is returned for permission errors
    - _Requirements: 11.6_

- [ ]* 3.3 Write property test for checklist round-trip
  - **Property 1: Round-trip consistency**
  - **Validates: Requirements 9.6**
  - Create test that creates task with checklist and verifies retrieval returns same data
  - Test with various checklist configurations (empty, single item, multiple items)

- [ ]* 3.4 Write property test for toggle idempotence
  - **Property 3: Idempotence of toggle**
  - **Validates: Requirements 12.2, 12.4**
  - Create test that toggles checklist item twice and verifies return to original state

- [ ]* 3.5 Write unit tests for permission validation
  - **Property 4: Employee permission constraints**
  - **Validates: Requirements 11.6, 12.7**
  - Test that Employee cannot add/remove/edit checklist items
  - Test that Employee can toggle completed status
  - Test that Owner can perform all operations

- [x] 4. Checkpoint - Backend validation
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 5. Frontend - Define TypeScript types for checklist
  - [x] 5.1 Create ChecklistItem interface
    - Define interface with id (string), text (string), completed (boolean)
    - Add to types/task.ts or appropriate types file
    - _Requirements: 9.4, 15.4_
  
  - [x] 5.2 Update Task interface
    - Add optional checklist field as array of ChecklistItem
    - _Requirements: 9.2, 9.5_

- [x] 6. Frontend - Update data mappers for checklist
  - [x] 6.1 Update mapTaskFromBackend
    - Add checklist field mapping with empty array default
    - Ensure checklist is always an array, never null
    - _Requirements: 9.2, 15.1_
  
  - [x] 6.2 Update mapTaskToBackend
    - Add checklist field mapping with empty array default
    - _Requirements: 9.3, 15.2_

- [x] 7. Frontend - Task creation form with checklist support
  - [x] 7.1 Add checklist state management to task creation form
    - Add state for checklistItems array and checklistInput string
    - Implement addChecklistItem function with UUID generation
    - Implement removeChecklistItem function
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 7.2 Build checklist UI in task creation form
    - Add input field and "Add" button for new checklist items
    - Display list of added items with remove buttons
    - Handle Enter key press to add items
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 7.3 Update form submission to include checklist
    - Include checklistItems in taskData when calling createTask
    - Clear checklist state after successful creation
    - Handle errors with toast notifications
    - _Requirements: 10.4, 10.5, 10.6_

- [ ]* 7.4 Write unit tests for task creation form checklist
  - Test adding checklist items
  - Test removing checklist items
  - Test form submission includes checklist data
  - Test empty input doesn't add items

- [x] 8. Frontend - Task Detail page checklist display and toggle
  - [x] 8.1 Display checklist items with checkboxes
    - Render checklist section in task detail page
    - Display checkbox for each item with text
    - Apply line-through styling for completed items
    - Show empty state when no checklist items exist
    - _Requirements: 9.5, 12.1_
  
  - [x] 8.2 Implement checklist item toggle functionality
    - Create toggleChecklistItem function with optimistic update
    - Call updateTask with modified checklist on toggle
    - Implement rollback on API failure
    - Display success/error toast notifications
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ]* 8.3 Write unit tests for checklist toggle
  - Test optimistic update applies immediately
  - Test rollback on API failure
  - Test toast notifications display correctly

- [x] 9. Frontend - Task Detail page checklist management (Owner only)
  - [x] 9.1 Add permission-based UI controls
    - Show add/edit/remove controls only for Owner users
    - Hide controls for Employee users
    - Add edit mode toggle button for Owner
    - _Requirements: 11.1, 11.2_
  
  - [x] 9.2 Implement add checklist item functionality
    - Create addChecklistItem function with UUID generation
    - Call updateTask with new item appended to checklist
    - Clear input field on success
    - Display success/error toast notifications
    - _Requirements: 11.3_
  
  - [x] 9.3 Implement remove checklist item functionality
    - Create removeChecklistItem function
    - Call updateTask with item removed from checklist
    - Display success/error toast notifications
    - Handle 403 errors with appropriate message
    - _Requirements: 11.5, 11.6_

- [ ]* 9.4 Write unit tests for checklist management
  - Test Owner can add/remove items
  - Test Employee UI hides management controls
  - Test 403 error handling displays correct message

- [x] 10. Checkpoint - Checklist functionality complete
  - Ensure all checklist tests pass, ask the user if questions arise.

- [x] 11. Frontend - Board page data loading
  - [x] 11.1 Implement initial data fetching
    - Call fetchTasks() on component mount
    - Call fetchMembers() on component mount
    - Update Zustand store with fetched data
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 11.2 Add loading states with skeletons
    - Display loading skeletons in each status column while fetching
    - Show loading state until both API calls complete
    - _Requirements: 1.3, 13.3_
  
  - [x] 11.3 Render tasks in status columns
    - Group tasks by status and render in respective columns
    - Display title, priority badge, and assignee avatar for each task
    - Handle click navigation to task detail page
    - _Requirements: 1.6, 1.7, 1.8, 17.2, 17.3, 17.4_

- [x] 12. Frontend - Board page error handling
  - [x] 12.1 Implement error handling for data loading
    - Catch errors from fetchTasks() and display toast notification
    - Catch errors from fetchMembers() and display toast notification
    - Display empty board state with retry button on error
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 12.2 Add retry functionality
    - Implement retry button that re-attempts failed API calls
    - Clear previous errors before retry
    - _Requirements: 2.5_
  
  - [x] 12.3 Handle network errors specifically
    - Detect network connectivity issues
    - Display appropriate network error messages
    - _Requirements: 2.3, 14.1, 14.2, 14.3_

- [ ]* 12.4 Write unit tests for board page loading
  - Test loading states display correctly
  - Test error handling shows toast notifications
  - Test retry functionality re-attempts API calls

- [x] 13. Frontend - Board page drag and drop
  - [x] 13.1 Implement optimistic drag and drop updates
    - Apply optimistic update to move task to new column immediately
    - Store previous state for potential rollback
    - _Requirements: 3.1, 3.2, 18.1_
  
  - [x] 13.2 Call API to persist status change
    - Call updateTaskStatus() when task is dropped
    - Display success toast notification on completion
    - _Requirements: 3.3, 3.4_
  
  - [x] 13.3 Implement rollback on failure
    - Restore task to original column if API call fails
    - Display error toast notification with message
    - Handle 403 permission errors with specific message
    - _Requirements: 3.5, 3.6, 3.7, 18.2, 18.3_

- [ ]* 13.4 Write unit tests for drag and drop
  - Test optimistic update moves task immediately
  - Test rollback restores original position on failure
  - Test 403 error displays permission message

- [x] 14. Frontend - Employee permission enforcement on board
  - [x] 14.1 Handle permission errors for Employee users
    - Allow drag operation for all tasks (UI doesn't restrict)
    - Catch 403 errors from updateTaskStatus()
    - Display "You can only change status of tasks assigned to you" message
    - Perform rollback to restore task to original column
    - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 14.2 Write integration tests for Employee permissions
  - Test Employee can update assigned tasks
  - Test Employee cannot update unassigned tasks
  - Test Owner can update any task

- [x] 15. Frontend - Task Detail page data loading
  - [x] 15.1 Implement task data fetching
    - Call getTask() with task ID from URL on mount
    - Display loading skeleton while fetching
    - Update component state with task data
    - _Requirements: 5.1, 5.3, 5.5_
  
  - [x] 15.2 Implement comments data fetching
    - Call listComments() with task ID on mount
    - Display loading skeleton for comments section
    - Update component state with comments data
    - _Requirements: 5.2, 5.4, 5.6_
  
  - [x] 15.3 Handle 404 errors
    - Catch 404 errors from getTask()
    - Display "Task not found" message
    - Provide link back to board page
    - _Requirements: 5.7_

- [ ]* 15.4 Write unit tests for task detail loading
  - Test loading states display correctly
  - Test task data renders after fetch
  - Test 404 error shows not found message

- [x] 16. Frontend - Task Detail page property updates
  - [x] 16.1 Implement status dropdown with optimistic update
    - Apply optimistic update when status changes
    - Call updateTask() with new status
    - Display success toast on completion
    - Implement rollback on failure
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  
  - [x] 16.2 Implement priority dropdown with optimistic update
    - Apply optimistic update when priority changes
    - Call updateTask() with new priority
    - Display success toast on completion
    - Implement rollback on failure
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [x] 16.3 Handle update errors
    - Display error toast with message on failure
    - Ensure rollback restores original values
    - _Requirements: 6.6_

- [ ]* 16.4 Write unit tests for task property updates
  - Test optimistic updates apply immediately
  - Test rollback on API failure
  - Test success/error toast notifications

- [x] 17. Frontend - Comment creation
  - [x] 17.1 Implement comment submission with optimistic update
    - Apply optimistic update adding comment to UI immediately
    - Call createComment() with task ID and content
    - Replace optimistic comment with backend response on success
    - Clear comment input field on success
    - _Requirements: 7.1, 7.2, 7.3, 7.7_
  
  - [x] 17.2 Handle comment creation errors
    - Perform rollback removing optimistic comment on failure
    - Display error toast notification
    - _Requirements: 7.5, 7.6_
  
  - [x] 17.3 Display success feedback
    - Show success toast when comment is created
    - _Requirements: 7.4_

- [ ]* 17.4 Write unit tests for comment creation
  - Test optimistic update adds comment immediately
  - Test rollback removes comment on failure
  - Test input field clears on success

- [x] 18. Frontend - Comment editing and deletion
  - [x] 18.1 Implement inline comment editing
    - Display edit form when user clicks edit button
    - Call updateComment() with task ID, comment ID, and new content
    - Update comment display with new content on success
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 18.2 Implement comment deletion with optimistic update
    - Apply optimistic update removing comment from UI
    - Call deleteComment() with task ID and comment ID
    - Perform rollback restoring comment on failure
    - _Requirements: 8.4, 8.5, 8.6_
  
  - [x] 18.3 Handle permission errors
    - Catch 403 errors from updateComment() and deleteComment()
    - Display "insufficient permissions" toast notification
    - _Requirements: 8.7_

- [ ]* 18.4 Write unit tests for comment editing and deletion
  - Test edit form displays correctly
  - Test deletion optimistic update and rollback
  - Test 403 error handling

- [x] 19. Checkpoint - Core integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Frontend - Loading states and user feedback
  - [x] 20.1 Implement operation-specific loading indicators
    - Show loading indicator for each in-progress operation
    - Disable buttons during API calls
    - _Requirements: 13.1, 13.2_
  
  - [x] 20.2 Configure toast notification durations
    - Set success toasts to 3 seconds duration
    - Set error toasts to 5 seconds duration with error details
    - _Requirements: 13.5, 13.6_
  
  - [x] 20.3 Ensure optimistic updates skip loading indicators
    - Verify optimistic updates show immediately without loading state
    - _Requirements: 13.4_

- [x] 21. Frontend - Network error handling
  - [x] 21.1 Implement network error detection
    - Detect network connectivity failures
    - Display "Network error. Please check your connection." toast
    - _Requirements: 14.1_
  
  - [x] 21.2 Handle server unreachable errors
    - Detect when backend API is unreachable
    - Display "Unable to reach server. Please try again later." toast
    - _Requirements: 14.2_
  
  - [x] 21.3 Handle timeout errors
    - Detect API call timeouts
    - Display "Request timed out. Please try again." toast
    - _Requirements: 14.3_
  
  - [x] 21.4 Implement rollback for network errors
    - Ensure rollback occurs for all network errors during optimistic updates
    - Log all network errors to console
    - _Requirements: 14.4, 14.5_

- [ ]* 21.5 Write unit tests for network error handling
  - Test network error displays correct message
  - Test server unreachable displays correct message
  - Test timeout displays correct message
  - Test rollback occurs on network errors

- [x] 22. Frontend - Data mapping validation
  - [x] 22.1 Verify mapper usage in all service calls
    - Ensure mapTaskFromBackend is used for all task API responses
    - Ensure mapTaskToBackend is used for all task API requests
    - Ensure mapCommentFromBackend is used for all comment API responses
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 22.2 Add response structure validation
    - Validate API responses match expected TypeScript types
    - Log warning for unexpected data structures
    - Display "Unexpected data format received" toast on validation failure
    - _Requirements: 15.4, 15.5_

- [x] 23. Frontend - Backend response format handling
  - [x] 23.1 Implement consistent response parsing
    - Check for success boolean field in all responses
    - Extract data from data field when success is true
    - Extract error from error field when success is false
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 23.2 Handle error field variations
    - Display error message from error.message when available
    - Handle cases where error field is null or undefined
    - _Requirements: 16.4, 16.5_

- [x] 24. Frontend - Member data caching
  - [x] 24.1 Implement member data caching in Zustand store
    - Store fetched members in Zustand store
    - Reuse cached member data for assignee lookups
    - Avoid repeated fetchMembers() calls
    - _Requirements: 17.1, 17.5_
  
  - [x] 24.2 Handle missing assignee data
    - Display placeholder avatar when assignee not found in members
    - _Requirements: 17.4_

- [x] 25. Frontend - Optimistic update rollback mechanism
  - [x] 25.1 Implement state storage for rollback
    - Store previous state value before each optimistic update
    - Clear stored state after successful API completion
    - _Requirements: 18.1, 18.4_
  
  - [x] 25.2 Implement rollback restoration
    - Restore previous state value on API failure
    - Update UI to reflect restored state
    - _Requirements: 18.2, 18.3_
  
  - [x] 25.3 Handle concurrent optimistic updates
    - Ensure multiple concurrent updates have independent rollback capability
    - _Requirements: 18.5_

- [ ]* 25.4 Write unit tests for rollback mechanism
  - Test previous state is stored correctly
  - Test rollback restores correct state
  - Test concurrent updates rollback independently

- [x] 26. Checkpoint - All features implemented
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 27. Testing - Integration tests
  - [ ]* 27.1 Write integration test for Board page full flow
    - Test loading tasks and members
    - Test drag and drop status update
    - Test error handling and retry
  
  - [ ]* 27.2 Write integration test for Task Detail page full flow
    - Test loading task and comments
    - Test updating task properties
    - Test creating, editing, and deleting comments
  
  - [ ]* 27.3 Write integration test for checklist full flow
    - Test creating task with checklist
    - Test Owner adding/removing items
    - Test Employee toggling items
    - Test permission enforcement

- [ ]* 28. Testing - E2E tests with Playwright
  - [ ]* 28.1 Create E2E test for Owner checklist management
    - Test Owner creates task with checklist
    - Test Owner adds and removes checklist items
    - Test Owner toggles checklist items
  
  - [ ]* 28.2 Create E2E test for Employee checklist interaction
    - Test Employee can view checklist
    - Test Employee can toggle checklist items
    - Test Employee cannot add/remove items
  
  - [ ]* 28.3 Create E2E test for Board page drag and drop
    - Test dragging task between columns
    - Test optimistic update and confirmation
    - Test permission error for Employee
  
  - [ ]* 28.4 Create E2E test for Task Detail page comments
    - Test creating comments
    - Test editing own comments
    - Test deleting own comments

- [x] 29. Documentation - Update API documentation
  - Document checklist field in task endpoints
  - Document permission rules for checklist operations
  - Add examples of checklist data structure
  - _Requirements: All_

- [x] 30. Final checkpoint - Complete integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration and E2E tests validate complete user flows
- Backend changes must be completed and tested before frontend integration
- All optimistic updates must have corresponding rollback mechanisms
- Permission enforcement is handled by backend; frontend gracefully handles 403 errors
- Toast notifications provide consistent user feedback for all operations
