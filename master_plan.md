# AI Code Review Assistant — Master Implementation Blueprint

> **Purpose:** This is the single source of truth for building the AI-Powered Code Review Assistant internship assignment. Feed this entire document to your AI coding agent (Cursor / Windsurf / Claude Code). Follow every section in order. No assumptions — every architectural decision, file path, schema, prompt, and commit message is specified here.
>
> **Groq API:** Use `https://api.groq.com/openai/v1` with model `llama-3.1-70b-versatile` (free tier, OpenAI-compatible, 32K context, fast). Get your key at console.groq.com.

---

## Table of Contents

1. [Assignment Quick Reference](#1-assignment-quick-reference)
2. [Tech Stack & Exact Dependencies](#2-tech-stack--exact-dependencies)
3. [Complete Repository Structure](#3-complete-repository-structure)
4. [Database Schema — Full Prisma](#4-database-schema--full-prisma)
5. [API Specification — All Endpoints](#5-api-specification--all-endpoints)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend Architecture — NestJS](#7-backend-architecture--nestjs)
8. [AI Integration Strategy](#8-ai-integration-strategy)
9. [AI Prompts — All Four](#9-ai-prompts--all-four)
10. [Bonus Features (2 of 5)](#10-bonus-features-2-of-5)
11. [Git Strategy — Branches + Commits](#11-git-strategy--branches--commits)
12. [3-Day Implementation Plan](#12-3-day-implementation-plan)
13. [Environment Variables](#13-environment-variables)
14. [Key Code Snippets — Critical Implementations](#14-key-code-snippets--critical-implementations)
15. [Security Checklist](#15-security-checklist)
16. [README.md Template](#16-readmemd-template)
17. [ARCHITECTURE.md Template](#17-architecturemd-template)
18. [AI_USAGE.md Template](#18-ai_usagemd-template)

---

## 1. Assignment Quick Reference

| Item | Choice |
|------|--------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS 10 (TypeScript) |
| Database | PostgreSQL 16 + Prisma 5 |
| AI Provider | Configurable OpenAI-compatible (Groq for dev/demo) |
| Bonus Features | Documentation Generator + Technical Debt Scanner |
| Deployment | Vercel (frontend) + Railway (backend + DB) — optional |

**Evaluation Weights:**
- Functionality 25% → Ship all 8 core features
- Code Quality 20% → Clean, typed, no console.logs in prod
- Architecture 15% → Separation of concerns, proper modules
- AI Integration 15% → Real prompts, structured output, configurable
- Database Design 10% → Proper relations, no data duplication
- Documentation 5% → README + ARCHITECTURE + AI_USAGE all present
- UI/UX 5% → Dark theme, clean layout, loading states
- Git Practices 5% → Conventional commits, feature branches

---

## 2. Tech Stack & Exact Dependencies

### Frontend `frontend/package.json`

```json
{
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.6",
    "@tanstack/react-query": "^5.51.11",
    "zustand": "^4.5.4",
    "axios": "^1.7.2",
    "@monaco-editor/react": "^4.6.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "date-fns": "^3.6.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
```

**shadcn/ui components to install after init:**
```bash
npx shadcn-ui@latest add button input label card badge dialog dropdown-menu select textarea separator skeleton progress tooltip scroll-area tabs table sheet avatar
```

### Backend `backend/package.json`

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.10",
    "@nestjs/core": "^10.3.10",
    "@nestjs/platform-express": "^10.3.10",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/config": "^3.2.3",
    "@nestjs/swagger": "^7.4.0",
    "@prisma/client": "^5.17.0",
    "prisma": "^5.17.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "openai": "^4.55.0",
    "multer": "^1.4.5-lts.1",
    "adm-zip": "^0.5.16",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.2",
    "@nestjs/schematics": "^10.1.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/multer": "^1.4.11",
    "@types/adm-zip": "^0.5.5",
    "@types/passport-jwt": "^4.0.1",
    "@types/node": "^20.14.11",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  }
}
```

---

## 3. Complete Repository Structure

```
ai-code-review/                          # Git root
├── frontend/                            # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                  # Route group — no layout
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/             # Route group — with sidebar layout
│   │   │   │   ├── layout.tsx           # Sidebar + auth guard
│   │   │   │   ├── page.tsx             # /  → Projects list
│   │   │   │   ├── projects/
│   │   │   │   │   └── [projectId]/
│   │   │   │   │       ├── page.tsx     # Project overview + stats
│   │   │   │   │       ├── files/
│   │   │   │   │       │   └── page.tsx # Code explorer
│   │   │   │   │       ├── review/
│   │   │   │   │       │   ├── page.tsx # Start review + history
│   │   │   │   │       │   └── [reviewId]/
│   │   │   │   │       │       └── page.tsx # Review detail
│   │   │   │   │       └── chat/
│   │   │   │   │           └── page.tsx # AI Chat
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx         # AI Provider config
│   │   │   ├── layout.tsx               # Root layout + QueryClient + Toaster
│   │   │   ├── page.tsx                 # Redirect → /login or /
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                      # shadcn auto-generated
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx          # Nav + user info + logout
│   │   │   │   └── DashboardShell.tsx   # Wrapper with header slot
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── CreateProjectDialog.tsx
│   │   │   │   └── DeleteProjectDialog.tsx
│   │   │   ├── files/
│   │   │   │   ├── FileTree.tsx         # Recursive collapsible tree
│   │   │   │   ├── FilePreview.tsx      # Monaco editor wrapper
│   │   │   │   └── FileUploadZone.tsx   # react-dropzone + ZIP support
│   │   │   ├── review/
│   │   │   │   ├── ReviewTemplateCard.tsx
│   │   │   │   ├── FileScopeSelector.tsx
│   │   │   │   ├── ReviewResultCard.tsx
│   │   │   │   ├── IssueCard.tsx
│   │   │   │   ├── SeverityBadge.tsx
│   │   │   │   └── ReviewHistoryList.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx       # Message list + scroll
│   │   │   │   ├── ChatMessage.tsx      # Single message bubble
│   │   │   │   ├── ChatInput.tsx        # Textarea + send button
│   │   │   │   └── SessionList.tsx
│   │   │   └── settings/
│   │   │       ├── ProviderCard.tsx
│   │   │       └── ProviderForm.tsx     # Add/Edit dialog
│   │   ├── hooks/
│   │   │   ├── useAuth.ts               # Register/login mutations
│   │   │   ├── useProjects.ts           # CRUD + invalidation
│   │   │   ├── useFiles.ts              # Upload + tree fetch
│   │   │   ├── useReviews.ts            # Create + fetch + history
│   │   │   ├── useChat.ts               # Sessions + messages
│   │   │   └── useProviders.ts          # CRUD + set default
│   │   ├── lib/
│   │   │   ├── api.ts                   # Axios instance + interceptors
│   │   │   ├── utils.ts                 # cn() helper + misc
│   │   │   └── constants.ts             # API_URL, severity colors
│   │   ├── store/
│   │   │   ├── authStore.ts             # Zustand: user, token, persist
│   │   │   └── uiStore.ts               # Zustand: selectedFileId
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── project.ts
│   │       ├── file.ts
│   │       ├── review.ts
│   │       └── chat.ts
│   ├── public/
│   ├── .env.local
│   ├── .env.example
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── components.json                  # shadcn config
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                             # NestJS App
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── login.dto.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── projects/
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   └── dto/
│   │   │       └── create-project.dto.ts
│   │   ├── files/
│   │   │   ├── files.module.ts
│   │   │   ├── files.controller.ts
│   │   │   ├── files.service.ts
│   │   │   └── dto/
│   │   ├── reviews/
│   │   │   ├── reviews.module.ts
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   └── dto/
│   │   │       └── create-review.dto.ts
│   │   ├── ai/
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts
│   │   │   └── prompts/
│   │   │       ├── security.prompt.ts
│   │   │       ├── performance.prompt.ts
│   │   │       ├── code-quality.prompt.ts
│   │   │       ├── chat.prompt.ts
│   │   │       ├── docs-generator.prompt.ts
│   │   │       └── debt-scanner.prompt.ts
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   └── dto/
│   │   │       ├── create-session.dto.ts
│   │   │       └── send-message.dto.ts
│   │   ├── providers/
│   │   │   ├── providers.module.ts
│   │   │   ├── providers.controller.ts
│   │   │   ├── providers.service.ts
│   │   │   └── dto/
│   │   │       └── create-provider.dto.ts
│   │   ├── bonus/
│   │   │   ├── bonus.module.ts
│   │   │   ├── bonus.controller.ts
│   │   │   └── bonus.service.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── interceptors/
│   │   │       └── transform.interceptor.ts
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   └── database.service.ts      # PrismaClient extension
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── uploads/                         # .gitignored — temp files
│   ├── .env
│   ├── .env.example
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
│
├── README.md
├── ARCHITECTURE.md
├── AI_USAGE.md
└── .gitignore
```

---

## 4. Database Schema — Full Prisma

**File:** `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users ───────────────────────────────────────────────────────────────────

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash, never store plaintext
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects     Project[]
  aiProviders  AiProvider[]
  chatSessions ChatSession[]

  @@map("users")
}

// ─── Projects ────────────────────────────────────────────────────────────────

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  files        File[]
  reviews      Review[]
  chatSessions ChatSession[]

  @@map("projects")
}

// ─── Files ───────────────────────────────────────────────────────────────────

model File {
  id        String   @id @default(uuid())
  name      String                         // basename: "Button.tsx"
  path      String                         // relative: "src/components/Button.tsx"
  content   String   @db.Text              // full file text
  language  String                         // "typescript", "python", etc.
  size      Int                            // bytes
  createdAt DateTime @default(now())
  projectId String

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  reviewFiles ReviewFile[]

  @@unique([projectId, path])              // no duplicate paths per project
  @@map("files")
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

model Review {
  id          String       @id @default(uuid())
  type        ReviewType
  status      ReviewStatus @default(PENDING)
  summary     String?      @db.Text
  createdAt   DateTime     @default(now())
  completedAt DateTime?
  projectId   String

  project Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  files   ReviewFile[]
  issues  Issue[]

  @@map("reviews")
}

model ReviewFile {
  reviewId String
  fileId   String

  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  file   File   @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([reviewId, fileId])
  @@map("review_files")
}

model Issue {
  id             String        @id @default(uuid())
  title          String
  description    String        @db.Text
  recommendation String?       @db.Text
  severity       IssueSeverity
  fileName       String?       // which file the issue is in
  lineNumber     Int?          // line number if known
  reviewId       String

  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@map("issues")
}

// ─── AI Providers ────────────────────────────────────────────────────────────

model AiProvider {
  id        String   @id @default(uuid())
  name      String                         // "Groq", "OpenAI", "LM Studio"
  baseUrl   String                         // "https://api.groq.com/openai/v1"
  apiKey    String                         // encrypted in production
  modelName String                         // "llama-3.1-70b-versatile"
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ai_providers")
}

// ─── Chat ────────────────────────────────────────────────────────────────────

model ChatSession {
  id        String   @id @default(uuid())
  title     String   @default("New Chat")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projectId String
  userId    String

  project  Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@map("chat_sessions")
}

model Message {
  id        String      @id @default(uuid())
  role      MessageRole
  content   String      @db.Text
  createdAt DateTime    @default(now())
  sessionId String

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("messages")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum ReviewType {
  SECURITY
  PERFORMANCE
  CODE_QUALITY
}

enum ReviewStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum IssueSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum MessageRole {
  USER
  ASSISTANT
}
```

**Run migrations:**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

## 5. API Specification — All Endpoints

**Base URL:** `http://localhost:3001/api`  
**Auth header:** `Authorization: Bearer <access_token>` on all protected routes  
**Response envelope:**
```json
{ "success": true, "data": <payload> }
```
**Error envelope:**
```json
{ "success": false, "statusCode": 400, "message": "Human readable error" }
```

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | ❌ | Create account |
| POST | /auth/login | ❌ | Get JWT token |
| GET | /auth/me | ✅ | Current user info |

**POST /auth/register**
```jsonc
// Request
{ "name": "Mayank Soni", "email": "cs24b1031@iiitr.ac.in", "password": "StrongPass123!" }
// Response 201
{ "access_token": "eyJ...", "user": { "id": "uuid", "name": "Mayank Soni", "email": "..." } }
// Error 409
{ "message": "Email already registered" }
```

**POST /auth/login**
```jsonc
// Request
{ "email": "...", "password": "..." }
// Response 200  
{ "access_token": "eyJ...", "user": { "id": "uuid", "name": "...", "email": "..." } }
// Error 401
{ "message": "Invalid credentials" }
```

### Projects — `/api/projects`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /projects | ✅ | List my projects |
| POST | /projects | ✅ | Create project |
| GET | /projects/:id | ✅ | Get project + stats |
| DELETE | /projects/:id | ✅ | Delete project |

**POST /projects body:**
```json
{ "name": "Portfolio Website", "description": "My personal portfolio (optional)" }
```

**GET /projects/:id response:**
```json
{
  "id": "uuid",
  "name": "Portfolio Website",
  "description": "...",
  "createdAt": "2024-01-01T00:00:00Z",
  "_count": { "files": 12, "reviews": 3 }
}
```

### Files — `/api/projects/:projectId/files`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /files/zip | ✅ | Upload ZIP file |
| POST | /files/upload | ✅ | Upload individual files |
| GET | /files | ✅ | Get file tree |
| GET | /files/:fileId | ✅ | Get single file content |
| DELETE | /files/:fileId | ✅ | Delete one file |
| DELETE | /files | ✅ | Delete all project files |

**POST /files/zip** — `multipart/form-data`, field: `file` (ZIP)  
**POST /files/upload** — `multipart/form-data`, field: `files` (multiple)

**GET /files response (file tree):**
```json
{
  "tree": [
    {
      "name": "src",
      "type": "directory",
      "path": "src",
      "children": [
        {
          "name": "index.ts",
          "type": "file",
          "id": "file-uuid",
          "path": "src/index.ts",
          "language": "typescript",
          "size": 1234
        }
      ]
    }
  ],
  "totalFiles": 15,
  "totalSize": 45678
}
```

### Reviews — `/api/projects/:projectId/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /reviews | ✅ | Start a review |
| GET | /reviews | ✅ | List project reviews |
| GET | /reviews/:reviewId | ✅ | Review detail + issues |
| GET | /api/reviews | ✅ | All reviews (search) |

**POST /reviews body:**
```json
{
  "type": "SECURITY",
  "scope": "project",
  "fileIds": []
}
```
`scope`: `"project"` (all files) | `"files"` (specific fileIds)

**GET /reviews/:reviewId response:**
```json
{
  "id": "uuid",
  "type": "SECURITY",
  "status": "COMPLETED",
  "summary": "The codebase has 2 critical and 4 high severity issues...",
  "createdAt": "...",
  "completedAt": "...",
  "issues": [
    {
      "id": "uuid",
      "title": "Hardcoded JWT Secret",
      "description": "JWT secret is hardcoded in auth.service.ts...",
      "recommendation": "Move to environment variable JWT_SECRET",
      "severity": "CRITICAL",
      "fileName": "auth.service.ts",
      "lineNumber": 23
    }
  ]
}
```

**GET /api/reviews?search=security&projectId=uuid** — search across all reviews

### Providers — `/api/providers`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /providers | ✅ | List my providers |
| POST | /providers | ✅ | Add provider |
| PUT | /providers/:id | ✅ | Update provider |
| DELETE | /providers/:id | ✅ | Delete provider |
| PATCH | /providers/:id/default | ✅ | Set as default |
| POST | /providers/:id/test | ✅ | Test connection |

**POST /providers body:**
```json
{
  "name": "Groq",
  "baseUrl": "https://api.groq.com/openai/v1",
  "apiKey": "gsk_xxxxxxxxxxxx",
  "modelName": "llama-3.1-70b-versatile"
}
```

**GET /providers response** — mask apiKey in responses:
```json
[{
  "id": "uuid",
  "name": "Groq",
  "baseUrl": "https://api.groq.com/openai/v1",
  "apiKey": "gsk_****xxxx",
  "modelName": "llama-3.1-70b-versatile",
  "isDefault": true
}]
```

### Chat — `/api/projects/:projectId/chat`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /chat | ✅ | List sessions |
| POST | /chat | ✅ | Create session |
| GET | /chat/:sessionId/messages | ✅ | Get messages |
| POST | /chat/:sessionId/messages | ✅ | Send message |

**POST /chat/:sessionId/messages body:**
```json
{ "content": "Explain how authentication works in this codebase." }
```

### Bonus — `/api/projects/:projectId/bonus`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /bonus/docs | ✅ | Generate documentation |
| POST | /bonus/debt-scan | ✅ | Technical debt scan |

---

## 6. Frontend Architecture

### Zustand Stores

**`store/authStore.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

**`store/uiStore.ts`**
```typescript
import { create } from 'zustand';

interface UiState {
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedFileId: null,
  setSelectedFileId: (id) => set({ selectedFileId: id }),
}));
```

### Axios API Client

**`lib/api.ts`**
```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### TypeScript Types

**`types/review.ts`**
```typescript
export type ReviewType = 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY';
export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Issue {
  id: string;
  title: string;
  description: string;
  recommendation?: string;
  severity: IssueSeverity;
  fileName?: string;
  lineNumber?: number;
}

export interface Review {
  id: string;
  type: ReviewType;
  status: ReviewStatus;
  summary?: string;
  createdAt: string;
  completedAt?: string;
  issues: Issue[];
}
```

**`types/file.ts`**
```typescript
export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  id?: string;           // only for files
  language?: string;     // only for files
  size?: number;         // only for files
  children?: FileNode[]; // only for directories
}

export interface FileContent {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}
```

### UI Design System

**Tailwind config additions in `tailwind.config.ts`:**
```typescript
// Base theme: dark slate
// background: slate-950, slate-900, slate-800
// border: slate-700/50
// text: slate-100 (primary), slate-400 (muted)
// accent: indigo-600 (buttons, links, active states)

// Severity badge colors:
// CRITICAL → bg-red-500/20 text-red-400 border-red-500/30
// HIGH     → bg-orange-500/20 text-orange-400 border-orange-500/30
// MEDIUM   → bg-yellow-500/20 text-yellow-400 border-yellow-500/30
// LOW      → bg-blue-500/20 text-blue-400 border-blue-500/30
```

### Page Specifications

**Root `/app/page.tsx`**
```typescript
// Redirect based on auth state
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
export default function RootPage() {
  // Check token existence → redirect to '/' (dashboard) or '/login'
}
```

**Dashboard Layout `/app/(dashboard)/layout.tsx`**
- Left sidebar (240px): Logo, nav items, user card, logout
- Nav items: Projects (/), Settings (/settings)
- Auth check: if no token → redirect('/login')
- Main area: `{children}` with padding

**Projects List `/app/(dashboard)/page.tsx`**
- Header: "My Projects" + "New Project" button
- Grid layout (3 cols desktop, 1 mobile): `<ProjectCard />` per project
- Each card: name, description, file count badge, review count badge, created date, delete button
- Empty state: icon + "Create your first project" CTA
- Loading: 6 skeleton cards

**File Explorer `/app/(dashboard)/projects/[projectId]/files/page.tsx`**
- Left panel (280px): `<FileTree />` + upload button
- Right panel (flex-1): `<FilePreview />` with Monaco
- When no file selected: placeholder with "Select a file to preview"
- Monaco options: `readOnly: true`, `theme: 'vs-dark'`, `minimap: { enabled: false }`

**Review Hub `/app/(dashboard)/projects/[projectId]/review/page.tsx`**
- Section 1: 3 template cards (Security / Performance / Code Quality)
  - Each: icon, title, description of what it checks, click to select
  - Selected card: indigo border + bg
- Section 2: Scope selector
  - Entire Project (radio) — default
  - Specific Files (radio) → shows multi-select file list
- Section 3: "Start Review" button (disabled until template selected)
- Section 4: Recent reviews list (last 10)

**Review Detail `/app/(dashboard)/projects/[projectId]/review/[reviewId]/page.tsx`**
- Header: type badge, status badge, timestamps
- Summary box: gray bg, review summary text
- Issues grouped by severity (CRITICAL first)
- Each issue: expandable card with description + recommendation
- Issue count by severity: "2 Critical · 4 High · 3 Medium · 1 Low"

**AI Chat `/app/(dashboard)/projects/[projectId]/chat/page.tsx`**
- Left panel (240px): session list + "New Chat" button
- Right panel: ChatWindow
  - Messages scroll container
  - User messages: right-aligned, indigo bg
  - AI messages: left-aligned, slate-800 bg, markdown rendered
  - Input: textarea + send button + Ctrl+Enter shortcut
  - Loading: animated dots while AI responds

**Settings `/app/(dashboard)/settings/page.tsx`**
- Section header: "AI Providers"
- List of configured providers with default badge
- Add Provider button → `<ProviderForm />` dialog
- Each provider: name, base URL (truncated), model, default toggle, edit/delete actions
- Test Connection button per provider

---

## 7. Backend Architecture — NestJS

### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip unknown properties
      transform: true,         // auto-transform types
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}
bootstrap();
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { ProvidersModule } from './providers/providers.module';
import { BonusModule } from './bonus/bonus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    FilesModule,
    ReviewsModule,
    AiModule,
    ChatModule,
    ProvidersModule,
    BonusModule,
  ],
})
export class AppModule {}
```

### DTOs

**`auth/dto/register.dto.ts`**
```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

**`reviews/dto/create-review.dto.ts`**
```typescript
import { IsEnum, IsArray, IsOptional, IsString } from 'class-validator';
import { ReviewType } from '@prisma/client';

export class CreateReviewDto {
  @IsEnum(ReviewType)
  type: ReviewType;

  @IsString()
  @IsOptional()
  scope?: 'project' | 'files';  // default: 'project'

  @IsArray()
  @IsOptional()
  fileIds?: string[];            // required when scope === 'files'
}
```

**`providers/dto/create-provider.dto.ts`**
```typescript
import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  baseUrl: string;   // not @IsUrl() — allows localhost

  @IsString()
  apiKey: string;

  @IsString()
  modelName: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
```

### Common Infrastructure

**`common/interceptors/transform.interceptor.ts`**
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({ success: true, data })),
    );
  }
}
```

**`common/filters/http-exception.filter.ts`**
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (exception.getResponse() as any).message || exception.message
      : 'Internal server error';

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}
```

**`common/decorators/current-user.decorator.ts`**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // injected by JwtStrategy.validate()
  },
);
```

**`database/database.service.ts`**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### Auth Module — Critical Code

**`auth/strategies/jwt.strategy.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
```

**`auth/guards/jwt-auth.guard.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new UnauthorizedException('Invalid or expired token');
    return user;
  }
}
```

**`auth/auth.service.ts`**
```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.db.user.create({
      data: { name: dto.name, email: dto.email, password: hash },
    });

    return this.signToken(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.name);
  }

  async getMe(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  private signToken(id: string, email: string, name: string) {
    const payload = { sub: id, email };
    return {
      access_token: this.jwt.sign(payload),
      user: { id, name, email },
    };
  }
}
```

### Files Service — ZIP Processing

**`files/files.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { DatabaseService } from '../database/database.service';

