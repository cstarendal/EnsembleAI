# Ensemble AI Research System

A system where multiple AI models collaborate in a visible debate to produce high-quality research answers on social policy questions.

## Overview

This system implements an ensemble strategy where different AI models with distinct agendas engage in a structured debate to analyze research questions. Users can see the entire debate process in real-time, providing transparency and trust in the final answer.

## Key Features

- **Multi-Model Debate**: Three AI models (Critic, Synthesizer, Skeptic) debate research findings
- **Real-Time Visualization**: See the debate unfold round-by-round
- **Source Management**: Automatic source finding, quality rating, and citation
- **Transparency**: Full visibility into how conclusions are reached
- **High Quality**: Better answers through cross-examination and consensus building

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **AI Models**: OpenAI, Anthropic, Google, Mistral (via OpenRouter)
- **Communication**: Server-Sent Events (SSE) for real-time updates

## Models Used

- **Research Planner**: GPT-4o-mini (OpenAI)
- **Source Hunter A**: GPT-4o (OpenAI)
- **Source Hunter B**: Claude 3.5 Sonnet (Anthropic)
- **Source Critic**: Mistral Large (Mistral AI)
- **Synthesizer**: GPT-4o (OpenAI)
- **Skeptic**: Gemini 1.5 Pro (Google)
- **Moderator**: Claude 3.5 Sonnet (Anthropic)
- **Final Synthesizer**: GPT-4o (OpenAI)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- OpenRouter API key ([get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/EnsembleAI.git
cd EnsembleAI
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENROUTER_API_KEY

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

4. Start development servers:

```bash
npm run dev
```

This will start:

- Frontend on http://localhost:5173
- Backend on http://localhost:3000

## Project Structure

```
EnsembleAI/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # React components (Views)
│   │   ├── hooks/       # Custom hooks (Controllers/Model)
│   │   ├── pages/       # Route pages (Orchestrators)
│   │   ├── services/    # Business logic services
│   │   └── ...
│   └── ...
├── backend/           # Node.js backend server
│   ├── src/
│   │   ├── agents/      # AI agent implementations
│   │   ├── orchestrator/ # Debate orchestration
│   │   ├── routes/      # Express routes
│   │   └── ...
│   └── ...
├── docs/              # Documentation
│   ├── DESIGN.md       # Complete design document
│   └── PROJECT_LEARNINGS.md # Architecture patterns
├── e2e/               # E2E tests
└── .github/           # GitHub workflows and templates
```

## Development

### Code Quality Standards

This project follows strict code quality standards:

- **Max 100 lines per function** (strictly enforced)
- **Max complexity: 12**
- **Max depth: 4**
- **Max params: 4**
- **Design tokens** (no hardcoded values)
- **TDD workflow** (write tests first)

See [`.cursorrules`](.cursorrules) for complete standards.

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both
npm run build:frontend   # Build frontend
npm run build:backend     # Build backend

# Testing
npm test                 # Run all tests
npm run test:frontend    # Frontend tests
npm run test:backend     # Backend tests
npm run test:e2e        # E2E tests

# Code Quality
npm run lint             # Lint all code
npm run typecheck        # Type check
npm run format           # Format code
npm run format:check     # Check formatting
```

## Contributing

We welcome contributions! This project uses **PR-based development for everyone** (including the maintainer) to create clear history, enable self-review, and learn best practices.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines.

### Quick Start for Contributors

1. Fork the repository (for external contributors) or clone directly (for maintainer)
2. Pull latest: `git pull origin main`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes following our [code standards](.cursorrules)
5. Write tests first (TDD approach)
6. Run checks: `npm run lint && npm run typecheck && npm test`
7. Commit and push: `git push origin feature/my-feature`
8. Create a Pull Request on GitHub
9. Wait for CI to pass, then self-review and merge

## Documentation

- **[DESIGN.md](docs/DESIGN.md)** - Complete design document with architecture, API design, and implementation plan
- **[PROJECT_LEARNINGS.md](docs/PROJECT_LEARNINGS.md)** - Architecture patterns and best practices from previous projects
- **[CSS_GUIDE.md](docs/CSS_GUIDE.md)** - Complete guide for CSS structure, design tokens, and styling
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[.cursorrules](.cursorrules)** - Code quality standards and patterns

## Development Status

🚧 **In Development** - This project is currently being built according to the design document.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with patterns and learnings from previous projects. See [PROJECT_LEARNINGS.md](docs/PROJECT_LEARNINGS.md) for details.
