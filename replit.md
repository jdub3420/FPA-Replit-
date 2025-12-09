# AI-Powered Financial Analysis Platform

## Overview

AI-powered financial analysis platform for Senior Living CFOs. Delivers validated FP&A insights from financial documents with automatic calculation verification.

**Consensus Enforcement:** The system enforces a strict >96% consensus threshold. With 4 LLMs, all models must respond successfully to meet the 96% requirement. If any model fails, the orchestration throws an error and prevents invalid offers from being saved. This ensures only high-quality, validated analyses reach users.

**Python Validation:** For each successful analysis, the system automatically generates executable Python scripts (using Pandas) that validate all mathematical calculations. These scripts extract numbers, percentages, and variances from the analysis, organize them in DataFrames, and provide PASS/FAIL verification for each calculation, enabling independent verification of financial computations.

**RAG Transparency:** The system now displays exactly which uploaded documents were used during generation, showing the document filenames and number of chunks retrieved. This provides users with full visibility into how their documents enhance AI-generated outputs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, Radix UI primitives with shadcn/ui for UI, Tailwind CSS for styling, and Vite for building.

**Design System:** Linear/Notion-inspired, emphasizing clarity with Inter font for UI and JetBrains Mono for code. Features consistent spacing, light/dark theme support, and a maximum content width of 1280px.

**Key Components:** `PromptBuilderForm`, `LLMComparisonPanel` (displaying individual model responses as supporting evidence), validation controls (approve/reject with notes), and export buttons (JSON/TXT).

**Orchestration Workflow:** The system uses a deterministic 3-phase sequential-parallel architecture to ensure consistent, high-quality outputs. Each phase builds on the previous one, eliminating race conditions and ensuring reproducible results for identical inputs.

**Human-in-the-Loop Validation System:** Users can review the synthesized output, add validation notes, and approve or reject it. The validation status is persisted in the database and displayed with visual badges. Export functionality allows downloading the complete workflow in JSON or formatted TXT.

**Routing Structure:** `/` (Home), `/prompt-builder` (Main application), `/documents` (Document library).

### Backend Architecture

**Technology Stack:** Node.js with TypeScript, Express.js, Vite middleware for HMR, and esbuild for production.

**Server Configuration:** Custom request logging, JSON body parsing, and modular route registration.

**Orchestration Module (`server/orchestration.ts`):** Core workflow engine implementing a deterministic 3-phase sequential-parallel architecture:

**PHASE 1: FOUNDATION (Parallel Processing)**
- **GPT-4 (Quantitative):** Calculates precise numbers, variance decomposition, financial metrics
- **Claude (Operational):** Diagnoses root causes, operational factors, clinical implications
- **Execution:** Both models run in parallel for maximum speed
- **Timing:** ~45 seconds (max of both parallel executions)
- **Requirement:** Both models must succeed before proceeding to Phase 2

**PHASE 2: STRATEGIC SYNTHESIS (Sequential)**
- **Gemini (Strategic):** Receives GPT-4 + Claude outputs as input
- **Role:** Synthesizes quantitative + operational findings into strategic recommendations
- **Execution:** Runs after Phase 1 completes
- **Timing:** ~60 seconds
- **Output:** Executive summary, strategic priorities, risk assessment
- **Note:** This eliminates the need for a separate synthesis step - Gemini performs synthesis directly

**PHASE 3: VALIDATION (Sequential)**
- **o3-mini (Validation):** Receives all prior outputs (GPT-4, Claude, Gemini) as input
- **Role:** Rapid consistency checks, error detection, numerical verification
- **Execution:** Runs after Phase 2 completes
- **Timing:** ~15 seconds
- **Output:** Validation report with PASS/FAIL status

**Total Processing Time:** ~120 seconds (45 + 60 + 15)

**Key Architectural Benefits:**
1. **Deterministic Output:** Same input always produces same output (eliminates race conditions)
2. **Clear Role Separation:** Each model has a specific purpose in the pipeline
3. **Failure Handling:** Phase 1 requires both models; Phase 3 validation is optional
4. **Transparency:** Users see exactly how each phase contributed to the final result

**Additional Steps:**
- **RAG Context Retrieval:** Searches document embeddings for relevant context (if enabled)
- **Python Validation Generation:** Creates executable Python scripts using Claude Sonnet 4 to validate all calculations
- **Persistence:** Stores complete workflow state with all 4 model outputs in `generated_offers` table

**Note:** Cognitive verb selection has been removed - each model now has a hardcoded role defined by phase-specific prompts in `server/llm.ts`.