const SKIP_PATTERNS = ['node_modules/', '.git/', '__pycache__/', '.DS_Store', '.next/', 'dist/', 'build/'];
const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h', '.cs', '.rb', '.php',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.ini',
  '.md', '.txt', '.sql', '.sh', '.bash', '.zsh',
  '.env.example', '.gitignore', '.dockerignore', 'Dockerfile',
];
const MAX_FILE_SIZE = 100_000; // 100KB per file

@Injectable()
export class FilesService {
  constructor(private db: DatabaseService) {}

  async processZip(projectId: string, buffer: Buffer) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const results = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (SKIP_PATTERNS.some((p) => entry.entryName.includes(p))) continue;

      const ext = path.extname(entry.entryName).toLowerCase();
      const basename = path.basename(entry.entryName);
      if (!CODE_EXTENSIONS.includes(ext) && !CODE_EXTENSIONS.includes(basename)) continue;

      const content = entry.getData().toString('utf8');
      if (content.length > MAX_FILE_SIZE) continue;

      const file = await this.db.file.upsert({
        where: { projectId_path: { projectId, path: entry.entryName } },
        update: { content, size: content.length },
        create: {
          name: basename,
          path: entry.entryName,
          content,
          language: this.detectLanguage(ext || basename),
          size: content.length,
          projectId,
        },
      });
      results.push(file);
    }

    return results;
  }

  async processFiles(projectId: string, files: Express.Multer.File[]) {
    const results = [];
    for (const file of files) {
      const content = file.buffer.toString('utf8');
      const ext = path.extname(file.originalname).toLowerCase();

      const saved = await this.db.file.upsert({
        where: { projectId_path: { projectId, path: file.originalname } },
        update: { content, size: content.length },
        create: {
          name: path.basename(file.originalname),
          path: file.originalname,
          content,
          language: this.detectLanguage(ext),
          size: content.length,
          projectId,
        },
      });
      results.push(saved);
    }
    return results;
  }

  async getFileTree(projectId: string, userId: string) {
    await this.verifyProjectOwner(projectId, userId);
    const files = await this.db.file.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
      select: { id: true, name: true, path: true, language: true, size: true },
    });

    const tree = this.buildTree(files);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    return { tree, totalFiles: files.length, totalSize };
  }

  buildTree(files: { id: string; name: string; path: string; language: string; size: number }[]) {
    const root: any[] = [];

    for (const file of files) {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        let dir = current.find((n: any) => n.name === part && n.type === 'directory');
        if (!dir) {
          dir = { name: part, type: 'directory', path: parts.slice(0, i + 1).join('/'), children: [] };
          current.push(dir);
        }
        current = dir.children;
      }

      current.push({
        id: file.id,
        name: file.name,
        type: 'file',
        path: file.path,
        language: file.language,
        size: file.size,
      });
    }

    return root;
  }

  private detectLanguage(extOrName: string): string {
    const map: Record<string, string> = {
      '.ts': 'typescript', '.tsx': 'typescript',
      '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
      '.py': 'python', '.java': 'java', '.go': 'go',
      '.rs': 'rust', '.cpp': 'cpp', '.c': 'c', '.h': 'c',
      '.cs': 'csharp', '.rb': 'ruby', '.php': 'php',
      '.html': 'html', '.css': 'css', '.scss': 'scss',
      '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
      '.toml': 'toml', '.md': 'markdown', '.sql': 'sql',
      '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
      'Dockerfile': 'dockerfile',
    };
    return map[extOrName] || 'plaintext';
  }

  private async verifyProjectOwner(projectId: string, userId: string) {
    const project = await this.db.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
```

### Reviews Service

**`reviews/reviews.service.ts`**
```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private db: DatabaseService,
    private ai: AiService,
  ) {}

  async createReview(userId: string, projectId: string, dto: CreateReviewDto) {
    // Verify ownership
    const project = await this.db.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');

    // Get files to review
    let files;
    if (dto.scope === 'files' && dto.fileIds?.length) {
      files = await this.db.file.findMany({
        where: { id: { in: dto.fileIds }, projectId },
      });
    } else {
      files = await this.db.file.findMany({ where: { projectId } });
    }

    if (!files.length) throw new BadRequestException('No files to review. Upload files first.');

    // Create review record
    const review = await this.db.review.create({
      data: { type: dto.type, status: ReviewStatus.IN_PROGRESS, projectId },
    });

    try {
      // Call AI
      const result = await this.ai.generateReview(userId, files, dto.type);

      // Store results
      await this.db.review.update({
        where: { id: review.id },
        data: {
          status: ReviewStatus.COMPLETED,
          summary: result.summary,
          completedAt: new Date(),
        },
      });

      if (result.issues?.length) {
        await this.db.issue.createMany({
          data: result.issues.map((issue: any) => ({
            title: issue.title,
            description: issue.description,
            recommendation: issue.recommendation || null,
            severity: issue.severity,
            fileName: issue.fileName || null,
            lineNumber: issue.lineNumber || null,
            reviewId: review.id,
          })),
        });
      }

      // Link files to review
      await this.db.reviewFile.createMany({
        data: files.map((f) => ({ reviewId: review.id, fileId: f.id })),
        skipDuplicates: true,
      });

      return this.getReviewById(review.id);
    } catch (error) {
      await this.db.review.update({
        where: { id: review.id },
        data: { status: ReviewStatus.FAILED },
      });
      throw new BadRequestException(`Review failed: ${error.message}`);
    }
  }

  async getReviewById(reviewId: string) {
    return this.db.review.findUnique({
      where: { id: reviewId },
      include: {
        issues: { orderBy: { severity: 'asc' } },
        files: { include: { file: { select: { id: true, name: true, path: true } } } },
      },
    });
  }

  async getProjectReviews(projectId: string, userId: string) {
    const project = await this.db.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.db.review.findMany({
      where: { projectId },
      include: { _count: { select: { issues: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReviews(userId: string, search?: string) {
    return this.db.review.findMany({
      where: {
        project: { userId },
        ...(search ? { type: { equals: search.toUpperCase() as any } } : {}),
      },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { issues: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
```

---

## 8. AI Integration Strategy

### AI Service

**`ai/ai.service.ts`**
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { ReviewType } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { SECURITY_PROMPT } from './prompts/security.prompt';
import { PERFORMANCE_PROMPT } from './prompts/performance.prompt';
import { CODE_QUALITY_PROMPT } from './prompts/code-quality.prompt';

const PROMPT_MAP: Record<ReviewType, string> = {
  SECURITY: SECURITY_PROMPT,
  PERFORMANCE: PERFORMANCE_PROMPT,
  CODE_QUALITY: CODE_QUALITY_PROMPT,
};

const MAX_CONTENT_CHARS = 60_000;      // ~15k tokens, fits in 32k context
const MAX_FILE_CHARS = 6_000;          // truncate individual large files
const MAX_FILES_FOR_REVIEW = 25;

@Injectable()
export class AiService {
  constructor(private db: DatabaseService) {}

  async getClient(userId: string): Promise<{ client: OpenAI; provider: any }> {
    const provider = await this.db.aiProvider.findFirst({
      where: { userId, isDefault: true },
    });

    if (!provider) {
      throw new BadRequestException(
        'No AI provider configured. Go to Settings → Add a provider and set it as default.',
      );
    }

    const client = new OpenAI({
      baseURL: provider.baseUrl,
      apiKey: provider.apiKey,
      timeout: 120_000, // 2 minutes for large reviews
    });

    return { client, provider };
  }

  async generateReview(userId: string, files: any[], type: ReviewType) {
    const { client, provider } = await this.getClient(userId);

    // Build code content respecting token limits
    const codeContent = this.buildCodeContent(files, MAX_FILES_FOR_REVIEW, MAX_FILE_CHARS, MAX_CONTENT_CHARS);
    const systemPrompt = PROMPT_MAP[type];

    const response = await client.chat.completions.create({
      model: provider.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze the following codebase:\n\n${codeContent}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('AI returned empty response');

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('AI returned invalid JSON. Try again.');
    }
  }

  async generateChatResponse(
    userId: string,
    projectId: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    userMessage: string,
  ) {
    const { client, provider } = await this.getClient(userId);

    // Get project files for context (prioritize smaller files)
    const files = await this.db.file.findMany({
      where: { projectId },
      orderBy: { size: 'asc' },
      take: 15,
    });

    const codeContext = this.buildCodeContent(files, 15, 3_000, 30_000);
    const systemPrompt = `You are an expert code assistant. You have access to the following codebase:\n\n${codeContext}\n\nAnswer questions accurately. Reference specific file names when relevant. Format responses with markdown.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: provider.modelName,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || 'No response generated.';
  }

  async testConnection(provider: { baseUrl: string; apiKey: string; modelName: string }) {
    const client = new OpenAI({ baseURL: provider.baseUrl, apiKey: provider.apiKey });
    try {
      await client.chat.completions.create({
        model: provider.modelName,
        messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
        max_tokens: 5,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  buildCodeContent(files: any[], maxFiles: number, maxPerFile: number, maxTotal: number): string {
    let total = 0;
    const parts = [];

    for (const file of files.slice(0, maxFiles)) {
      const content = file.content.length > maxPerFile
        ? file.content.slice(0, maxPerFile) + '\n... [truncated]'
        : file.content;

      const block = `### File: ${file.path}\n\`\`\`${file.language}\n${content}\n\`\`\``;
      if (total + block.length > maxTotal) break;

      parts.push(block);
      total += block.length;
    }

    return parts.join('\n\n---\n\n');
  }
}
```

---

## 9. AI Prompts — All Four

### Security Review — `ai/prompts/security.prompt.ts`

```typescript
export const SECURITY_PROMPT = `You are a senior application security engineer with 15+ years of experience in secure code review, penetration testing, and threat modeling. Your task is to perform a thorough security audit of the provided codebase.

FOCUS AREAS:
1. Hardcoded credentials, secrets, API keys, tokens, or passwords
2. Authentication flaws: weak session management, missing token expiry, insecure storage
3. Authorization issues: missing access controls, IDOR (Insecure Direct Object Reference)
4. Input validation: missing sanitization, lack of length limits, trusting client data
5. Injection vulnerabilities: SQL injection, NoSQL injection, command injection, LDAP injection
6. XSS (Cross-Site Scripting): reflected, stored, or DOM-based
7. CSRF (Cross-Site Request Forgery): missing CSRF tokens
8. Security misconfiguration: CORS wildcard, debug modes in production, verbose errors
9. Sensitive data exposure: PII in logs, unencrypted storage, insecure transmission
10. Vulnerable dependencies: outdated packages with known CVEs (if package files present)

SEVERITY GUIDELINES:
- CRITICAL: Immediately exploitable, no authentication needed, leads to data breach or system takeover
- HIGH: Exploitable with authentication or under common conditions, serious risk
- MEDIUM: Exploitable under specific circumstances, moderate risk
- LOW: Best practice violation, defense-in-depth improvement, minimal direct risk

RULES:
- Reference exact file names and line numbers whenever possible
- Every issue MUST have a specific, actionable recommendation
- Do not report theoretical issues without evidence in the code
- Do not repeat similar issues — consolidate them

CRITICAL INSTRUCTION: Respond with ONLY a valid JSON object. No preamble, no explanation, no markdown fences. Start with { and end with }.

JSON FORMAT:
{
  "summary": "2-3 sentences: overall security posture, most critical finding, immediate action needed",
  "issues": [
    {
      "title": "Concise title (max 60 chars)",
      "description": "Detailed explanation: what the vulnerability is, where it exists, why it is dangerous",
      "recommendation": "Exact steps to remediate: code changes, configuration updates, best practice to adopt",
      "severity": "CRITICAL",
      "fileName": "src/auth/auth.service.ts",
      "lineNumber": 42
    }
  ]
}`;
```

### Performance Review — `ai/prompts/performance.prompt.ts`

```typescript
export const PERFORMANCE_PROMPT = `You are a principal performance engineer specializing in full-stack web applications, backend systems, and database optimization. Your task is to identify performance bottlenecks in the provided codebase.

FOCUS AREAS:
1. N+1 query problems: database queries inside loops, missing eager loading
2. Missing database indexes: inferred from query patterns and WHERE clauses
3. Inefficient algorithms: O(n²) where O(n) or O(n log n) is achievable
4. Memory leaks: unreleased event listeners, unclosed connections, global state accumulation
5. Unnecessary re-renders in React: missing useMemo, useCallback, React.memo
6. Blocking operations: synchronous I/O, heavy computation on the main thread
7. Missing caching: repeated identical DB queries, external API calls without cache
8. Bundle size issues: large unnecessary imports, no code splitting, missing lazy loading
9. Inefficient data fetching: over-fetching (SELECT *), under-fetching (waterfall requests)
10. Connection pool misuse: not reusing DB connections, too many connections

SEVERITY GUIDELINES:
- CRITICAL: System becomes unusable under normal load (>1000 users), O(n²) on large datasets
- HIGH: Significant degradation (2-5x slower), obvious N+1 queries, missing indexes on frequent queries
- MEDIUM: Noticeable slowness, optimization brings meaningful improvement
- LOW: Minor optimization, negligible user impact but good practice

RULES:
- Quantify impact when possible: "This causes N database queries per request"
- Reference exact file and line number
- Suggest specific, implementable optimizations
- Prioritize user-facing performance impact

CRITICAL INSTRUCTION: Respond with ONLY a valid JSON object. No preamble, no explanation, no markdown fences. Start with { and end with }.

JSON FORMAT:
{
  "summary": "2-3 sentences: overall performance assessment, most impactful bottleneck, estimated improvement potential",
  "issues": [
    {
      "title": "Concise title (max 60 chars)",
      "description": "Explanation of the bottleneck, estimated impact (e.g. 'adds 100ms per request'), and where it occurs",
      "recommendation": "Specific optimization steps with example code patterns if helpful",
      "severity": "HIGH",
      "fileName": "src/projects/projects.service.ts",
      "lineNumber": 67
    }
  ]
}`;
```

### Code Quality Review — `ai/prompts/code-quality.prompt.ts`

```typescript
export const CODE_QUALITY_PROMPT = `You are a principal software engineer and clean code advocate with deep expertise in TypeScript, React, and Node.js. Your task is to review the provided codebase for code quality, maintainability, and adherence to software engineering principles.

FOCUS AREAS:
1. Naming: unclear variable/function/class names that don't express intent
2. DRY violations: duplicated logic that should be extracted into shared utilities or hooks
3. Single Responsibility: functions/classes doing too many things (> 20-30 lines per function is a smell)
4. Error handling: missing try-catch, unhandled promise rejections, swallowed errors
5. Type safety: use of `any`, missing return types, unsafe type assertions
6. Code organization: misplaced files, wrong module boundaries, circular dependencies
7. Dead code: unused variables, imports, functions, commented-out code
8. Magic values: hardcoded strings/numbers that should be named constants or config
9. Documentation gaps: complex logic without comments, missing JSDoc for public APIs
10. Test coverage: critical business logic without any test coverage (if test files absent)

SEVERITY GUIDELINES:
- CRITICAL: Causes bugs in production or makes the codebase unmaintainable at scale
- HIGH: Significantly hurts readability, onboarding new developers, or future extensibility
- MEDIUM: Notable best practice violation worth fixing in the next sprint
- LOW: Style preference, minor cleanup, nice-to-have improvement

RULES:
- Be constructive — frame issues as improvements, not criticism
- Suggest concrete refactoring with before/after patterns when helpful
- Reference specific design patterns (Repository Pattern, Factory, etc.) when applicable
- Skip trivial formatting issues — focus on substance

CRITICAL INSTRUCTION: Respond with ONLY a valid JSON object. No preamble, no explanation, no markdown fences. Start with { and end with }.

JSON FORMAT:
{
  "summary": "2-3 sentences: overall code quality score, strongest area, most impactful improvement opportunity",
  "issues": [
    {
      "title": "Concise title (max 60 chars)",
      "description": "What the quality issue is and why it matters for maintainability or correctness",
      "recommendation": "Specific refactoring approach, pattern to apply, or example of improved code",
      "severity": "MEDIUM",
      "fileName": "src/components/ReviewDetail.tsx",
      "lineNumber": 112
    }
  ]
}`;
```

### Chat System Prompt — `ai/prompts/chat.prompt.ts`

```typescript
export const buildChatSystemPrompt = (codeContext: string) => `You are an expert code assistant. A developer is asking you questions about their codebase. You have full access to their source code below.

YOUR CAPABILITIES:
- Explain how specific features or flows work end-to-end
- Identify which files and functions handle specific functionality
- Trace data flow through the application
- Point out potential bugs or improvements
- Answer architecture and design pattern questions
- Help debug issues by reasoning through the code

RULES:
- Always reference specific file names (e.g., "In \`auth.service.ts\`, line 45...")
- Be concise but complete — don't pad with unnecessary caveats
- Use code snippets from the actual codebase to illustrate answers
- If the answer isn't evident from the provided code, say so honestly
- Format responses with proper markdown: headers, code blocks, bullet points

CODEBASE:
${codeContext}`;
```

---

## 10. Bonus Features (2 of 5)

**Chosen:** Documentation Generator + Technical Debt Scanner

### Bonus 1: Documentation Generator

**Backend endpoint:** `POST /api/projects/:projectId/bonus/docs`

**`ai/prompts/docs-generator.prompt.ts`**
```typescript
export const DOCS_GENERATOR_PROMPT = `You are a technical writer and senior developer. Generate comprehensive, professional documentation for the provided codebase that a new developer could use to understand and set up the project.

GENERATE THESE SECTIONS:
1. Project Overview: what this project does, its purpose, core value proposition
2. Tech Stack: detected technologies, frameworks, and why they were likely chosen
3. Architecture Overview: high-level description of how components interact
4. Setup Instructions: step-by-step local setup (infer from package.json, config files, etc.)
5. Project Structure: explain what each major directory/file does
6. API Documentation: list and describe endpoints if API routes are found
7. Key Components / Modules: explain the most important parts of the codebase
8. Environment Variables: list all .env variables found or referenced
9. Contributing: how to add features, code style notes

CRITICAL INSTRUCTION: Respond with ONLY a valid JSON object.

JSON FORMAT:
{
  "readme": "Full README.md content in markdown (comprehensive, production-ready)",
  "setupGuide": "Step-by-step setup guide in markdown",
  "apiDocs": "API documentation in markdown, or null if no API routes found"
}`;
```

**Frontend:** Add "Generate Docs" button on project overview page. Show result in a tabbed modal (README / Setup / API). Provide "Copy" button for each tab.

### Bonus 2: Technical Debt Scanner

**Backend endpoint:** `POST /api/projects/:projectId/bonus/debt-scan`

**`ai/prompts/debt-scanner.prompt.ts`**
```typescript
export const DEBT_SCANNER_PROMPT = `You are a technical debt analyst with expertise in large-scale codebase evolution. Scan the provided codebase for technical debt that will slow down future development.

SCAN FOR:
1. Outdated patterns: deprecated APIs, legacy syntax, old framework patterns
2. Missing test coverage: critical functions/classes with no associated tests
3. TODO/FIXME/HACK comments: unresolved known issues in the code
4. Hardcoded configuration: values that belong in environment variables or config files
5. Inconsistent patterns: multiple approaches to the same problem (e.g., 3 different ways to handle errors)
6. Missing TypeScript strictness: loose types, any usage, missing interfaces
7. Overly complex functions: cyclomatic complexity > 10, functions > 50 lines
8. Circular dependencies: modules that import each other
9. Missing error boundaries: React components without error handling
10. Outdated dependencies: version pinning with old major versions

DEBT SCORE: Rate 1-10 where 10 = pristine, 1 = needs full rewrite.

PRIORITY: HIGH = fix this sprint | MEDIUM = fix next quarter | LOW = nice to have
EFFORT: HIGH = 1+ week | MEDIUM = 1-2 days | LOW = < 4 hours

CRITICAL INSTRUCTION: Respond with ONLY a valid JSON object.

JSON FORMAT:
{
  "debtScore": 7.5,
  "summary": "2-3 sentence overall technical debt assessment and recommended focus area",
  "items": [
    {
      "category": "Missing Tests",
      "description": "Specific description of the debt and its impact on development velocity",
      "priority": "HIGH",
      "effort": "MEDIUM",
      "fileName": "src/reviews/reviews.service.ts",
      "lineNumber": null
    }
  ]
}`;
```

**Frontend:** Add "Scan Debt" button. Show results with a debt score meter (e.g., circular progress), items grouped by priority.

---

## 11. Git Strategy — Branches + Commits

### Branch Structure

```
main                          # always deployable, protected
└── develop                   # integration branch
    ├── feature/auth
    ├── feature/projects
    ├── feature/file-upload
    ├── feature/code-explorer
    ├── feature/ai-service
    ├── feature/review-engine
    ├── feature/review-history
    ├── feature/ai-chat
    ├── feature/provider-settings
    └── feature/bonus-features
```

**Branch workflow:**
```bash
git checkout develop
git checkout -b feature/auth
# ... implement feature ...
git add .
git commit -m "feat(auth): implement JWT register and login"
git checkout develop
git merge feature/auth
```

### Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <imperative description>

Types:   feat | fix | docs | chore | style | refactor | test | perf
Scopes:  auth | projects | files | review | chat | ai | providers | frontend | backend | db
```

### Complete Commit Sequence (Copy Exactly)

```bash
# ── INITIAL SETUP ──────────────────────────────────────────────────────────
git commit -m "chore: initialize monorepo with frontend and backend"
git commit -m "chore(backend): setup NestJS with TypeScript, Prisma, and config"
git commit -m "chore(frontend): setup Next.js 14 App Router with TypeScript and Tailwind"
git commit -m "chore(frontend): add shadcn/ui and configure dark theme"
git commit -m "chore(db): define complete Prisma schema with all models and enums"

# ── AUTH ───────────────────────────────────────────────────────────────────
git commit -m "feat(auth): implement user registration with bcrypt password hashing"
git commit -m "feat(auth): implement login with JWT token generation"
git commit -m "feat(auth): add JWT strategy and auth guard for protected routes"
git commit -m "feat(frontend): add login page with form validation and error handling"
git commit -m "feat(frontend): add register page with password strength indicator"
git commit -m "feat(frontend): setup Zustand auth store with localStorage persistence"
git commit -m "feat(frontend): configure axios with JWT interceptor and 401 redirect"

# ── PROJECTS ───────────────────────────────────────────────────────────────
git commit -m "feat(projects): implement project CRUD with user ownership guard"
git commit -m "feat(frontend): add projects dashboard with card grid layout"
git commit -m "feat(frontend): add create project dialog with optimistic updates"
git commit -m "feat(frontend): add delete project with confirmation dialog"

# ── FILE UPLOAD ────────────────────────────────────────────────────────────
git commit -m "feat(files): implement ZIP upload with AdmZip extraction and filtering"
git commit -m "feat(files): implement multi-file drag-and-drop upload endpoint"
git commit -m "feat(files): add file tree builder algorithm for nested directory structure"
git commit -m "feat(frontend): add FileUploadZone with react-dropzone, ZIP and file support"

# ── CODE EXPLORER ──────────────────────────────────────────────────────────
git commit -m "feat(files): expose file tree and single file content endpoints"
git commit -m "feat(frontend): add recursive FileTree component with collapsible directories"
git commit -m "feat(frontend): integrate Monaco editor for file preview with syntax highlighting"
git commit -m "feat(frontend): add language-to-Monaco mapping for all supported file types"

# ── AI SERVICE ─────────────────────────────────────────────────────────────
git commit -m "feat(ai): implement configurable OpenAI-compatible provider service"
git commit -m "feat(ai): add security review prompt with OWASP-aligned focus areas"
git commit -m "feat(ai): add performance review prompt with N+1 and algorithm analysis"
git commit -m "feat(ai): add code quality review prompt with clean code principles"
git commit -m "feat(providers): implement provider CRUD with default selection and masking"
git commit -m "feat(providers): add provider connection test endpoint"
git commit -m "feat(frontend): add provider settings page with add/edit/delete/test"

# ── REVIEW ENGINE ──────────────────────────────────────────────────────────
git commit -m "feat(review): implement review creation with AI generation and issue storage"
git commit -m "feat(review): add review status tracking with PENDING/IN_PROGRESS/COMPLETED/FAILED"
git commit -m "feat(frontend): add review template selector with Security/Performance/Quality cards"
git commit -m "feat(frontend): add file scope selector for single file and multi-file reviews"
git commit -m "feat(frontend): add review results display with severity-grouped issue cards"
git commit -m "feat(frontend): add SeverityBadge component with color-coded system"

# ── REVIEW HISTORY ─────────────────────────────────────────────────────────
git commit -m "feat(review): implement review history endpoint with search support"
git commit -m "feat(frontend): add review history list with status badges and timestamps"
git commit -m "feat(frontend): add review detail page with full issue breakdown"

# ── AI CHAT ────────────────────────────────────────────────────────────────
git commit -m "feat(chat): implement chat session management with message persistence"
git commit -m "feat(chat): inject project code as context for AI chat responses"
git commit -m "feat(frontend): add chat interface with session list and message history"
git commit -m "feat(frontend): add ChatInput with Ctrl+Enter submit and loading indicator"

# ── BONUS ──────────────────────────────────────────────────────────────────
git commit -m "bonus(docs): implement documentation generator with README and API docs output"
git commit -m "bonus(debt): implement technical debt scanner with priority scoring"
git commit -m "feat(frontend): add docs generator and debt scan buttons on project page"

# ── POLISH ─────────────────────────────────────────────────────────────────
git commit -m "style(frontend): add loading skeletons for projects, files, and reviews"
git commit -m "style(frontend): add empty states with CTAs for all list views"
git commit -m "style(frontend): polish sidebar, responsive layout, mobile nav"
git commit -m "fix(backend): handle AI provider not configured with helpful error message"
git commit -m "fix(files): handle malformed ZIP files and binary file detection"
git commit -m "fix(review): handle AI JSON parse errors with retry logic"
git commit -m "perf(ai): implement code content truncation to stay within token limits"

# ── DOCUMENTATION ──────────────────────────────────────────────────────────
git commit -m "docs: add comprehensive README with setup, features, and env vars"
git commit -m "docs: add ARCHITECTURE.md with system design and data flow"
git commit -m "docs: add AI_USAGE.md with tool disclosure and prompt documentation"

# ── FINAL ──────────────────────────────────────────────────────────────────
git commit -m "chore: add .env.example files for frontend and backend"
git commit -m "chore: add .gitignore to exclude secrets, uploads, and build artifacts"
git commit -m "chore: final cleanup, remove console.logs, add production env defaults"
```

### Root `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build artifacts
.next/
dist/
build/
out/

# Environment — NEVER commit these
.env
.env.local
.env.production
.env.*.local
# Allow examples
!.env.example
!.env.local.example

# Database
*.db
*.sqlite
*.sqlite3

# Uploads — user-uploaded files stay local
backend/uploads/

# OS
.DS_Store
.DS_Store?
._*
Thumbs.db

# IDE
.idea/
.vscode/
*.suo
*.ntvs*

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Testing
coverage/
```

---

## 12. 3-Day Implementation Plan

### Day 1 — Foundation (Auth + Projects + File Upload)

**Morning Block (4h): Backend foundation**
```bash
# 1. Initialize NestJS
npm i -g @nestjs/cli
nest new backend --package-manager npm
cd backend

# 2. Install all dependencies
npm install @nestjs/jwt @nestjs/passport @nestjs/config @nestjs/swagger passport passport-jwt bcryptjs class-validator class-transformer prisma @prisma/client openai multer adm-zip
npm install -D @types/bcryptjs @types/multer @types/adm-zip @types/passport-jwt

# 3. Initialize Prisma
npx prisma init
# Paste full schema from Section 4
npx prisma migrate dev --name init
npx prisma generate

# 4. Build: DatabaseModule → AuthModule (register/login/me/JWT guard)
```

**Mid-morning Block (3h): Frontend foundation**
```bash
# 1. Initialize Next.js
npx create-next-app@14 frontend --typescript --tailwind --app --src-dir
cd frontend

# 2. Install dependencies
npm install @tanstack/react-query zustand axios @monaco-editor/react react-dropzone react-hot-toast lucide-react clsx tailwind-merge date-fns class-variance-authority

# 3. Initialize shadcn
npx shadcn-ui@latest init  # choose: dark theme, slate base, src/components/ui
npx shadcn-ui@latest add button input label card badge dialog dropdown-menu select textarea separator skeleton progress tooltip scroll-area tabs table sheet avatar

# 4. Build: auth store, axios client, login/register pages
```

**Afternoon Block (4h): Projects + File Upload**
```
Backend: ProjectsModule (CRUD) → FilesModule (ZIP + multi-upload)
Frontend: Projects dashboard → FileUploadZone component
Test: register → create project → upload ZIP → verify files in DB
```

**Evening (1h): Git housekeeping**
```bash
git add . && git commit -m "..."  # use exact messages from Section 11
```

---

### Day 2 — Core Product (Code Explorer + AI Review)

**Morning Block (4h): Code Explorer**
```
Backend: GET /files (file tree) + GET /files/:id (content)
Frontend: FileTree (recursive component) + FilePreview (Monaco)
Test: navigate directories, preview different file types
```

**Afternoon Block (5h): AI Engine**
```
Backend: AiModule + ProvidersModule + ReviewsModule
Frontend: Settings page (add Groq provider) → Review page (template cards + start review) → Review detail (issues)
Test: add Groq provider → run security review → verify issues stored and displayed
```

**Evening (1h): Commits + testing**

---

### Day 3 — Polish + Complete (Chat + History + Docs)

**Morning Block (3h): Chat + Review History**
```
Backend: ChatModule (sessions + messages + AI response)
Frontend: Chat UI + Review History list + search
```

**Afternoon Block (4h): Bonus + Polish**
```
Backend: BonusModule (docs generator + debt scanner)
Frontend: Bonus buttons + loading states + empty states
Fix: edge cases, error messages, mobile responsiveness
```

**Evening Block (3h): Documentation + Final**
```
Write: README.md + ARCHITECTURE.md + AI_USAGE.md
Test: full flow as a new user
Deploy (optional): Vercel + Railway
Final commits + cleanup
```

---

## 13. Environment Variables

### `backend/.env.example`

```env
# ─── Database ───────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_code_review"

# ─── JWT ────────────────────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="your-super-secret-key-minimum-32-characters-long-change-this"
JWT_EXPIRES_IN="7d"

# ─── App ────────────────────────────────────────────────────────────────────
PORT=3001
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# ─── File Upload ─────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB=50
```

### `frontend/.env.local.example`

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### Local PostgreSQL Quick Setup

```bash
# Option 1: Docker (recommended)
docker run --name pgdb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_code_review -p 5432:5432 -d postgres:16

# Option 2: Local install
createdb ai_code_review
```

---

## 14. Key Code Snippets — Critical Implementations

### Frontend: Recursive FileTree Component

```typescript
// components/files/FileTree.tsx
'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { FileNode } from '@/types/file';
import { cn } from '@/lib/utils';

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: 'text-blue-400',
  javascript: 'text-yellow-400',
  python: 'text-green-400',
  rust: 'text-orange-400',
  go: 'text-cyan-400',
};

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const { selectedFileId, setSelectedFileId } = useUiStore();

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 w-full hover:bg-slate-800 rounded px-2 py-1 text-sm text-slate-300 hover:text-slate-100 transition-colors"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {isOpen ? (
            <FolderOpen size={14} className="text-yellow-400 shrink-0" />
          ) : (
            <Folder size={14} className="text-yellow-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const isSelected = selectedFileId === node.id;
  return (
    <button
      onClick={() => setSelectedFileId(node.id!)}
      className={cn(
        'flex items-center gap-1.5 w-full rounded px-2 py-1 text-sm transition-colors',
        isSelected
          ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500'
          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200',
      )}
      style={{ paddingLeft: `${depth * 14 + 22}px` }}
    >
      <File size={13} className={cn('shrink-0', LANGUAGE_COLORS[node.language || ''] || 'text-slate-500')} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ nodes }: { nodes: FileNode[] }) {
  if (!nodes.length) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        No files uploaded yet
      </div>
    );
  }
  return (
    <div className="py-2">
      {nodes.map((node) => (
        <FileTreeNode key={node.path} node={node} />
      ))}
    </div>
  );
}
```

### Frontend: SeverityBadge Component

```typescript
// components/review/SeverityBadge.tsx
import { cn } from '@/lib/utils';
import { IssueSeverity } from '@/types/review';

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border border-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  LOW: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
};

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide', SEVERITY_STYLES[severity])}>
      {severity}
    </span>
  );
}
```

### Backend: Files Controller

```typescript
// files/files.controller.ts
import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Request } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  uploadZip(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.processZip(projectId, file.buffer);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 100, { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFiles(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.processFiles(projectId, files);
  }

  @Get()
  getFileTree(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.getFileTree(projectId, user.id);
  }

  @Get(':fileId')
  getFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.getFileById(fileId, user.id);
  }
}
```

### Backend: Provider Masking

```typescript
// providers/providers.service.ts — mask API key in responses
private maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '****';
  return apiKey.slice(0, 4) + '****' + apiKey.slice(-4);
}

private sanitizeProvider(provider: AiProvider) {
  return { ...provider, apiKey: this.maskApiKey(provider.apiKey) };
}
```

### Frontend: React Query Hook for Reviews

```typescript
// hooks/useReviews.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateReviewPayload } from '@/types/review';
import toast from 'react-hot-toast';

export function useCreateReview(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewPayload) =>
      api.post(`/projects/${projectId}/reviews`, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', projectId] });
      toast.success('Review completed!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Review failed. Check AI provider settings.');
    },
  });
}

