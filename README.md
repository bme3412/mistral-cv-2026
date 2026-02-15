# Mistral Interactive Resume

An AI-powered interactive resume experience built for the Mistral AI Worldwide Hackathon 2026.

## Mistral APIs Used

| API | Purpose |
|-----|---------|
| **Agents API** (beta) | Core resume chatbot with persistent conversations |
| **Image Generation** | FLUX1.1 [pro] Ultra visuals for career chapters |
| **Web Search Tool** | Grounded, real-time answers within the agent |
| **Code Interpreter** | Live code demonstrations |
| **OCR** (`mistral-ocr-2505`) | Resume document parsing |
| **Embeddings** (`mistral-embed`) | Semantic search over resume content |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your MISTRAL_API_KEY

# 3. Initialize shadcn/ui (first time only)
npx shadcn@latest init
npx shadcn@latest add button card badge input scroll-area sheet dialog tooltip

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agent/          # Mistral Agent conversations
│   │   ├── generate-image/ # FLUX image generation via agent
│   │   ├── ocr/            # Resume OCR parsing
│   │   └── search/         # Semantic search (embeddings)
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Main page (single scroll)
│   └── globals.css         # Theme + utilities
├── components/
│   ├── Hero.tsx            # Full-viewport intro
│   ├── Timeline.tsx        # Vertical timeline container
│   ├── TimelineChapter.tsx # Individual chapter card
│   ├── ChatWidget.tsx      # Floating AI chat overlay
│   └── SemanticSearch.tsx  # Embeddings-powered search
├── data/
│   └── chapters.ts         # ⭐ YOUR RESUME CONTENT HERE
├── lib/
│   ├── mistral.ts          # Client singleton + agent management
│   ├── embeddings.ts       # Embedding generation + search
│   ├── ocr.ts              # OCR utilities
│   └── utils.ts            # shadcn/ui helpers
└── types/
    └── index.ts            # Shared TypeScript types
```

## Adding Resume Content

Edit `src/data/chapters.ts` — add objects to the `chapters` array:

```typescript
{
  id: "my-chapter",
  order: 1,
  title: "Chapter Title",
  subtitle: "Short description",
  dateRange: "2020 – 2023",
  bulletPoints: ["Achievement 1", "Achievement 2"],
  imagePrompt: "A cinematic illustration of...",
  tags: ["Skill1", "Skill2"],
}
```

Everything else updates automatically — the timeline, chat agent, embeddings, and search.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add MISTRAL_API_KEY
```

## Key Notes

- The Mistral Agent is created on first request and cached. You can also pre-create it and set `MISTRAL_AGENT_ID` in `.env.local`.
- Image generation is async — expect 5–15 seconds per image.
- Embeddings are cached in memory after first search request.
- The chat widget uses non-streaming requests by default. To enable streaming, implement the `startStream` / `appendStream` methods in the API route (patterns are in `mistral.ts`).
