import Link from "next/link";
import { ArrowLeft, ChefHat } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Gotownik.love</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-6">
            <span className="text-6xl">🍳</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight">
            You&apos;re cooked!
          </h1>
          <p className="text-xl text-muted-foreground">
            This page has been overcooked and is not found.
          </p>
          <p className="text-muted-foreground">
            Looks like this recipe went wrong. Let&apos;s get you back to the
            kitchen.
          </p>
          <Button size="lg" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gotownik.love</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Built for the AI Tinkerers Hackathon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