export function useProjectReviews(projectId: string) {
  return useQuery({
    queryKey: ['reviews', projectId],
    queryFn: () => api.get(`/projects/${projectId}/reviews`).then((r) => r.data.data),
  });
}

export function useReviewDetail(projectId: string, reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => api.get(`/projects/${projectId}/reviews/${reviewId}`).then((r) => r.data.data),
    enabled: !!reviewId,
  });
}
```

---

## 15. Security Checklist

Before final submission, verify every item:

```
[ ] No API keys, tokens, or secrets committed to git
[ ] .env files are in .gitignore, .env.example has no real values
[ ] Passwords hashed with bcrypt (salt rounds ≥ 12)
[ ] JWT_SECRET is at least 32 random chars (use crypto.randomBytes)
[ ] All routes except /auth/register and /auth/login use JwtAuthGuard
[ ] All database queries include userId ownership check
[ ] File upload has size limits (backend enforces, not just frontend)
[ ] ZIP processor skips node_modules, .git, binary files, files > 100KB
[ ] CORS is configured with specific FRONTEND_URL, not wildcard *
[ ] API keys returned from /providers endpoint are masked (show only last 4 chars)
[ ] No console.log with user data or tokens
[ ] ValidationPipe with whitelist: true strips unknown fields
[ ] 401 on invalid/expired JWT (not 500)
[ ] Project ownership verified before any file/review operation
[ ] AI model errors return 400 (not 500) with helpful message
```

---

## 16. README.md Template

```markdown
# AI Code Review Assistant

