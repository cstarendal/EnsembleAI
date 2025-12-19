# Design Document: Ensemble AI Research System with Debate Structure

## 1. Overview and Goals

### 1.1 Purpose
A system where multiple AI models collaborate in a visible debate to produce high-quality research answers on social policy questions. Users see the entire debate in real-time.

### 1.2 Requirements
- **Quality**: Better than single-shot answers through debate and cross-examination
- **Transparency**: Visible debate between agents with different agendas
- **Speed**: 30-90 seconds per question
- **Sources**: All important claims have sources
- **Language**: English
- **Topic**: Social policy questions (policy, economics, social issues)

### 1.3 Stakeholders
- **Users**: Researchers, journalists, policy analysts, general public
- **Developers**: Backend/frontend team
- **Operators**: System administrators

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐
│   Frontend      │  React/Vite app
│   (Web UI)      │  - Debate timeline view
│                 │  - Source panel
│                 │  - Answer panel
└────────┬────────┘
         │ HTTP/SSE
         │
┌────────▼────────┐
│   Backend       │  Node.js/Express
│   (Orchestrator)│  - Debate coordination
│                 │  - API management
│                 │  - State management
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    │         │          │          │          │
┌───▼───┐ ┌──▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│OpenAI │ │Anthropic│ │Google │ │Mistral│ │OpenRouter│
│  API  │ │  API   │ │  API  │ │  API  │ │  API    │
└───────┘ └───────┘ └───────┘ └───────┘ └─────────┘
```

---

## 3. Agent Roles and Debate Flow

### 3.1 Agent Roles with Agendas

| Role | Model | Agenda | Angle | Tone |
|------|-------|--------|-------|------|
| **Research Planner** | GPT-4o-mini | Break down question, create search plan | Structured planning | Neutral, analytical |
| **Source Hunter A** | GPT-4o | Find academic/policy sources | Academic rigor | Fact-based |
| **Source Hunter B** | Claude 3.5 Sonnet | Find sources from different perspective | Diverse search | Balanced |
| **Source Critic** | Mistral Large | "The Rigorous Analyst" | Methodology, source quality, bias | Analytical, demanding |
| **Synthesizer** | GPT-4o | "The Balanced Synthesizer" | Find consensus, balance perspectives | Balanced, inclusive |
| **Skeptic** | Gemini 1.5 Pro | "The Challenger" | Question assumptions, find gaps | Challenging, critical |
| **Moderator** | Claude 3.5 Sonnet | "The Judge" | Summarize debate, find consensus | Neutral, judging |
| **Final Synthesizer** | GPT-4o | Final synthesis | Combine all perspectives | Balanced, definitive |

### 3.2 Debate Flow (Updated)

**Round 0: Planning (~10s)**
```
User Question
    ↓
Research Planner → Research Plan
```

**Round 1: Source Gathering (parallel, ~15s)**
```
Research Plan
    ↓
Source Hunter A → Sources A (4-6)
Source Hunter B → Sources B (4-6)
```

**Round 2: Source Critique (~15s)**
```
Sources A + B
    ↓
Source Critic → Quality ratings + Claims
```

**Rounds 3-6: DEBATE (new structure)**

**Round 3: Opening Statements (parallel, ~15s)**
```
Sources + Critique
    ↓
Critic → Opening: "I see 3 methodological issues..."
Synthesizer → Opening: "I identify 4 main themes..."
Skeptic → Opening: "I'm skeptical of 2 conclusions..."
```

**Round 4: Cross-Examination (sequential, ~20s)**
```
Each model sees others' openings and responds:
    ↓
Critic → Synthesizer: "You mentioned X, but source quality is low..."
Synthesizer → Skeptic: "I understand your concern, but 3 sources support..."
Skeptic → Critic: "Your critique is valid, but you miss that..."
```

**Round 5: Rebuttal & Refinement (sequential, ~20s)**
```
Each model defends/revises based on cross-examination:
    ↓
