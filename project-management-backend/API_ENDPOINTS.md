# API Endpoints - ProGest Backend

Total de endpoints: **43**

---

## ADMIN

Total: 7 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| GET | `/api/admin/audit-logs` | admin.get_audit_logs |
| GET | `/api/admin/health` | admin.health_check |
| GET | `/api/admin/projects` | admin.get_all_projects |
| PATCH | `/api/admin/projects/<project_id>/status` | admin.update_project_status |
| GET | `/api/admin/stats` | admin.get_global_stats |
| GET | `/api/admin/users` | admin.get_all_users |
| PATCH | `/api/admin/users/<user_id>/status` | admin.update_user_status |

---

## AUTH

Total: 6 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| POST | `/api/auth/accept-invite` | auth.accept_invite |
| POST | `/api/auth/login` | auth.login |
| POST | `/api/auth/logout` | auth.logout |
| GET | `/api/auth/me` | auth.get_me |
| POST | `/api/auth/refresh` | auth.refresh |
| POST | `/api/auth/register` | auth.register |

---

## COMMENTS

Total: 4 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| GET | `/api/tasks/<task_id>/comments` | comments.list_comments |
| POST | `/api/tasks/<task_id>/comments` | comments.create_comment |
| PATCH | `/api/tasks/<task_id>/comments/<comment_id>` | comments.update_comment |
| DELETE | `/api/tasks/<task_id>/comments/<comment_id>` | comments.delete_comment |

---

## INVITES

Total: 5 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| POST | `/api/invites` | invites.create_invite |
| GET | `/api/invites` | invites.list_invites |
| DELETE | `/api/invites/<invite_id>` | invites.cancel_invite |
| POST | `/api/invites/<invite_id>/resend` | invites.resend_invite |
| GET | `/api/invites/validate/<token>` | invites.validate_invite_token |

---

## MAIN

Total: 2 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| GET | `/` | index |
| GET | `/api/health` | health |

---

## MEMBERS

Total: 3 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| GET | `/api/members` | members.list_members |
| PATCH | `/api/members/<membership_id>/deactivate` | members.deactivate_member |
| PATCH | `/api/members/<user_id>/profile` | members.update_member_profile |

---

## NOTIFICATIONS

Total: 5 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| GET | `/api/notifications` | notifications.list_notifications |
| DELETE | `/api/notifications/<notification_id>` | notifications.delete_notification |
| PATCH | `/api/notifications/<notification_id>/read` | notifications.mark_as_read |
| PATCH | `/api/notifications/read-all` | notifications.mark_all_as_read |
| GET | `/api/notifications/unread-count` | notifications.get_unread_count |

---

## PROJECTS

Total: 2 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| POST | `/api/projects` | projects.create_project |
| GET | `/api/projects/my-project` | projects.get_my_project |

---

## TASKS

Total: 9 endpoints

| Método | Ruta | Endpoint |
|--------|------|----------|
| POST | `/api/tasks` | tasks.create_task |
| GET | `/api/tasks` | tasks.list_tasks |
| GET | `/api/tasks/<task_id>` | tasks.get_task |
| PATCH | `/api/tasks/<task_id>` | tasks.update_task |
| DELETE | `/api/tasks/<task_id>` | tasks.delete_task |
| PATCH | `/api/tasks/<task_id>/assign` | tasks.assign_task |
| PATCH | `/api/tasks/<task_id>/status` | tasks.change_task_status |
| GET | `/api/tasks/my-tasks` | tasks.get_my_tasks |
| GET | `/api/tasks/stats` | tasks.get_task_stats |

### Checklist Field Documentation

All task endpoints support a `checklist` field for managing sub-items within tasks.

#### Checklist Structure

```json
{
  "checklist": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Item description",
      "completed": false
    }
  ]
}
```

**Field Specifications:**
- `id` (string, required): UUID v4 format identifier for the checklist item
- `text` (string, required): Description of the checklist item (1-500 characters)
- `completed` (boolean, required): Completion status of the item

**Validation Rules:**
- Maximum 50 items per checklist
- Each item must have a valid UUID
- Text field cannot be empty
- Text field maximum length: 500 characters

#### Permission Rules for Checklist Operations

**Owner Permissions:**
- ✅ Create tasks with checklist items
- ✅ Add new checklist items to existing tasks
- ✅ Edit checklist item text
- ✅ Remove checklist items
- ✅ Toggle checklist item completion status

**Employee Permissions:**
- ❌ Cannot create tasks with checklist items
- ❌ Cannot add new checklist items
- ❌ Cannot edit checklist item text
- ❌ Cannot remove checklist items
- ✅ Can toggle checklist item completion status (for any task in the project)

**Permission Enforcement:**
- Backend validates checklist modifications on `PATCH /api/tasks/<task_id>`
- If an Employee attempts to modify checklist structure (add/remove/edit text), returns `403 Forbidden`
- If an Employee only toggles `completed` field, the operation is allowed
- All checklist operations require user to be a member of the task's project

#### Example Requests

**Create Task with Checklist (Owner only):**
```json
POST /api/tasks
{
  "title": "Implement feature",
  "description": "New feature implementation",
  "priority": "high",
  "due_date": "2025-12-31",
  "checklist": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Write unit tests",
      "completed": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Update documentation",
      "completed": false
    }
  ]
}
```

**Toggle Checklist Item (Owner or Employee):**
```json
PATCH /api/tasks/123
{
  "checklist": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Write unit tests",
      "completed": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Update documentation",
      "completed": false
    }
  ]
}
```

**Add Checklist Item (Owner only):**
```json
PATCH /api/tasks/123
{
  "checklist": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Write unit tests",
      "completed": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Update documentation",
      "completed": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "text": "Review code",
      "completed": false
    }
  ]
}
```

**Error Response (Employee attempting to modify structure):**
```json
{
  "success": false,
  "error": {
    "code": "CHECKLIST_PERMISSION_DENIED",
    "message": "Solo el Owner puede modificar la estructura del checklist"
  }
}
```

---