> An AI-powered code review platform that provides structured, actionable feedback on your codebase using configurable LLM providers.

## Features

- **Multi-template Reviews**: Security, Performance, and Code Quality analysis
- **Configurable AI Providers**: Works with OpenAI, Groq, LM Studio, Ollama, and any OpenAI-compatible endpoint
- **Code Explorer**: Browse and preview uploaded files with syntax highlighting
- **Review History**: Track all past reviews with full issue breakdowns
- **AI Chat**: Ask natural language questions about your codebase
- **ZIP Upload**: Upload entire projects as ZIP files
- **Bonus: Documentation Generator** — auto-generate README and API docs
- **Bonus: Technical Debt Scanner** — identify and prioritize technical debt

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| AI | OpenAI-compatible (configurable via settings) |
| State | Zustand + TanStack Query |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL
npm run dev
```

### First Run

1. Register at `http://localhost:3000/register`
2. Go to **Settings** → Add AI Provider:
   - Name: `Groq`
   - Base URL: `https://api.groq.com/openai/v1`
   - API Key: your Groq key
   - Model: `llama-3.1-70b-versatile`
   - Set as default ✓
3. Create a project, upload your code as a ZIP, run a review

## Environment Variables

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | `random-64-char-hex-string` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `PORT` | Backend port | `3001` |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
```

---

## 17. ARCHITECTURE.md Template

```markdown
# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│                                                                 │
│  Next.js 14 App Router (React, TypeScript, Tailwind, shadcn)   │
│  State: Zustand (auth) + TanStack Query (server state)         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (Axios, JWT Bearer)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NestJS API (Port 3001)                        │
│                                                                 │
│  Modules: Auth | Projects | Files | Reviews | AI | Chat        │
│           Providers | Bonus | Common                           │
│  Guards: JwtAuthGuard (all protected routes)                   │
│  Pipes: ValidationPipe (class-validator DTOs)                  │
│  Interceptors: TransformInterceptor (response envelope)        │
└──────────────┬──────────────────────────┬───────────────────────┘
               │ Prisma ORM               │ OpenAI SDK
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────┐
│   PostgreSQL 16      │    │   AI Provider (configurable) │
│                      │    │                             │
│   users              │    │   Groq / OpenAI / LM Studio │
│   projects           │    │   Ollama / OpenRouter        │
│   files              │    │   Any OpenAI-compatible URL  │
│   reviews            │    └─────────────────────────────┘
│   issues             │
│   ai_providers       │
│   chat_sessions      │
│   messages           │
└──────────────────────┘
```

## Frontend Architecture

**Route Groups:**
- `(auth)` — unauthenticated routes (no layout): `/login`, `/register`
- `(dashboard)` — authenticated routes (sidebar layout): all other pages

**State Management:**
- Zustand (persisted to localStorage): authentication token + user info
- TanStack Query: all server state with automatic caching and invalidation
- No prop drilling — hooks handle all data fetching

**Component Philosophy:**
- Presentational components in `components/` — no data fetching
- Data-fetching via hooks in `hooks/` — reusable across pages
- Pages are thin orchestrators — compose components with hooks

## Backend Architecture

**Module Structure:** Each domain (auth, projects, files, reviews, etc.) is an independent NestJS module with its own controller, service, and DTOs. Modules only export what other modules need.

**Data Access:** All database access goes through `DatabaseService` (Prisma). No raw SQL. Services never access Prisma directly from controllers.

**Authorization:** Every service method that touches user data verifies ownership by including `userId` in Prisma WHERE clauses.

## AI Integration Flow

```
1. User configures AI provider (Settings page)
   └─ Stored in ai_providers table (baseUrl, apiKey, modelName)

