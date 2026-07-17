# Daily Todo Workspace

You are a Senior Full Stack Engineer and Product Designer.

I want you to help me build a modern Todo application using the following stack.

---

# Tech Stack

- TanStack Start
- TanStack Router
- TanStack Query
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- PostgreSQL (Supabase)
- Lucide React

Architecture should follow best practices, scalable, clean folder structure, reusable components, type-safe, and server functions using TanStack Start.

---

# Project Goal

Build a **Daily Todo Workspace** instead of a traditional Todo application.

The application should feel minimal, clean, calm, and productive.

The UI should be inspired by **Neo Brutalism**, but not using the loud colorful version. https://www.neobrutalism.dev/

Instead create a style that is:

- Warm
- Soft
- Minimal
- Calm
- Rounded corners
- Subtle shadows
- Creamy background
- Muted purple accent
- Beige / Ivory / Warm gray palette
- Thick borders with a soft appearance
- Playful typography

Think of it as:

> **Warm Neo Brutalism**

Avoid:

- Glassmorphism
- Heavy dark UI
- Excessive gradients

---

# Layout

The application consists of:

- Dashboard
- History
- Settings (Future)

The dashboard contains two primary boards.

---

# Board 1 — Todo

This board is used to manage all upcoming tasks.

## Features

- Create task
- Edit task
- Delete task
- Reorder using drag & drop
- Checkbox
- Optional due date
- Optional note

The order must be persisted in the database.

Tasks can be rearranged freely.

---

# Board 2 — In Progress

This board contains tasks currently being worked on.

## Workflow

Example:

Initial Todo

- Task A
- Task B
- Task C
- Task D

User starts working on **Task A**.

Todo becomes

- Task B
- Task C
- Task D

In Progress becomes

- Task A

Support moving tasks:

- Todo → In Progress
- In Progress → Todo

A task can be marked as completed from the In Progress board.

---

# Task Lifecycle

The application should use a simple state machine.

```text
TODO
   │
   ▼
IN_PROGRESS
   │
   ▼
COMPLETED
   │
   ▼
ARCHIVED (Automatically on the next day)
```

Task Status Enum

```ts
enum TaskStatus {
  TODO,
  IN_PROGRESS,
  COMPLETED,
  ARCHIVED,
}
```

---

# Daily Behavior

This is the most important feature.

Example

## July 1

- Task A
- Task B
- Task C
- Task D

Task A is completed.

When the date changes to **July 2**:

Dashboard automatically hides Task A.

Only unfinished tasks remain visible.

Completed tasks are **never deleted**.

Instead, they are archived automatically.

---

# History Page

Create a separate page named:

**History**

History displays only completed/archived tasks.

Group tasks by completion date.

Example

## July 1

- ✅ Task A
- ✅ Task C

## July 2

- ✅ Task B

History is read-only.

---

# Database Design

Use:

- Drizzle ORM
- PostgreSQL
- UUID Primary Keys

## Users

| Column | Type |
|---------|------|
| id | uuid |
| name | text |
| email | text |
| created_at | timestamp |

---

## Tasks

| Column | Type |
|---------|------|
| id | uuid |
| user_id | uuid |
| title | text |
| description | text |
| status | TaskStatus |
| position | integer |
| due_date | timestamp |
| started_at | timestamp |
| completed_at | timestamp |
| archived_at | timestamp |
| estimated_minutes | integer |
| focus_count | integer |
| created_at | timestamp |
| updated_at | timestamp |

---

# Why These Fields?

### position

Stores drag-and-drop ordering.

### started_at

Used later for productivity statistics.

### completed_at

Determines completion date.

### archived_at

Marks when a task is hidden from the dashboard.

### estimated_minutes

Useful for future Pomodoro estimation.

### focus_count

Counts completed focus sessions.

---

# CRUD Requirements

Support:

- Create Task
- Update Task
- Delete Task
- Move between boards
- Reorder tasks
- Complete task
- Archive automatically
- View History

---

# Server Functions

Use TanStack Start Server Functions.

Create endpoints/functions for:

- Get Tasks
- Create Task
- Update Task
- Delete Task
- Move Task
- Update Task Position
- Complete Task
- Archive Expired Tasks
- Get History

---

# React Query

Use TanStack Query for:

- Fetching
- Caching
- Optimistic Updates
- Cache Invalidation

---

# UI Components

Create reusable components.

```text
components/
│
├── ui/
├── layout/
├── task/
├── history/
└── shared/
```

Suggested Components

- AppLayout
- Sidebar
- Header
- Board
- TaskCard
- TaskCheckbox
- TaskEditorModal
- EmptyState
- HistoryCard
- Button
- Input
- Textarea
- Badge
- Dialog

---

# Dashboard Layout

```text
---------------------------------------------------------
| Sidebar | Today's Tasks              | Focus Timer     |
|         |                            |                 |
|         | ┌──────────────────────┐   | 25:00           |
|         | │ Todo                 │   | Progress        |
|         | └──────────────────────┘   |                 |
|         |                            |                 |
|         | ┌──────────────────────┐   |                 |
|         | │ In Progress          │   |                 |
|         | └──────────────────────┘   |                 |
---------------------------------------------------------
```

Sidebar

- Dashboard
- History
- Settings

---

# Drag & Drop

Support drag-and-drop.

Requirements

- Reorder inside Todo
- Todo → In Progress
- In Progress → Todo

Persist ordering to PostgreSQL.

---

# Auto Archive Logic

Every time Dashboard loads:

```text
IF completed_at < today

THEN

status = ARCHIVED
archived_at = NOW()
```

Archived tasks:

- Hidden from Dashboard
- Visible in History
- Never deleted

---

# Folder Structure

```text
src/
│
├── components/
├── features/
│   ├── tasks/
│   ├── history/
│   └── dashboard/
│
├── routes/
├── server/
├── db/
│   ├── schema/
│   ├── migrations/
│   └── index.ts
│
├── hooks/
├── lib/
├── types/
└── utils/
```

---

# Code Style

Requirements

- TypeScript Strict Mode
- Reusable Hooks
- Feature-based architecture
- Clean code
- SOLID principles
- Type-safe queries
- Minimal duplication

---

# UI Theme

## Style

Warm Neo Brutalism

## Colors

Background

```css
#FAF8F5
```

Card

```css
#FFFDFB
```

Primary

```css
Soft Purple
```

Secondary

```css
Warm Ivory
```

Borders

- 2px solid
- Rounded 20px

Shadow

- Hard shadow
- Soft opacity

Typography

- Large headings
- Modern
- Highly readable

Animations should be subtle and minimal.

---

# Deliverables

Build the application incrementally.

Follow this order:

1. Project folder structure
2. Drizzle database schema
3. Database migrations
4. TanStack Start server functions
5. React Query integration
6. Dashboard UI
7. CRUD implementation
8. Drag & Drop
9. History page
10. Automatic archive logic

Do **not** generate everything at once.

Complete one step at a time and wait for confirmation before continuing.