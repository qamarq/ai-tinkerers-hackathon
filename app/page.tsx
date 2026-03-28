import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  Download,
  Play,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Gotownik.love</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/fridge">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Automate Your <span className="text-primary">Cooking Process</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your kitchen with AI-powered cooking automation.
            Step-by-step guidance, precise timing, and perfect results every
            time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/fridge">
                Start Cooking
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Have a MacBook? Try our companion app
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 hover:from-primary/20 hover:via-secondary hover:to-primary/20 transition-all duration-500 hover:scale-105"
              asChild
            >
              <Link href="/download">
                <Download className="mr-2 h-5 w-5" />
                Download App
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Step-by-Step Guidance</CardTitle>
              <CardDescription>
                Follow precise cooking instructions with automated timing and
                temperature control.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Connect your kitchen devices and let AI optimize your cooking
                process.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Recipe Management</CardTitle>
              <CardDescription>
                Organize your recipes, track cooking history, and discover new
                dishes.
              </CardDescription>
            </CardHeader>
          </Card>
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