Critic → "After hearing Synthesizer, I agree X but still require..."
Synthesizer → "Skeptic makes valid point, I revise conclusion to..."
Skeptic → "Critic convinced me on methodology, but still concerned about..."
```

**Round 6: Final Positions (parallel, ~15s)**
```
Each model gives final position:
    ↓
Critic → Final position + what changed
Synthesizer → Final position + what changed
Skeptic → Final position + what changed
```

**Round 7: Moderation (~10s)**
```
All debate messages
    ↓
Moderator → Synthesis of debate + consensus points + remaining disagreements
```

**Round 8: Final Answer (~15s)**
```
Moderator synthesis + All sources
    ↓
Final Synthesizer → Final answer with citations + uncertainties
```

**Total time: ~75-90s**

### 3.3 State Management

Each debate message contains:
- `agent_id`: Unique ID
- `role`: Role name
- `model`: Model used
- `round`: Which debate round
- `target`: Who the message is directed to (or "all" for opening statements)
- `timestamp`: When message was created
- `message`: Message content
- `position`: Agent's position (for/against/neutral)
- `revisions`: What agent changed from previous

---

## 4. API Design

### 4.1 Backend Endpoints

**POST /api/research**
Starts a new research session.

Request:
```json
{
  "question": "What are the effects of universal basic income on employment rates?",
  "options": {
    "max_sources": 12,
    "timeout": 90000,
    "debate_rounds": 4
  }
}
```

Response:
```json
{
  "session_id": "abc123",
  "status": "started",
  "estimated_time": 85
}
```

**GET /api/research/:session_id/stream**
SSE stream for real-time updates.

Event format for debate:
```json
{
  "type": "debate_message",
  "data": {
    "round": 4,
    "agent_id": "critic_1",
    "role": "Source Critic",
    "model": "mistral-large",
    "target": "synthesizer",
    "timestamp": "2025-01-15T10:30:00Z",
    "message": "You mentioned theme X, but the source for that has low methodological quality [2]...",
    "position": "challenging"
  }
}
```

Event types:
- `planning_complete`: Planning done
- `sources_found`: Sources found
- `critique_complete`: Source critique done
- `debate_round_start`: New debate round starts
- `debate_message`: New message in debate
- `debate_round_complete`: Debate round done
- `moderation_complete`: Moderation done
- `final_answer`: Final answer
- `error`: Error occurred
- `complete`: Research complete

**GET /api/research/:session_id/status**
Gets current status.

Response:
```json
{
  "session_id": "abc123",
  "status": "debating",
  "current_round": 4,
  "debate_round": 2,
  "agents_completed": 6,
  "sources_found": 11,
  "debate_messages": 8,
  "estimated_remaining": 25
}
```

**GET /api/research/:session_id/result**
Gets final result.

Response:
```json
{
  "session_id": "abc123",
  "status": "complete",
  "question": "...",
  "final_answer": "...",
  "sources": [...],
  "debate_timeline": [
    {
      "round": 3,
      "messages": [...]
    },
    {
      "round": 4,
      "messages": [...]
    }
  ],
  "moderation_summary": "...",
  "uncertainties": [...]
}
```

---

## 5. Prompt Design (Updated for Debate)

### 5.1 Research Planner Prompt

```
You are a research planner specializing in social policy questions.

Given the user's question: "{question}"

Your task:
1. Break down the question into 3-5 key research areas
2. Generate 8-12 specific search queries (mix: academic papers, policy reports, statistics, news)
3. Define quality criteria for sources (what counts as authoritative?)
4. Identify potential bias areas to watch for

Output format (JSON):
{
  "research_areas": ["area1", "area2", ...],
  "search_queries": ["query1", "query2", ...],
  "quality_criteria": ["criterion1", ...],
  "bias_risks": ["risk1", ...]
}
```

### 5.2 Source Hunter Prompts

**Hunter A:**
```
You are a source hunter for social policy research.

Research plan:
{research_plan}

Your task:
Find 4-6 high-quality sources that address the research areas.

For each source, provide:
- Title
- Author/Organization
- Publication date
- URL (if available)
- Type (academic/policy/statistics/news)
- Brief relevance statement

