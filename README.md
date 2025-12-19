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

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
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
- npm or yarn
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EnsembleAI
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend .env
OPENROUTER_API_KEY=your-api-key
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Frontend .env
VITE_API_URL=http://localhost:3000
```

4. Start development servers:
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

## Project Structure

```
EnsembleAI/
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
├── docs/              # Documentation
│   └── DESIGN.md     # Complete design document
└── README.md         # This file
```

## Documentation

See [DESIGN.md](./DESIGN.md) for the complete design document including:
- System architecture
- Agent roles and debate flow
- API design
- Prompt templates
- UI/UX design
- Implementation plan

## Development Status

🚧 **In Development** - This project is currently being built according to the design document.

## License

[To be determined]

## Contributing

[To be determined]

