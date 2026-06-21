# AI Usage Report

## AI Tools Used
During the development of this project, several AI tools were utilized to accelerate development, troubleshoot bugs, and design complex CSS layouts:
- **Claude 3.5 Sonnet / Antigravity Agent:** Used as an interactive pair-programming assistant.
- **GitHub Copilot:** Used for inline code completion and boilerplate generation.

## Prompts & AI Workflows
The core AI functionalities of the application (Code Review, Chat, Code Generation) are powered by specific prompt engineering techniques.

### 1. Code Review Prompt
The system uses distinct prompt templates for different review types (Security, Performance, Code Quality).
**Example (Code Quality):**
```text
You are an expert Software Engineer reviewing code for quality, readability, and best practices.
Focus on: Code structure, naming conventions, maintainability, and DRY principles.

{format_instructions}

Review the following code:
...
```
*Decision:* We used LangChain's `StructuredOutputParser` to generate `{format_instructions}` based on a Zod schema. This forces the LLM to output valid JSON instead of conversational text, allowing us to render individual `Issue` cards in the UI.

### 2. Chat Assistant Context Injection
**Prompt Strategy:**
```text
You are an expert code assistant. You have access to the following codebase:
[FILE PATH: src/main.ts]
[CODE BLOCK]
...
Answer questions accurately. Reference specific file names when relevant.
```
*Decision:* Instead of implementing a complex Vector Database (RAG) which would be overkill for a 3-day project, we implemented a dynamic context builder that concatenates the smallest/most relevant project files up to a specific token limit (30k chars).

### 3. Bonus Generators
For the README and Unit Test generators, we used simple zero-shot prompts with heavy context injection.

## Generated vs Manually Written Code
- **Manually Written / Heavily Modified:** 
  - The core architecture (NestJS modules, Next.js routing, Prisma schema).
  - The AI orchestration logic (`AiService`).
  - Complex UI layouts (e.g., Deep Space Theme, Flexbox layouts).
- **AI Generated / Assisted:** 
  - Tailwind CSS classes for standard components (buttons, cards).
  - Boilerplate DTOs and Controller methods.
  - Regex patterns for syntax highlighting.

## Engineering Decisions & AI Limitations
1. **Model Agnosticism:** We built the `AiService` to accept custom Base URLs. This allows the app to work with OpenAI, LM Studio, Ollama, and OpenRouter seamlessly.
2. **Context Window Limits:** We encountered issues where massive projects exceeded the context window of local models. To solve this, we implemented file truncation (`maxPerFile`) and total character limits (`maxTotal`) in the `buildCodeContent` function.
3. **Structured Output Failures:** Local models (like Llama via LM Studio) sometimes fail to output valid JSON. We mitigating this by using highly strict system prompts and focusing on larger models (like Claude-3-Haiku) as the default fallback.
