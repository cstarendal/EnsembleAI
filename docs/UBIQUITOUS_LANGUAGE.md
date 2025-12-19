# Ubiquitous Language Guide

This project enforces a strict **Ubiquitous Language** approach - the same terms and concepts are used consistently across code, UI, documentation, and communication.

## Core Principle

**"One term, one meaning, everywhere"**

Every domain concept has a single, well-defined term that is used consistently in:

- Code (variable names, function names, types)
- UI (labels, messages, tooltips)
- Documentation (guides, comments, README)
- API (endpoints, request/response)
- Tests (test names, descriptions)

---

## Domain Dictionary

### Core Concepts

| Term                  | Definition                                                          | Usage                                | Never Use                      |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| **Research**          | The process of answering a user's question using multiple AI models | `researchSession`, `startResearch()` | investigation, analysis, query |
| **Question**          | The user's input query about a social policy topic                  | `question`, `userQuestion`           | query, prompt, input           |
| **Session**           | A single research instance from question to final answer            | `sessionId`, `researchSession`       | request, job, task             |
| **Agent**             | An AI model with a specific role in the research process            | `agent`, `AgentRole`                 | model, AI, bot                 |
| **Role**              | The function/purpose of an agent (e.g., Critic, Synthesizer)        | `agentRole`, `Role`                  | type, kind, category           |
| **Debate**            | The structured discussion between agents about research findings    | `debate`, `debateRound`              | discussion, conversation, chat |
| **Round**             | A single phase in the debate (Opening, Cross-Examination, etc.)     | `debateRound`, `round`               | phase, step, stage             |
| **Source**            | A reference or citation found during research                       | `source`, `sources`                  | reference, citation, link      |
| **Synthesis**         | The process of combining information into a coherent answer         | `synthesis`, `synthesize()`          | summary, combine, merge        |
| **Moderation**        | The process of summarizing and judging the debate                   | `moderation`, `moderate()`           | summary, conclusion, judgment  |
| **Timeline**          | The chronological view of agent activities                          | `timeline`, `debateTimeline`         | history, log, feed             |
| **Message**           | A single communication from an agent                                | `message`, `agentMessage`            | response, output, text         |
| **Opening Statement** | An agent's initial position in a debate round                       | `openingStatement`                   | initial, first, start          |
| **Cross-Examination** | Agents responding to each other's statements                        | `crossExamination`                   | response, reply, answer        |
| **Rebuttal**          | Agents defending/revising their positions                           | `rebuttal`                           | defense, revision, update      |
| **Final Position**    | An agent's concluding statement                                     | `finalPosition`                      | conclusion, final, end         |
| **Consensus**         | Points where all agents agree                                       | `consensus`, `consensusPoints`       | agreement, common ground       |
| **Disagreement**      | Points where agents differ                                          | `disagreement`, `disagreements`      | conflict, difference, debate   |
| **Uncertainty**       | Areas where information is incomplete or unclear                    | `uncertainty`, `uncertainties`       | unknown, unclear, missing      |
| **Citation**          | A reference to a source in the answer                               | `citation`, `citations`              | reference, source link         |
| **Quality Rating**    | Assessment of source reliability (1-5 stars)                        | `qualityRating`                      | score, rating, grade           |

### Agent Roles

| Term                  | Definition                                            | Code Usage                                  | UI Label            |
| --------------------- | ----------------------------------------------------- | ------------------------------------------- | ------------------- |
| **Research Planner**  | Breaks down question into research areas              | `ResearchPlanner`, `plannerAgent`           | "Research Planner"  |
| **Source Hunter**     | Finds sources for research                            | `SourceHunter`, `hunterAgent`               | "Source Hunter"     |
| **Source Critic**     | Evaluates source quality (The Rigorous Analyst)       | `SourceCritic`, `criticAgent`               | "Source Critic"     |
| **Synthesizer**       | Creates balanced synthesis (The Balanced Synthesizer) | `Synthesizer`, `synthesizerAgent`           | "Synthesizer"       |
| **Skeptic**           | Challenges conclusions (The Challenger)               | `Skeptic`, `skepticAgent`                   | "Skeptic"           |
| **Moderator**         | Summarizes debate (The Judge)                         | `Moderator`, `moderatorAgent`               | "Moderator"         |
| **Final Synthesizer** | Creates final answer                                  | `FinalSynthesizer`, `finalSynthesizerAgent` | "Final Synthesizer" |

### Debate Structure

| Term                   | Definition                          | Code Usage                           | UI Label                |
| ---------------------- | ----------------------------------- | ------------------------------------ | ----------------------- |
| **Opening Statements** | Initial positions from all agents   | `openingStatements`, `roundOpening`  | "Opening Statements"    |
| **Cross-Examination**  | Agents responding to each other     | `crossExamination`, `roundCrossExam` | "Cross-Examination"     |
| **Rebuttal**           | Agents defending/revising positions | `rebuttal`, `roundRebuttal`          | "Rebuttal & Refinement" |
| **Final Positions**    | Concluding statements               | `finalPositions`, `roundFinal`       | "Final Positions"       |

