# System Architecture

## Overview
This application is an AI-Powered Code Review Assistant built using a modern full-stack TypeScript architecture. It enables developers to upload projects, explore code, run automated AI reviews (for Security, Performance, and Code Quality), and chat directly with their codebase using LLMs.

## 1. Frontend Architecture
**Framework:** Next.js 14 (App Router)
**Language:** TypeScript
**Styling:** Tailwind CSS, Shadcn UI
**State Management:** Zustand
**Data Fetching:** React Query (@tanstack/react-query)

The frontend is organized by feature rather than type:
- `app/(dashboard)`: Contains all protected routes (Projects, Code Explorer, Chat, Reviews).
- `components/`: Modular, reusable UI components (auth, chat, files, layout, projects, reviews, settings).
- `hooks/`: Custom React hooks mapping to backend endpoints via Axios.
- `store/`: Zustand stores for global client state (Auth state, UI selection state).

### Key Frontend Decisions
- **Optimistic UI:** React Query is used to instantly reflect UI changes without waiting for slow server refetches.
- **Deep Space Theme:** A custom dark-mode aesthetic built using Tailwind for a premium developer experience.
- **Client-side routing:** Leveraging Next.js App Router for seamless navigation.

## 2. Backend Architecture
**Framework:** NestJS
**Language:** TypeScript
**Database ORM:** Prisma
**AI Integration:** LangChain

The backend follows a domain-driven module structure:
- `AuthModule`: Handles JWT-based authentication and user registration.
- `ProjectsModule`: Manages project creation and deletion.
- `FilesModule`: Handles file uploads (including ZIP extraction), parsing, and syntax detection.
- `ReviewsModule`: Manages the lifecycle of AI code reviews (Pending, Processing, Completed).
- `ChatModule`: Manages conversational AI sessions related to specific projects.
- `AiModule`: The core engine responsible for LLM orchestration using LangChain.

### Key Backend Decisions
- **Asynchronous AI Processing:** Code reviews are processed asynchronously to avoid blocking the HTTP thread.
- **Modular Design:** NestJS's dependency injection makes the codebase highly testable and scalable.
- **Secure File Handling:** Uploaded files are securely stored in PostgreSQL.

## 3. Database Design
**Database:** PostgreSQL

### Core Schema:
1. **User**: Standard authentication table (id, email, password, name).
2. **Project**: Represents a codebase (id, name, description, userId).
3. **File**: Stores source code files (id, name, path, content, language, size, projectId).
4. **Review**: Stores AI analysis metadata (id, status, type, summary).
5. **Issue**: Granular issues found during a review (title, description, severity, recommendation, fileId).
6. **ChatSession / Message**: Stores the conversation history for the AI assistant.
7. **AiProvider**: Allows users to dynamically configure custom OpenAI-compatible endpoints.

## 4. AI Integration Flow
The `AiService` acts as the orchestration layer:
1. **Dynamic Model Instantiation:** It reads the user's active `AiProvider` from the database. If none is configured, it falls back to a default environment OpenRouter API.
2. **LangChain Agents:** `ChatOpenAI` and `ChatGroq` wrappers are used to interface with the models.
3. **Structured Outputs:** For Code Reviews, Zod schemas are passed to LangChain's `StructuredOutputParser` to force the AI to return strictly typed JSON data (Issues, Severities, Summaries) instead of raw markdown.
4. **Context Injection:** For Chat and Bonus Generators (Readme/Tests), the backend dynamically fetches the project's files from the database and constructs an optimized `codeContext` string that fits within the model's context window.
