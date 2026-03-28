# Gotownik.love

AI-powered cooking automation platform that transforms your kitchen experience with intelligent assistance, real-time guidance, and automated grocery ordering.

## Features

### Smart Fridge Analysis

Take a photo of your fridge and let AI identify all your ingredients automatically. The system analyzes the image and creates an inventory of what you have available, making it easy to find recipes based on your current supplies.

**Key capabilities:**

- Camera or upload photo capture
- AI-powered ingredient detection and recognition
- Persistent storage of fridge inventory
- One-click recipe discovery from scanned ingredients

### AI Recipe Research Agent

Tell the AI what you want to cook, and it will search the entire web to find the 3 best matching recipes based on your fridge contents. The agent uses Firecrawl to scrape recipe websites and analyzes ingredients, cooking time, and nutritional information.

**How it works:**

1. AI searches recipe sources across the web using your fridge ingredients
2. Extracts and analyzes recipe details from top matches
3. Ranks recipes by ingredient match percentage, missing items, and relevance
4. Presents top 3 recipes with detailed breakdowns:
   - Match percentage (how many ingredients you already have)
   - Missing ingredients list
   - Estimated cooking time
   - Why each recipe fits your request
   - Direct links to original sources

**Quick search suggestions** - AI suggests popular searches based on your fridge contents.

### Live Cooking with Google Gemini Speech-to-Speech

Experience hands-free cooking with an AI chef assistant powered by Google Gemini and Vapi voice AI. The assistant sees your kitchen through your camera and guides you through each step with natural voice conversations.

**Features:**

- **Voice-first interface** - Talk to your AI chef naturally while cooking
- **Live camera feed** - AI can see your cooking progress
- **AR-style overlay windows** - Draggable floating windows with:
  - 🥗 **Ingredients** - Check off ingredients as you use them
  - 📋 **Cooking Steps** - Interactive checklist with progress tracking
  - ⏱️ **Timer** - Visual countdown timer with circular progress
  - 💬 **Chat** - Conversation history with the AI chef
- **Smart tools** the AI can use:
  - Start, pause, reset timers
  - Check timer status and remaining time
  - Track which steps are completed
  - Mark ingredients as used

**Example interactions:**

- "How long should I boil the pasta?" → AI starts an 8-minute timer
- "What's the next step?" → AI guides you to the next cooking phase
- "I don't have cream, what can I substitute?" → AI suggests alternatives

### Interactive Timers

Multiple synchronized timers that help you track different cooking processes simultaneously. Each timer features a visual circular progress indicator.

**Capabilities:**

- Start timers with custom durations and labels
- Pause and resume functionality
- Visual countdown with progress ring
- Auto-completion notifications
- AI-controlled timers (AI chef can start timers for you)

### Step Progress Tracking

Never lose track of where you are in a recipe. The cooking interface provides a clear visual progress system:

**Visual indicators:**

- Progress bar showing overall completion percentage
- Step-by-step checklist with check/uncheck functionality
- Current step highlighted in orange
- Completed steps shown with strikethrough and green checkmark
- Ingredient tags on each step showing what's needed

**Smart features:**

- Steps automatically track which ingredients they require
- Visual connection between steps and ingredients
- Easy navigation between completed and pending steps

### Ingredients Management

Track everything you need for your recipe in one place:

**Features:**

- Complete ingredient list with amounts and units
- Check off ingredients as you prep them
- Optional ingredient indicators
- Visual status (prepped vs. needed)
- Step-by-step ingredient requirements

### Wolt Grocery Ordering Automation

Missing ingredients? The AI can automatically order them for you through Wolt. Using Playwright browser automation powered by Google Gemini, the system can:

**Automated workflow:**

1. Navigate to Wolt and find Auchan store
2. Search for each missing ingredient
3. Add items to cart
4. Handle UI interactions automatically

**AI-powered browser automation:**

- Screenshot analysis to understand page state
- Intelligent element detection and clicking
- Text input and form handling
- Automatic scrolling and navigation
- Error handling and recovery

_Note: Requires Wolt account setup and cookies configuration._

### 3D Recipe Visualization

Generate stunning 3D models of your dishes using Meshy AI. See what your meal will look like before you start cooking.

**Features:**

- AI-generated 3D food models from recipe names and descriptions
- Interactive 3D viewer (Google Model Viewer)
- Real-time generation progress tracking
- Shareable 3D previews

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **State Management**: [Jotai](https://jotai.org) + [TanStack Query](https://tanstack.com/query)
- **AI Integration**:
  - [Google Gemini](https://ai.google.dev) via Vercel AI SDK - Recipe research, cooking assistant intelligence
  - [Vapi](https://vapi.ai) - Real-time voice AI for hands-free cooking
  - [Firecrawl](https://firecrawl.dev) - Web scraping for recipe research
  - [Meshy AI](https://meshy.ai) - 3D model generation
- **Browser Automation**: [Playwright](https://playwright.dev) + Google Gemini for Wolt ordering
- **Authentication**: Custom auth implementation
- **Icons**: [Phosphor Icons](https://phosphoricons.com)

## Getting Started

### Prerequisites

- Node.js 24.14.1 (managed by Volta)
- pnpm (package manager)
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gotownik
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
# Vapi Configuration (for voice AI cooking assistant)
REACT_APP_VAPI_PUBLIC_KEY=your_public_key_here
REACT_APP_VAPI_ASSISTANT_ID=your_assistant_id_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Optional: Vapi Server URL
# REACT_APP_VAPI_BASE_URL=https://api.vapi.ai
```

5. Set up the database:

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push
```

6. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage Flow

1. **Scan Your Fridge** → Take a photo or upload an image of your fridge contents
2. **Describe Your Cravings** → Tell the AI what you want to cook (e.g., "high-protein dinner under 30 minutes")
3. **Get Recipe Recommendations** → AI finds the 3 best recipes matching your ingredients
4. **Start Cooking** → Launch the live cooking session with AI voice assistant
5. **Follow Along** → Use AR windows for ingredients, steps, and timers
6. **Order Missing Items** → Let AI order groceries through Wolt if needed

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint:style` - Run ESLint
- `pnpm lint:typecheck` - Run TypeScript type checking
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm format` - Format code with Prettier

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── cooking/        # Cooking session pages
│   ├── fridge/         # Fridge scanner interface
│   ├── live-cooking/   # Live cooking assistant UI
│   └── recipe-research/# Recipe discovery interface
├── components/          # Shared UI components (shadcn/ui)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── cooking/       # Live cooking with AI assistant
│   ├── food-ordering/ # Wolt automation
│   ├── fridge/        # Fridge analysis
│   ├── live-cooking/  # Legacy live cooking
│   ├── recipe-3d/     # 3D model generation
│   └── recipe-research/# AI recipe research agent
├── db/                # Database configuration
├── hooks/             # Shared React hooks
└── lib/               # Utility functions
```

## Architecture

This project uses a **feature-based architecture** where each feature contains its own components, hooks, types, and server logic. The cooking experience combines:

- **Computer Vision** (Fridge scanning)
- **Web Scraping + AI** (Recipe research)
- **Voice AI + Real-time Communication** (Live cooking assistant)
- **Browser Automation** (Grocery ordering)
- **3D Generation** (Food visualization)

## Contributing

1. Create a new feature folder under `/features`
2. Follow existing code patterns and conventions
3. Ensure all TypeScript types are properly defined
4. Run linting and type checking before committing

## License

Built for the AI Tinkerers Hackathon.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vapi Documentation](https://docs.vapi.ai)
- [Google Gemini API](https://ai.google.dev)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [tRPC](https://trpc.io/docs)