---

## Naming Conventions

### Code (TypeScript)

**Types/Interfaces:**

```typescript
// ✅ Good - Uses domain terms
interface ResearchSession {
  sessionId: string;
  question: string;
  agents: Agent[];
  debate: Debate;
}

interface Agent {
  role: AgentRole;
  model: string;
  messages: AgentMessage[];
}

type AgentRole =
  | "Research Planner"
  | "Source Hunter"
  | "Source Critic"
  | "Synthesizer"
  | "Skeptic"
  | "Moderator"
  | "Final Synthesizer";

// ❌ Bad - Uses generic terms
interface Query {
  id: string;
  input: string;
  models: Model[];
  chat: Chat;
}
```

**Functions:**

```typescript
// ✅ Good
function startResearch(question: string): Promise<ResearchSession>;
function runDebate(sources: Source[]): Promise<Debate>;
function synthesizeAnswer(debate: Debate): Answer;

// ❌ Bad
function processQuery(input: string): Promise<Query>;
function runDiscussion(refs: Reference[]): Promise<Discussion>;
function createSummary(chat: Chat): Summary;
```

**Variables:**

```typescript
// ✅ Good
const researchSession = await startResearch(question);
const debateRound = debate.rounds[0];
const agentMessage = debate.messages[0];

// ❌ Bad
const query = await processQuery(input);
const phase = discussion.steps[0];
const response = chat.messages[0];
```

### UI Components

**Component Names:**

```tsx
// ✅ Good
<ResearchInput />
<DebateTimeline />
<AgentMessage />
<SourcePanel />
<ModerationSummary />

// ❌ Bad
<QueryInput />
<ChatHistory />
<ModelResponse />
<ReferenceList />
<SummaryPanel />
```

**UI Labels:**

```tsx
// ✅ Good
<h2>Research Timeline</h2>
<button>Start Research</button>
<span>Agent: Source Critic</span>
<p>Debate Round: Opening Statements</p>

// ❌ Bad
<h2>Query History</h2>
<button>Run Query</button>
<span>Model: Critic</span>
<p>Phase: Initial</p>
```

### API Endpoints

```typescript
// ✅ Good
POST /api/research
GET /api/research/:sessionId/stream
GET /api/research/:sessionId/result

// ❌ Bad
POST /api/query
GET /api/query/:id/events
GET /api/query/:id/response
```

### API Request/Response

```typescript
// ✅ Good
interface StartResearchRequest {
  question: string;
  options?: ResearchOptions;
}

interface ResearchSessionResponse {
  sessionId: string;
  status: "planning" | "hunting" | "debating" | "complete";
  debate?: Debate;
}

// ❌ Bad
interface QueryRequest {
  input: string;
  config?: QueryConfig;
}

interface QueryResponse {
  id: string;
  state: "processing" | "done";
  chat?: Chat;
}
```

---

## Validation Process

### 1. Term Registry

All terms must be registered in `src/constants/ubiquitousLanguage.ts`:

```typescript
export const DOMAIN_TERMS = {
  // Core concepts
  RESEARCH: "Research",
  QUESTION: "Question",
  SESSION: "Session",
  AGENT: "Agent",
  ROLE: "Role",
  DEBATE: "Debate",
  ROUND: "Round",
  SOURCE: "Source",
  SYNTHESIS: "Synthesis",
  MODERATION: "Moderation",
  // ... etc
} as const;

export const AGENT_ROLES = {
  RESEARCH_PLANNER: "Research Planner",
  SOURCE_HUNTER: "Source Hunter",
  SOURCE_CRITIC: "Source Critic",
  SYNTHESIZER: "Synthesizer",
  SKEPTIC: "Skeptic",
  MODERATOR: "Moderator",
  FINAL_SYNTHESIZER: "Final Synthesizer",
} as const;
```

### 2. Type Safety

Use types to enforce terms:

```typescript
// ✅ Good - Type enforces term
type AgentRole = (typeof AGENT_ROLES)[keyof typeof AGENT_ROLES];

function createAgent(role: AgentRole): Agent {
  // TypeScript ensures only valid roles
}

// ❌ Bad - String allows anything
function createAgent(role: string): Agent {
  // Could be "critic", "Critic", "source-critic", etc.
}
```

### 3. Validation Script

Run validation to check for violations:

```bash
npm run lint:ubiquitous-language
```

This checks:

- Code uses registered terms
- UI labels match domain terms
- API endpoints use correct terms
- Documentation uses consistent terms

### 4. Pre-commit Hook

Automatically validates terms before commit.

---

## Adding New Terms

### Process

1. **Define the term** in this document (Domain Dictionary)
2. **Add to registry** (`src/constants/ubiquitousLanguage.ts`)
3. **Create type** if needed
4. **Update validation** script
5. **Use consistently** everywhere

### Example: Adding "Research Area"

