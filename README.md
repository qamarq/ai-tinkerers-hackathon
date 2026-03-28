# Gotownik.love

AI-powered cooking automation platform that transforms your kitchen experience with step-by-step guidance, precise timing, and smart recipe management.

## Features

- **Smart Fridge Management** - Track ingredients and get recipe suggestions based on what's available
- **Recipe Research** - AI-powered recipe discovery and research with web scraping capabilities
- **Live Cooking Assistant** - Real-time cooking guidance with voice AI integration
- **3D Recipe Visualization** - Interactive 3D models of dishes using Google Model Viewer
- **Step-by-Step Automation** - Precise cooking instructions with automated timing and temperature control
- **Food Ordering Integration** - Order ingredients directly when you're missing something

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **State Management**: [Jotai](https://jotai.org) + [TanStack Query](https://tanstack.com/query)
- **AI Integration**:
  - [Vercel AI SDK](https://sdk.vercel.ai) with Google Gemini
  - [Vapi](https://vapi.ai) for voice AI assistants
  - [Firecrawl](https://firecrawl.dev) for web scraping
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

4. Configure your `.env` file with the following variables:

```env
# Vapi Configuration (for voice AI)
REACT_APP_VAPI_PUBLIC_KEY=your_public_key_here
REACT_APP_VAPI_ASSISTANT_ID=your_assistant_id_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

5. Set up the database:

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

6. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint:style` - Run ESLint
- `pnpm lint:typecheck` - Run TypeScript type checking
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm format` - Format code with Prettier
- `pnpm typegen` - Generate Next.js types

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── cooking/        # Cooking session pages
│   ├── fridge/         # Fridge management
│   ├── live/           # Live streaming features
│   ├── live-cooking/   # Live cooking assistant
│   ├── minutnik/       # Timer functionality
│   └── recipe-research/# Recipe discovery
├── components/          # Shared UI components (shadcn/ui)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── cooking/       # Cooking logic & components
│   ├── food-ordering/ # Food ordering integration
│   ├── fridge/        # Fridge management
│   ├── live/          # Live streaming
│   ├── live-cooking/  # Voice AI cooking assistant
│   ├── recipe-3d/     # 3D recipe visualization
│   └── recipe-research/# Recipe research tools
├── db/                # Database configuration
├── drizzle/           # Drizzle migrations
├── hooks/             # Shared React hooks
├── lib/               # Utility functions
└── wagownik/          # Additional modules
```

## Architecture

This project follows a **feature-based architecture** where each feature contains its own:

- Components
- Hooks
- Types
- Utils
- Server-side logic (tRPC routers)

UI components are built using **shadcn/ui** with **Tailwind CSS** for styling.

## Contributing

1. Create a new feature folder under `/features`
2. Follow existing code patterns and conventions
3. Ensure all TypeScript types are properly defined
4. Run linting and type checking before committing:
   ```bash
   pnpm lint:style
   pnpm lint:typecheck
   ```

## License

Built for the AI Tinkerers Hackathon.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