Focus on: Academic studies, official reports, international organizations

Output format (JSON):
{
  "sources": [
    {
      "title": "...",
      "author": "...",
      "date": "YYYY-MM-DD",
      "url": "...",
      "type": "...",
      "relevance": "..."
    }
  ]
}
```

**Hunter B:**
```
You are a source hunter for social policy research.

Research plan:
{research_plan}

Your task:
Find 4-6 high-quality sources that address the research areas.

For each source, provide:
- Title
- Author/Organization
- Publication date
- URL (if available)
- Type (academic/policy/statistics/news)
- Brief relevance statement

Focus on: News articles, opinion polls, local implementations, contrasting perspectives

Output format (JSON):
{
  "sources": [
    {
      "title": "...",
      "author": "...",
      "date": "YYYY-MM-DD",
      "url": "...",
      "type": "...",
      "relevance": "..."
    }
  ]
}
```

### 5.3 Source Critic Prompt

```
You are a source quality critic.

Sources to review:
{sources}

For each source, provide:
1. Quality rating (1-5 stars) on:
   - Methodology/rigor
   - Bias risk
   - Recency
   - Authority
2. Extract 3-5 citable claims with page/section references
3. List limitations/warnings
4. Note conflicts with other sources (if any)

Output format (JSON):
{
  "source_reviews": [
    {
      "source_id": 1,
      "quality_rating": 5,
      "methodology": 5,
      "bias_risk": 2,
      "recency": 5,
      "authority": 5,
      "citable_claims": [
        {
          "claim": "...",
          "citation": "p. 23, section 4.2"
        }
      ],
      "limitations": ["..."],
      "conflicts": []
    }
  ]
}
```

### 5.4 Debate: Opening Statement Prompts

**Critic Opening Statement:**
```
You are "The Rigorous Analyst" in a debate about research quality and synthesis.

Sources (with quality ratings):
{sources_with_critique}

Question: {question}

Your role: Focus on methodology, source quality, and bias.
Your agenda: Ensure only high-quality, methodologically sound sources are used.
Your tone: Analytical and demanding. Challenge weak evidence.

Give your opening statement (2-3 paragraphs):
1. Identify methodological issues in sources
2. Rate overall source quality
3. Flag potential bias
4. State what conclusions CAN be drawn with confidence
5. State what conclusions CANNOT be drawn due to weak evidence

Be direct and rigorous. Don't be afraid to challenge weak claims.
```

**Synthesizer Opening Statement:**
```
You are "The Balanced Synthesizer" in a debate about research synthesis.

Sources (with quality ratings):
{sources_with_critique}

Question: {question}

Your role: Find consensus, balance perspectives, create coherent narrative.
Your agenda: Synthesize information into a comprehensive, balanced answer.
Your tone: Balanced and inclusive. Look for common ground.

Give your opening statement (2-3 paragraphs):
1. Identify 3-5 main themes emerging from sources
2. Note where sources agree (consensus)
3. Note where sources disagree (controversies)
4. Propose a balanced synthesis
5. Acknowledge limitations

Be comprehensive but balanced. Include multiple perspectives.
```

**Skeptic Opening Statement:**
```
You are "The Challenger" in a debate about research conclusions.

Sources (with quality ratings):
{sources_with_critique}

Question: {question}

Your role: Question assumptions, find gaps, challenge conclusions.
Your agenda: Ensure we don't overstate claims or miss important caveats.
Your tone: Challenging and critical. Play devil's advocate.

Give your opening statement (2-3 paragraphs):
1. Identify 2-3 conclusions you're skeptical of
2. Explain why you're skeptical (gaps, weak evidence, alternative explanations)
3. Point out what's missing from the analysis
4. Suggest what additional evidence would be needed
5. Highlight potential risks of accepting weak conclusions

Be challenging but constructive. Your goal is to strengthen the final answer.
```

### 5.5 Debate: Cross-Examination Prompt

```
You are {your_role} in an ongoing debate about research synthesis.

