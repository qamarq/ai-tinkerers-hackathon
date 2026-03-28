import Link from "next/link";
import {
  ArrowLeft,
  ChefHat,
  Download,
  MonitorSmartphone,
  Scale,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DownloadPage() {
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

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-6">
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Download the Companion App
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn your MacBook trackpad into a precision kitchen scale. The
              Wagownik app uses Force Touch sensors to measure ingredients in
              grams, connecting directly to your cooking session.
            </p>
          </div>

          <Card className="mb-12 overflow-hidden">
            <div className="bg-primary/5 p-8 border-b">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm border">
                    <MonitorSmartphone className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Wagownik</p>
                    <p className="text-sm text-muted-foreground">macOS App</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm border">
                    <Scale className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Force Touch Scale</p>
                    <p className="text-sm text-muted-foreground">
                      Precision in grams
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Compatible with MacBooks with Force Touch trackpad
                </p>
                <Button size="lg" asChild className="h-12 px-8 text-base">
                  <Link href="/gotownik-companion.dmg" download>
                    <Download className="h-5 w-5 mr-2" />
                    Download for macOS
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  .dmg file for Apple Silicon and Intel Macs
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Real-Time Measurements
                </CardTitle>
                <CardDescription>
                  Get precise gram readings instantly as you place ingredients
                  on the trackpad
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seamless Integration</CardTitle>
                <CardDescription>
                  Connect automatically to your cooking session and send
                  measurements directly to the AI agent
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precision Engineering</CardTitle>
                <CardDescription>
                  Force Touch technology provides laboratory-level accuracy for
                  your recipes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border text-center">
            <h3 className="font-semibold mb-2">How it works</h3>
            <p className="text-sm text-muted-foreground">
              Download and install the app, then enable it during your cooking
              session. When the AI agent needs a measurement, simply place your
              ingredient on the trackpad and the weight appears automatically in
              your cooking overlay.
            </p>
          </div>
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
