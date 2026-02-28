"use client"
import { create } from "zustand"
import type { Task, Invite, Notification, Project, User, Membership, AuditLog, HealthCheck } from "@/mock/types"
import { TASKS, INVITES, NOTIFICATIONS, PROJECTS, USERS, MEMBERSHIPS, AUDIT_LOGS, HEALTH_CHECKS } from "@/mock/seed"

interface DataState {
  tasks: Task[]
  invites: Invite[]
  notifications: Notification[]
  projects: Project[]
  users: User[]
  memberships: Membership[]
  auditLogs: AuditLog[]
  healthChecks: HealthCheck[]
  setTasks: (t: Task[]) => void
  addTask: (t: Task) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  setInvites: (i: Invite[]) => void
  addInvite: (i: Invite) => void
  setNotifications: (n: Notification[]) => void
  addNotification: (n: Notification) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (userId: string) => void
  setProjects: (p: Project[]) => void
  addProject: (p: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  setUsers: (u: User[]) => void
  updateUser: (id: string, data: Partial<User>) => void
  setMemberships: (m: Membership[]) => void
  addMembership: (m: Membership) => void
  resetSeed: () => void
}

export const useDataStore = create<DataState>((set) => ({
  tasks: [...TASKS],
  invites: [...INVITES],
  notifications: [...NOTIFICATIONS],
  projects: [...PROJECTS],
  users: [...USERS],
  memberships: [...MEMBERSHIPS],
  auditLogs: [...AUDIT_LOGS],
  healthChecks: [...HEALTH_CHECKS],
  setTasks: (t) => set({ tasks: t }),
  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
  updateTask: (id, data) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setInvites: (i) => set({ invites: i }),
  addInvite: (i) => set((s) => ({ invites: [i, ...s.invites] })),
  setNotifications: (n) => set({ notifications: n }),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: (userId) => set((s) => ({
    notifications: s.notifications.map((n) => (n.user_id === userId ? { ...n, read: true } : n)),
  })),
  setProjects: (p) => set({ projects: p }),
  addProject: (p) => set((s) => ({ projects: [p, ...s.projects] })),
  updateProject: (id, data) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
  setUsers: (u) => set({ users: u }),
  updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
  setMemberships: (m) => set({ memberships: m }),
  addMembership: (m) => set((s) => ({ memberships: [...s.memberships, m] })),
  resetSeed: () =>
    set({
      tasks: [...TASKS],
      invites: [...INVITES],
      notifications: [...NOTIFICATIONS],
      projects: [...PROJECTS],
      users: [...USERS],
      memberships: [...MEMBERSHIPS],
      auditLogs: [...AUDIT_LOGS],
      healthChecks: [...HEALTH_CHECKS],
    }),
}))