**Storage Layer:** Abstract `IStorage` interface with PostgreSQL implementation (`PgStorage`) for persistent storage. Uses Neon Database HTTP driver (`drizzle-orm/neon-http`) for reliable connectivity. Documents and embeddings persist across server restarts. Located in `server/storage.ts` with database connection in `server/db.ts`.

**API Endpoints:**
- `POST /api/generate-prompts` - Main orchestration endpoint
- `GET /api/offers` - List all generated offers
- `GET /api/offers/:id` - Get specific offer
- `PUT /api/offers/:id/validate` - Approve/reject offer with notes
- `GET /api/offers/:id/export` - Export offer in JSON or TXT format

### Data Models

Core types include `User`, `CognitiveVerb` (145+ verbs across 17 categories), `GeneratedOffer` (stores complete workflow state including inputs, selected verbs, model outputs, synthesized output, **Python validation code**, scores, and validation status), `Document`, and `DocumentChunk`. These are type-safe definitions using Zod.

**GeneratedOffer Schema Fields:**
- `pythonValidation`: Auto-generated Python script (using Pandas) for validating all mathematical calculations in the analysis
- `consensusScore`: Percentage of LLMs that responded successfully (must be >=0.96)
- `synthesizedOutput`: Collaborative analysis synthesized from all contributing LLMs

### RAG (Retrieval-Augmented Generation) Architecture

The RAG system enhances prompt generation by providing contextual information from uploaded documents. It processes documents through uploading, text extraction, chunking (500 chars, 50 overlap, sentence-based), and embedding generation (OpenAI `text-embedding-3-small`). Semantic search uses cosine similarity to retrieve the top-k most relevant chunks. This context is prepended to prompts sent to all 4 LLMs.

**RAG Metadata Tracking:** The system tracks which documents and chunks are used during generation. Metadata includes:
- `ragChunksUsed`: Number of document chunks retrieved and used
- `ragDocumentsUsed`: Array of document filenames that contributed to the generation

This metadata is stored in the `generated_offers` table and displayed prominently in the UI with a visual indicator: "📄 Context Enhanced: Used X chunk(s) from document1.pdf, document2.pdf"

**API Endpoints:** `POST /api/documents/upload`, `GET /api/documents`, `DELETE /api/documents/:id`, `POST /api/documents/search`.

**Environment Requirements:** `OPENAI_API_KEY_1` is required for embedding generation and RAG functionality. Note: This key must be a standard OpenAI secret key (starting with `sk-`), not a project key.

### Database Configuration

Drizzle ORM is configured for PostgreSQL (via Neon Database) with schema definitions in `shared/schema.ts` and a migration-based approach for schema evolution.

### Authentication & Session Management

User schema defined; `connect-pg-simple` included for PostgreSQL session storage. Planned architecture includes session-based authentication with password hashing.

## External Dependencies

### LLM API Integrations

- **OpenAI via Replit AI Integrations:** ChatGPT (GPT-5) and o3-mini (for math/coding).
- **Anthropic Claude API:** Claude Sonnet 4 (`claude-sonnet-4-20250514`) for analytical reasoning, via `@anthropic-ai/sdk`. Requires `ANTHROPIC_API_KEY`.
- **Google Gemini API:** Gemini 2.5 Flash (`gemini-2.5-flash`) for fast, efficient responses, via `@google/genai`. Requires `GEMINI_API_KEY`.

All API calls are server-side via `/api/generate-prompts`, executed in parallel with `Promise.allSettled`. Includes consensus scoring based on the success rate of model responses.

### Database Provider

**Neon Database:** Serverless PostgreSQL provider, used with Drizzle ORM via `DATABASE_URL`.

### UI Component Library

**Radix UI:** Headless, accessible UI primitives for components like Dialog, Select, Accordion, and Toast. Styled with Tailwind CSS using shadcn/ui patterns ("new-york" style, neutral base color, CSS variables).

### Build & Development Tools

**Vite:** Development server with HMR, React plugin, and Replit-specific plugins.

**TypeScript:** Strict mode enabled, path aliases, ESNext module system, incremental compilation.

### Form Management

**React Hook Form + Zod:** Used for performant, type-safe form state management and validation.

### Utility Libraries

- **Styling:** `tailwind-merge`, `clsx`, `class-variance-authority`.
- **Date Handling:** `date-fns`.
- **Icons:** `lucide-react`, `react-icons`.
- **Unique ID Generation:** `nanoid`.