1. **Define:**

   ```
   Research Area: A specific topic or aspect of the research question
   ```

2. **Add to registry:**

   ```typescript
   export const DOMAIN_TERMS = {
     // ...
     RESEARCH_AREA: "Research Area",
   } as const;
   ```

3. **Create type:**

   ```typescript
   type ResearchArea = string; // Or more specific type
   ```

4. **Use everywhere:**

   ```typescript
   // Code
   const researchAreas: ResearchArea[] = [...];

   // UI
   <h3>Research Areas</h3>

   // API
   interface ResearchPlan {
     researchAreas: ResearchArea[];
   }
   ```

---

## Common Violations

### ❌ Don't Do This

```typescript
// Mixing terms
const query = await startResearch(question); // ❌ "query" vs "research"
const chat = runDebate(sources); // ❌ "chat" vs "debate"
const summary = synthesizeAnswer(debate); // ❌ "summary" vs "synthesis"

// Generic terms
interface Model {} // ❌ Should be "Agent"
function process(input: string) {} // ❌ Should be "startResearch"
const response = await api.get("/query"); // ❌ Should be "/research"

// Inconsistent casing
const agentRole = "source-critic"; // ❌ Should be "Source Critic"
const DEBATE_ROUND = 1; // ❌ Should be "debateRound"
```

### ✅ Do This

```typescript
// Consistent terms
const researchSession = await startResearch(question);
const debate = runDebate(sources);
const synthesis = synthesizeAnswer(debate);

// Domain terms
interface Agent {}
function startResearch(question: string) {}
const response = await api.get("/research");

// Consistent casing
const agentRole: AgentRole = AGENT_ROLES.SOURCE_CRITIC;
const debateRound = 1;
```

---

## UI Text Guidelines

### Labels

Use exact domain terms in UI:

```tsx
// ✅ Good
<label>Research Question</label>
<button>Start Research</button>
<span>Agent: {agentRole}</span>  // "Source Critic", not "critic"

// ❌ Bad
<label>Your Query</label>
<button>Run Analysis</button>
<span>Model: {role}</span>
```

### Messages

Use domain terms in user-facing messages:

```tsx
// ✅ Good
<p>Research session started. Agents are planning...</p>
<p>Debate round 3: Opening Statements</p>
<p>Source quality rating: ⭐⭐⭐⭐⭐</p>

// ❌ Bad
<p>Query processing. Models are analyzing...</p>
<p>Phase 3: Initial</p>
<p>Reference score: 5/5</p>
```

### Tooltips/Help Text

Explain domain terms consistently:

```tsx
// ✅ Good
<Tooltip>
  The Source Critic evaluates the quality and reliability of sources
  found during research.
</Tooltip>

// ❌ Bad
<Tooltip>
  This model checks if references are good.
</Tooltip>
```

---

## Documentation

All documentation must use domain terms:

```markdown
<!-- ✅ Good -->

The Research Planner breaks down the user's question into research areas.

<!-- ❌ Bad -->

The query processor analyzes the input and creates topics.
```

---

## Testing

Test names and descriptions use domain terms:

```typescript
// ✅ Good
describe("Research Session", () => {
  it("should create a research session with a question", () => {
    const session = startResearch("What is UBI?");
    expect(session.question).toBe("What is UBI?");
  });

  it("should run debate between agents", () => {
    const debate = runDebate(sources);
    expect(debate.rounds).toHaveLength(4);
  });
});

// ❌ Bad
describe("Query Processing", () => {
  it("should process a query", () => {
    const query = processQuery("What is UBI?");
    // ...
  });
});
```

---

## Code Review Checklist

When reviewing PRs, check:

- [ ] All variable/function names use domain terms
- [ ] UI labels match domain terms exactly
- [ ] API endpoints use domain terms
- [ ] Types use domain terms
- [ ] Documentation uses domain terms
- [ ] Test names use domain terms
- [ ] No generic terms (query, model, chat, etc.)
- [ ] No mixed terminology

---

## Enforcement

### Automated

1. **TypeScript types** enforce correct terms
2. **Validation script** checks for violations
3. **Pre-commit hook** runs validation
4. **CI/CD** fails if violations found

### Manual

1. **Code review** checks terminology
2. **Documentation review** ensures consistency
3. **UI review** verifies labels

---

## Summary

1. **One term, one meaning** - Each concept has a single term
2. **Use everywhere** - Code, UI, docs, API, tests
3. **Register terms** - Add to `ubiquitousLanguage.ts`
4. **Validate** - Run `npm run lint:ubiquitous-language`
5. **Review** - Check terminology in PRs
6. **Enforce** - Types, scripts, CI/CD

**Remember:** If you find yourself using a different term, ask: "Is this in the domain dictionary?" If not, either use the correct term or add the new term following the process.

---

**See also:**

- [Domain Dictionary](#domain-dictionary) - Complete list of terms
- [Naming Conventions](#naming-conventions) - How to use terms in code
- [Validation Process](#validation-process) - How to validate usage
