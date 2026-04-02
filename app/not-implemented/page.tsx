import Link from "next/link";
import { ArrowLeft, ChefHat } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotImplementedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-background">
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
            <span className="text-6xl">😅</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Feature Not Available
          </h1>
          <p className="text-xl text-muted-foreground">
            Sorry, the AI-powered features have been disabled.
          </p>
          <div className="p-6 rounded-2xl bg-muted/50 border text-left space-y-4">
            <h3 className="font-semibold text-lg">Why is this happening?</h3>
            <p className="text-muted-foreground">
              The advanced AI features require significant computational
              resources. As students participating in a hackathon, we
              unfortunately do not have the budget to cover the costs of running
              these AI models at scale.
            </p>
            <p className="text-muted-foreground">
              We hope to bring these features back in the future with your
              support!
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/download">Download the App Instead</Link>
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