2. User starts a review
   └─ POST /reviews { type: "SECURITY", scope: "project" }

3. ReviewsService fetches project files from DB

4. AiService:
   a. Loads default provider from DB
   b. Creates OpenAI client: new OpenAI({ baseURL, apiKey })
   c. Builds code content string (with truncation for token limits)
   d. Sends: system prompt (type-specific) + user message (code)
   e. Parses JSON response

5. Issues saved to DB, review status → COMPLETED

6. Frontend polls / fetches review detail with issues
```

## Database Design Decisions

- **UUID primary keys**: avoids enumeration attacks
- **Cascade deletes**: deleting a project removes all files, reviews, issues
- **Unique constraint** on `files(projectId, path)`: ZIP re-upload upserts instead of duplicating
- **AI providers per user**: each user configures their own keys (no shared infra)
- **ReviewFile junction table**: many-to-many between reviews and files for traceability
```

---

## 18. AI_USAGE.md Template

```markdown
# AI Usage Disclosure

This document discloses all AI tools used during development, as required by the assessment guidelines.

## Tools Used

| Tool | Purpose |
|------|---------|
| Claude (claude.ai) | Architecture planning, code review, debugging assistance |
| Groq (llama-3.1-70b-versatile) | Runtime AI provider for code reviews and chat |
| GitHub Copilot | Inline code completion |

## AI-Assisted Code

The following components were partially or fully generated with AI assistance and subsequently reviewed and understood:

- `backend/prisma/schema.prisma` — Initial schema generated, relations manually verified
- `backend/src/auth/strategies/jwt.strategy.ts` — NestJS Passport boilerplate generated
- `backend/src/common/interceptors/transform.interceptor.ts` — Standard NestJS pattern
- `frontend/src/components/files/FileTree.tsx` — Recursive tree structure generated, depth/styling adjusted
- `backend/src/ai/prompts/*.ts` — AI prompts drafted with assistance, heavily refined for accuracy

## Manually Written Code

The following was written manually or substantially modified from AI suggestions:

- `backend/src/files/files.service.ts` — ZIP processing logic, file tree builder algorithm
- `backend/src/reviews/reviews.service.ts` — Review orchestration, error handling, status management
- `backend/src/ai/ai.service.ts` — Token management, context building, truncation strategy
- `frontend/src/store/authStore.ts` — Auth state and persistence logic
- All DTOs and validation logic
- All React Query hooks
- Database query ownership guards

## Prompts Used in the Application

See `backend/src/ai/prompts/` for the exact system prompts used for:
- Security Review (`security.prompt.ts`)
- Performance Review (`performance.prompt.ts`)
- Code Quality Review (`code-quality.prompt.ts`)
- AI Chat (`chat.prompt.ts`)
- Documentation Generator (`docs-generator.prompt.ts`)
- Technical Debt Scanner (`debt-scanner.prompt.ts`)

## Engineering Decisions

1. **Groq over OpenAI for development**: Free tier, 32K context, OpenAI-compatible — no cost during development.
2. **response_format: json_object**: Forces structured JSON output, eliminates parsing errors.
3. **Token management in AiService**: Explicit content truncation prevents silent failures from context overflow.
4. **Provider per user, not global**: Each user brings their own API key — no shared infrastructure cost.
5. **Prisma over raw SQL**: Type safety, migration management, and readable queries outweigh the ORM overhead for this scale.
```

---

## Quick Reference Card

### Starting from Scratch

```bash
# Backend
nest new backend && cd backend
npm install @nestjs/jwt @nestjs/passport @nestjs/config passport passport-jwt bcryptjs class-validator class-transformer prisma @prisma/client openai multer adm-zip reflect-metadata rxjs
npm install -D @types/bcryptjs @types/multer @types/adm-zip @types/passport-jwt
npx prisma init  # paste schema → migrate

# Frontend
npx create-next-app@14 frontend --typescript --tailwind --app --src-dir && cd frontend
npm install @tanstack/react-query zustand axios @monaco-editor/react react-dropzone react-hot-toast lucide-react clsx tailwind-merge date-fns class-variance-authority
npx shadcn-ui@latest init && npx shadcn-ui@latest add button input label card badge dialog dropdown-menu select textarea separator skeleton progress tooltip scroll-area tabs sheet avatar
```

### Groq Provider Settings (Add in Settings Page After Running)

```
Name:      Groq (Llama 3.1 70B)
Base URL:  https://api.groq.com/openai/v1
API Key:   gsk_<your key from console.groq.com>
Model:     llama-3.1-70b-versatile
Default:   ✓
```

### Alternative AI Providers

| Provider | Base URL | Model | Notes |
|----------|----------|-------|-------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | Paid, best quality |
| LM Studio | `http://localhost:1234/v1` | (local model name) | Offline, slow |
| Ollama | `http://localhost:11434/v1` | `codellama:7b` | Offline |
| OpenRouter | `https://openrouter.ai/api/v1` | `google/gemma-2-27b` | Many free models |

---

*End of Master Blueprint — Feed this entire document to your AI coding agent. Build feature by feature. Test each feature before moving to the next. Commit after each feature using the exact messages above.*
