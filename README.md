# 🚀 AI-Powered Code Review Assistant

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

A **production-oriented Full-Stack Web Application** designed to revolutionize the code review process. This platform enables developers to upload source code, ZIP archives, or import directly from **GitHub Repositories**, and instantly receive highly structured, context-aware AI code reviews.

Built as an advanced architectural showcase demonstrating modern full-stack development, Domain-Driven Design (DDD), secure authentication, state-of-the-art UI/UX, and complex AI integration.

---

## ✨ Premium Features

### 💻 Deep Space UI/UX
- **Immersive Aesthetic:** A meticulously crafted dark mode UI inspired by modern developer tools (Vercel, Linear). Features subtle glassmorphism, precise micro-interactions, and high-contrast typography.
- **Syntax Highlighted Explorer:** An integrated Monaco Editor provides VS Code-level file viewing and syntax highlighting.

### 🧠 Advanced AI Capabilities
- **Multi-Model Support:** Plug-and-play support for cloud providers (OpenAI, Anthropic via OpenRouter) OR **100% local, offline models** via LM Studio and Ollama endpoints.
- **Automated Code Reviews:** Select entire directories and run Security, Performance, and Code Quality reviews. The AI outputs structured, typed JSON (via LangChain Zod parsers) containing categorized severity levels (CRITICAL, HIGH, MEDIUM, LOW) and actionable recommendations.
- **Context-Aware Chat:** Converse directly with the codebase. The AI automatically injects relevant files into its context window, providing highly accurate answers to architectural and implementation questions.
- **AI File Generators:** 
  - **1-Click README:** Automatically generate professional documentation for your entire repository.
  - **1-Click Unit Tests:** Instantly generate robust unit test suites for any selected code file with edge-case handling.

### 📂 Robust Data & File Management
- **Seamless Imports:** Drag & drop ZIP files or paste a GitHub URL to instantly clone and analyze remote repositories.
- **Secure Workspaces:** JWT-secured, isolated project workspaces. Your code remains private and separated from other users.

---

## 🏗️ Architecture & Technology Stack

This application enforces strict separation of concerns, scalability, and type-safety from end to end.

### System Architecture Diagram

```mermaid
graph TD
    Client[Next.js Client] -->|REST / JWT| API[NestJS API Gateway]
    
    subgraph Backend Infrastructure
        API --> Auth[Auth Module]
        API --> Projects[Projects Module]
        API --> Files[Files Module]
        API --> AI[AI Module]
        
        Files -->|File I/O| Disk[Temp Storage / Git Clone]
        AI -->|LangChain| LLM[External/Local AI Models]
    end
    
    Auth --> DB[(PostgreSQL)]
    Projects --> DB
    Files --> DB
    AI --> DB
```

### Frontend Stack (Next.js 14 App Router)
- **Framework:** Next.js (React 18) with Server-Side Rendering capabilities.
- **Styling:** Tailwind CSS, `lucide-react` icons, Framer Motion for fluid transitions.
- **State Management:** **Zustand** for lightweight global UI state (sidebar toggles, active files). **React Query (TanStack)** for asynchronous API data fetching, caching, and optimistic updates.
- **Components:** Headless UI primitives via Radix/Base UI combined with raw Tailwind styling for maximum flexibility.

### Backend Stack (NestJS)
- **Framework:** NestJS (Express under the hood), architected using Domain-Driven Design (DDD).
- **Database ORM:** **Prisma** configured with PostgreSQL for type-safe database access and automated migrations.
- **Authentication:** Passport.js with JWT strategies, password hashing via bcrypt.
- **AI Orchestration:** **LangChain** for prompt engineering, schema extraction, and LLM communication. Uses `StructuredOutputParser` to force non-deterministic LLMs to return strict JSON shapes.

---

## 🚀 Getting Started

Follow these instructions to run the application locally.

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### 1. Database Setup
Create a `.env` file in the `backend` directory:
```env
# backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_code_reviewer"
JWT_SECRET="your-super-secret-jwt-key"
```

Run the database migrations:
```bash
cd backend
npm install
npx prisma db push
```

### 2. Start the Backend Server
```bash
# Inside the /backend directory
npm run start:dev
```
*The API will be available at `http://localhost:3001/api`.*

### 3. Start the Frontend Application
Create a `.env.local` file in the `frontend` directory:
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

Start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The web interface will be available at `http://localhost:3000`.*

---

## ⚙️ Configuring AI Providers (Local vs Cloud)

The true power of this application is its flexibility. Navigate to **Settings -> AI Providers** in the dashboard.

- **To use Cloud AI (OpenAI):** 
  - Base URL: `https://api.openai.com/v1`
  - Model Name: `gpt-4o` or `gpt-3.5-turbo`
  - API Key: Your OpenAI key.
  
- **To use Local, Free, Offline AI (LM Studio):**
  - Download and run [LM Studio](https://lmstudio.ai/). Load a model (e.g., Llama 3 or Mistral).
  - Start the Local Server in LM Studio (usually runs on port 1234).
  - Base URL: `http://localhost:1234/v1`
  - Model Name: `local-model`
  - API Key: `not-needed`
