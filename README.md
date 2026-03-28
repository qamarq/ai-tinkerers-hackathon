# Gotownik.love

**Multimodal cooking automation that turns your MacBook trackpad into a kitchen scale.**

Built for the AI Tinkerers Hackathon. A complete cooking experience for beginners—from fridge scan to finished dish.

## What It Does

🍳 **MacBook as Kitchen Scale** - Native macOS app (Wagownik) uses Force Touch trackpad pressure sensors as a precision gram scale. The AI cooking agent requests measurements anytime via REST API.

🎙️ **Real-Time Cooking Agent** - Gemini Flash Lite 3.1-preview + Vapi voice AI. Multimodal: sees your kitchen (video), hears you (audio), responds naturally (speech-to-speech). AR overlay windows show ingredients, steps, timers, and chat on top of live video.

🔍 **Deep Recipe Research** - FireCrawl-powered agent searches the web, extracts recipes, ranks top 3 matches based on your fridge contents and cooking preferences.

📸 **Fridge Photo Extraction** - Snap a photo. Computer vision identifies all ingredients instantly.

🛒 **Automated Grocery Ordering** - Playwright + Gemini browser agent navigates Wolt, searches Auchan, adds missing ingredients to cart.

## Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **AI**: Gemini Flash Lite 3.1-preview (Vercel AI SDK)
- **Voice**: Vapi (real-time speech-to-speech)
- **Vision**: Gemini Vision for fridge scanning
- **Web Scraping**: Firecrawl
- **Browser Automation**: Playwright + Gemini
- **Database**: PostgreSQL + Drizzle ORM
- **State**: Jotai + TanStack Query
- **Hardware**: Native macOS app (SwiftUI + Force Touch sensors)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy and configure env
cp .env.example .env
# Add: DATABASE_URL, GEMINI_API_KEY, VAPI_API_KEY, FIRECRAWL_API_KEY

# Setup database
pnpm db:push

# Run web app
pnpm dev

# Run MacBook scale app
cd wagownik
open TrackWeight.xcodeproj
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
Next.js Web App
├── Fridge Scanner → Gemini Vision
├── Recipe Agent → FireCrawl
├── Cooking Session → Vapi + Gemini (Video + Audio)
└── Browser Agent → Playwright → Wolt
         │
         ▼
Wagownik (macOS)
├── Force Touch Trackpad → Gram Scale
└── REST API ↔ Cooking Agent
```

## Key Innovations

- **Hardware-software integration**: First app using MacBook trackpad as precision kitchen scale
- **True multimodal agent**: Video + audio + hardware sensors in real-time
- **End-to-end automation**: Fridge scan → recipe discovery → cooking → grocery ordering
- **Zero cooking knowledge required**: AI guides complete beginners

## Demo

[https://gotownik.love](https://gotownik.love)

Happy to serve you our Chia Pudding with Fruits 🙂

---

_Built for the AI Tinkerers Hackathon_