Your previous opening statement:
{your_opening_statement}

Other participants' opening statements:
{other_opening_statements}

Sources: {sources}

Question: {question}

Your task: Respond to the other participants' statements.

For each other participant:
1. Address their main points directly
2. Agree where they make valid points
3. Challenge weak arguments
4. Defend your position where needed
5. Revise your position if they convince you

Format your response as:
- To [Participant Name]: [Your response]
- To [Participant Name]: [Your response]
- Revised Position: [How your position changed, if at all]

Be direct and specific. Reference sources [1], [2] etc. when making points.
```

### 5.6 Debate: Rebuttal Prompt

```
You are {your_role} in an ongoing debate.

Your opening statement:
{your_opening_statement}

Cross-examination responses you received:
{cross_examination_responses}

Your responses to others:
{your_cross_examination_responses}

Sources: {sources}

Question: {question}

Your task: Give a rebuttal and refinement.

1. Defend your position where it was challenged (if still valid)
2. Acknowledge valid points made by others
3. Revise your position based on what you learned
4. Find common ground where possible
5. Maintain your core concerns where they remain valid

Format:
- Defense: [What you still stand by and why]
- Revisions: [What you're changing and why]
- Common Ground: [Where you agree with others]
- Remaining Concerns: [What still worries you]

Be honest about revisions. Show intellectual flexibility while maintaining rigor.
```

### 5.7 Debate: Final Position Prompt

```
You are {your_role} in a debate that's concluding.

Your journey:
- Opening: {your_opening_statement}
- Cross-examination: {your_cross_examination}
- Rebuttal: {your_rebuttal}

All debate messages: {all_debate_messages}

Sources: {sources}

Question: {question}

Your task: Give your final position.

1. State your final position clearly
2. Explain what changed from your opening statement and why
3. Acknowledge what you learned from others
4. State what you still maintain is important
5. Identify remaining uncertainties

Format:
- Final Position: [Your conclusion]
- What Changed: [List of changes and reasons]
- What I Learned: [From other participants]
- What I Still Maintain: [Core concerns/points]
- Remaining Uncertainties: [What's still unclear]

Be clear and honest. Show intellectual growth.
```

### 5.8 Moderator Prompt

```
You are "The Judge" moderating a debate between three AI models about research synthesis.

Question: {question}

Sources: {sources}

Debate Timeline:
{debate_timeline}

Your task: Synthesize the debate and create a balanced summary.

1. Identify points of consensus (where all agree)
2. Identify points of disagreement (where they differ)
3. Note what each participant contributed uniquely
4. Assess the strength of different arguments
5. Create a balanced synthesis that incorporates all perspectives
6. Highlight what remains uncertain or controversial

Output format (JSON):
{
  "consensus_points": [
    {
      "point": "...",
      "strength": "strong/medium/weak",
      "supporting_sources": [1, 2, 3]
    }
  ],
  "disagreements": [
    {
      "issue": "...",
      "positions": {
        "critic": "...",
        "synthesizer": "...",
        "skeptic": "..."
      },
      "resolution": "resolved/partial/unresolved"
    }
  ],
  "unique_contributions": {
    "critic": "...",
    "synthesizer": "...",
    "skeptic": "..."
  },
  "synthesis": "...",
  "remaining_uncertainties": ["..."]
}
```

### 5.9 Final Synthesizer Prompt

```
You are creating the final research answer after a moderated debate.

Question: {question}

Sources: {sources}

Moderator's synthesis:
{moderation_summary}

Debate timeline:
{debate_timeline}

Your task: Create the final, comprehensive answer.

1. Use the moderator's synthesis as foundation
2. Incorporate all valid perspectives from the debate
3. Ensure every claim is properly cited [1], [2], etc.
4. Clearly mark: consensus, controversies, uncertainties
5. Structure the answer clearly

Structure:
- Background/Context
- Key Findings (with citations)
- Different Perspectives (if applicable)
- Areas of Uncertainty
- Conclusion

Output format (JSON):
{
  "final_answer": "...",
  "citations": {
    "[1]": "source_id_1",
    "[2]": "source_id_2"
  },
  "uncertainties": ["..."],
  "consensus_points": ["..."],
  "controversies": ["..."]
}
```

---

## 6. UI/UX Design (Updated for Debate)

### 6.1 Layout

The UI shows:
- Research timeline (planning, hunting, critique)
- **Debate section** with rounds and messages
- Source panel
- Final answer panel

### 6.2 Components (Updated)

**DebateTimeline**
- Shows debate round by round
- Expand/collapse per round
- Color coding per role
- Shows "target" (who message is directed to)
- Highlights consensus vs disagreements

**DebateMessage**
- Shows agent icon, role, model
- Shows "→ [target]" for directed messages
- Expand/collapse for long messages
- Marks revisions ("Changed: ...")
- Highlights position (challenging/supporting/neutral)

**ModerationSummary**
- Shows consensus points
- Shows disagreements
- Shows unique contributions
- Highlights unresolved issues

**AnswerPanel**
- Markdown rendering
- Citations with hover
- "Debate-informed" badge
- Link to debate section
- Shows what changed from initial synthesis

### 6.3 States and Transitions (Updated)

- **Idle**: Nothing happening
- **Planning**: Planner running
- **Hunting**: Source hunters running
- **Critiquing**: Source critic running
- **Debating**: Debate happening
  - `debate_opening`: Opening statements
  - `debate_cross_exam`: Cross-examination
  - `debate_rebuttal`: Rebuttal
  - `debate_final`: Final positions
- **Moderating**: Moderator running
- **Finalizing**: Final synthesizer running
- **Complete**: Done
- **Error**: Error occurred

---

## 7. Technical Implementation (Updated)

### 7.1 Tech Stack

**Frontend:**
- React 18+
- Vite (build tool)
- Zustand (state management)
- Tailwind CSS (styling)
- React Markdown (markdown rendering)
- EventSource API (SSE client)

**Backend:**
- Node.js 20+
- Express.js
- axios (HTTP client)
- dotenv (environment variables)
- cors (CORS handling)

**Infrastructure:**
- Development: Local (localhost)
- Production: Railway/Render/Fly.io
- Environment variables: .env file

### 7.2 Project Structure (Updated)

```
research-ensemble/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResearchInput.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── DebateTimeline.tsx        # NEW
│   │   │   ├── DebateMessage.tsx          # NEW
│   │   │   ├── ModerationSummary.tsx      # NEW
│   │   │   ├── SourcePanel.tsx
│   │   │   ├── AnswerPanel.tsx
│   │   │   └── StatusIndicator.tsx
│   │   ├── stores/
│   │   │   └── researchStore.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── planner.ts
│   │   │   ├── hunter.ts
│   │   │   ├── critic.ts
│   │   │   ├── synthesizer.ts
│   │   │   ├── skeptic.ts
│   │   │   ├── moderator.ts              # NEW
│   │   │   └── finalSynthesizer.ts
│   │   ├── orchestrator/
│   │   │   ├── researchOrchestrator.ts
│   │   │   └── debateOrchestrator.ts      # NEW
│   │   ├── api/
│   │   │   ├── openrouter.ts
│   │   │   └── prompts.ts
│   │   ├── routes/
│   │   │   └── research.ts
│   │   ├── utils/
│   │   │   └── stateManager.ts
│   │   └── server.ts
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── DESIGN.md
│
└── README.md
```

### 7.3 Key Implementation Details (Updated)

**Debate Orchestrator:**
```javascript
async function runDebate(sources, critique, question, streamCallback) {
  const debateState = {
    round: 3,
    messages: [],
    participants: ['critic', 'synthesizer', 'skeptic']
  };
  
  // Round 3: Opening statements (parallel)
  const openings = await Promise.all([
    callAgent('critic', getOpeningPrompt('critic', sources, critique, question)),
    callAgent('synthesizer', getOpeningPrompt('synthesizer', sources, critique, question)),
    callAgent('skeptic', getOpeningPrompt('skeptic', sources, critique, question))
  ]);
  
  openings.forEach((msg, i) => {
    msg.round = 3;
    msg.target = 'all';
    debateState.messages.push(msg);
    streamCallback('debate_message', msg);
  });
  
  // Round 4: Cross-examination (sequential)
  for (const participant of debateState.participants) {
    const others = debateState.messages.filter(m => m.agent !== participant);
    const response = await callAgent(
      participant,
      getCrossExaminationPrompt(participant, others, sources, question)
    );
    response.round = 4;
    response.target = 'multiple'; // or specific targets
    debateState.messages.push(response);
    streamCallback('debate_message', response);
  }
  
  // Round 5: Rebuttal (sequential)
  // Similar pattern...
  
  // Round 6: Final positions (parallel)
  // Similar pattern...
  
  return debateState;
}
```

**State Management:**
- Each debate message saved with metadata
- Debate state separate from research state
- Timeline can be reconstructed from state

---

## 8. Security and Performance

### 8.1 Security

- **API Keys**: Stored in environment variables, never in code
- **CORS**: Restricted to your frontend domain
- **Input Validation**: Sanitize user input (questions)
- **Rate Limiting**: Max 10 requests/minute per IP
- **Error Handling**: Don't expose sensitive info in errors

### 8.2 Performance

- **Parallelization**: Run Hunter A + B simultaneously, opening statements simultaneously
- **Caching**: Cache common questions (optional)
- **Streaming**: SSE for immediate progress display
- **Timeout**: Max 90s total, abort if timeout reached

### 8.3 Cost Management (Updated)

- **Token Tracking**: Log tokens per debate round
- **Cost Estimation**: ~$0.25-0.50 per research (higher due to debate)
- **Budget Limits**: Max $1.00 per request (configurable)

---

## 9. Testing Strategy

### 9.1 Unit Tests (Updated)

- Debate orchestrator: test rounds
- Prompt generation: verify debate prompts
- State management: test debate state transitions

### 9.2 Integration Tests (Updated)

- Full debate flow: test all rounds
- SSE streaming: test debate events
- Moderator synthesis: test output format

### 9.3 E2E Tests

- Full research flow: question → answer
- Error handling: test error scenarios
- UI interactions: test components

---

## 10. Implementation Plan (Updated)

### 10.1 Phase 1: MVP (Week 1-2)

**Goal**: Basic functionality

- [ ] Backend: Express server setup
- [ ] Backend: OpenRouter integration
- [ ] Backend: Basic orchestrator (3 agents: Planner, Hunter, Synthesizer)
- [ ] Backend: SSE endpoint
- [ ] Frontend: React app setup
- [ ] Frontend: Basic UI (input, timeline, answer)
- [ ] Testing: Local test of full flow

**Deliverables**: Working MVP with 3 agents

### 10.2 Phase 2: Source Management (Week 3)

**Goal**: Source handling and critique

- [ ] Backend: Source Hunter A + B
- [ ] Backend: Source Critic (Mistral Large)
- [ ] Backend: Source critique logic
- [ ] Frontend: Source panel
- [ ] Frontend: Citation rendering
- [ ] Testing: Source flow

**Deliverables**: Complete source management

### 10.3 Phase 3: Debate Foundation (Week 4-5)

**Goal**: Debate structure works

- [ ] Backend: Debate orchestrator
- [ ] Backend: Opening statement prompts
- [ ] Backend: Cross-examination logic
- [ ] Backend: Rebuttal logic
- [ ] Backend: Final positions logic
- [ ] Frontend: Debate timeline component
- [ ] Frontend: Debate message component
- [ ] Testing: Debate flow

**Deliverables**: Debate works with 3 models

### 10.4 Phase 4: Moderation & Finalization (Week 6)

**Goal**: Moderator and final synthesis

- [ ] Backend: Moderator agent (Claude 3.5 Sonnet)
- [ ] Backend: Moderator synthesis logic
- [ ] Backend: Final synthesizer
- [ ] Frontend: Moderation summary component
- [ ] Frontend: Enhanced answer panel
- [ ] Testing: Full flow

**Deliverables**: Complete system with debate

### 10.5 Phase 5: Polish (Week 7-8)

**Goal**: UX improvements and optimization

- [ ] Frontend: Error handling UI
- [ ] Frontend: Loading states
- [ ] Frontend: Export functionality
- [ ] Backend: Cost tracking
- [ ] Backend: Rate limiting
- [ ] Documentation: User guide
- [ ] Testing: E2E tests

**Deliverables**: Production-ready system

### 10.6 Phase 6: Production (Week 9+)

**Goal**: Deployment and monitoring

- [ ] Infrastructure: Deploy backend
- [ ] Infrastructure: Deploy frontend
- [ ] Monitoring: Error tracking
- [ ] Monitoring: Cost tracking
- [ ] Documentation: Deployment guide
- [ ] Testing: Load testing

**Deliverables**: Live system

---

## 11. Risks and Mitigation (Updated)

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API rate limits | Medium | High | Rate limiting, queue system |
| Debate takes too long | Medium | Medium | Timeout per round, max 4 rounds |
| Cost over budget | Medium | Medium | Cost tracking, budget limits |
| Debate becomes circular | Low | Medium | Max 4 rounds, moderator stops |

### 11.2 Quality Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Models echo each other | Medium | Medium | Different agendas, different models |
| Debate becomes unproductive | Low | Medium | Moderator guides, max rounds |
| Final answer too cautious | Medium | Low | Final synthesizer makes decisions |

---

## 12. Future Improvements

### 12.1 Short Term (3 months)

- Web search integration for real sources
- User feedback on debate quality
- Debate replay (replay the debate)
- Export debate transcript

### 12.2 Long Term (6+ months)

- 4th debate participant (e.g., "The Optimist")
- Voting system (models vote on arguments)
- Consensus detection (automatic)
- Multi-language support

---

## 13. Success Metrics (Updated)

### 13.1 Quality Metrics

- **Answer Quality**: User rating (1-5)
- **Debate Quality**: User rating on debate (1-5)
- **Source Quality**: % sources with rating ≥4
- **Consensus Detection**: % questions where debate finds consensus

### 13.2 Performance Metrics

- **Response Time**: Average time (target: <90s)
- **Debate Rounds**: Average number of rounds (target: 4)
- **Success Rate**: % successful requests

---

## 14. Appendix

### 14.1 Model Configuration (Updated)

```javascript
const MODELS = {
  planner: 'openai/gpt-4o-mini',
  hunterA: 'openai/gpt-4o',
  hunterB: 'anthropic/claude-3.5-sonnet',
  critic: 'mistralai/mistral-large',
  synthesizer: 'openai/gpt-4o',
  skeptic: 'google/gemini-pro-1.5',
  moderator: 'anthropic/claude-3.5-sonnet',
  finalSynthesizer: 'openai/gpt-4o'
};
```

### 14.2 Environment Variables

```bash
# Backend
OPENROUTER_API_KEY=sk-or-...
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3000
```

### 14.3 Dependencies

**Backend:**
- express: ^4.18.2
- axios: ^1.6.0
- cors: ^2.8.5
- dotenv: ^16.3.1

**Frontend:**
- react: ^18.2.0
- react-dom: ^18.2.0
- zustand: ^4.4.0
- tailwindcss: ^3.3.0
- react-markdown: ^9.0.0

### 14.4 References

- OpenRouter API Docs: https://openrouter.ai/docs
- React SSE: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Express.js: https://expressjs.com/

---

**Document Version**: 2.0  
**Last Updated**: 2025-01-15  
**Author**: AI Assistant  
**Status**: Updated - Ready for Implementation

**Key Changes from v1.0:**
- Mistral Large for Source Critic
- Debate structure instead of sequential process
- Visible debate with different agendas
- Moderator to summarize debate
- Updated prompts for debate rounds
- Updated UI for debate visualization

