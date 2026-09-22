import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Box,
  Check,
  Copy,
  Info,
  Layers,
  Mail,
  Palette,
  Shield,
  Snowflake,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnySnowapi — Friendly Web Components" },
      {
        name: "description",
        content:
          "A warm, accessible component library for the web. Browse 12 ready-to-use components and start building faster.",
      },
      {
        property: "og:title",
        content: "OnySnowapi — Friendly Web Components",
      },
      {
        property: "og:description",
        content:
          "A warm, accessible component library for the web. Browse 12 ready-to-use components and start building faster.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [installCopied, setInstallCopied] = useState(false);

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText("npm install onysnowapi");
    setInstallCopied(true);
    setTimeout(() => setInstallCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Snowflake className="h-5 w-5" />
            </span>
            OnySnowapi
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">
              Components
            </a>
            <a href="#install" className="text-muted-foreground hover:text-foreground transition-colors">
              Install
            </a>
          </nav>
          <Button size="sm">Get started</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="gradient-mesh absolute inset-0 opacity-60" />
        <div className="blob absolute -left-20 top-20 h-72 w-72 bg-secondary/40 blur-3xl" />
        <div className="blob absolute -right-20 bottom-10 h-80 w-80 bg-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            12 starter components
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            Components that feel{" "}
            <span className="text-primary">warm & alive</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            OnySnowapi is a friendly web component library designed for fast,
            accessible interfaces. Copy, paste, and ship with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2">
              <Box className="h-4 w-4" />
              Browse components
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Read the docs
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="border-none bg-cream/60 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle>Warm by default</CardTitle>
              <CardDescription>
                Creamy backgrounds, soft orange accents, and inviting contrast
                that feels human.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-none bg-cream/60 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle>Accessible</CardTitle>
              <CardDescription>
                Built on Radix primitives with keyboard navigation, focus rings,
                and ARIA roles.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-none bg-cream/60 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle>Composable</CardTitle>
              <CardDescription>
                Small, focused pieces you can mix, match, and extend without
                fighting the styles.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Component gallery */}
      <section id="gallery" className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Meet the library
            </h2>
            <p className="mt-3 text-muted-foreground">
              Twelve starter components, ready to drop into your next project.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Button */}
            <GalleryCard
              title="Button"
              description="Solid, outline, ghost, and destructive variants in multiple sizes."
              snippet={`<Button>Click me</Button>
<Button variant="outline">Cancel</Button>`}
            >
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">
                  Outline
                </Button>
                <Button size="sm" variant="ghost">
                  Ghost
                </Button>
              </div>
            </GalleryCard>

            {/* Card */}
            <GalleryCard
              title="Card"
              description="A flexible container with header, content, and footer slots."
              snippet={`<Card>
  <CardHeader>
    <CardTitle>Hello</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`}
            >
              <Card className="w-full max-w-[220px]">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Cozy card</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  Cards group related content.
                </CardContent>
              </Card>
            </GalleryCard>

            {/* Badge */}
            <GalleryCard
              title="Badge"
              description="Small status labels with default, secondary, and outline styles."
              snippet={`<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>`}
            >
              <div className="flex flex-wrap gap-2">
                <Badge>New</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="outline">Public</Badge>
              </div>
            </GalleryCard>

            {/* Input */}
            <GalleryCard
              title="Input"
              description="Styled text inputs with focus rings and disabled states."
              snippet={`<Input placeholder="Email address" />
<Input disabled value="Locked" />`}
            >
              <div className="flex w-full flex-col gap-2">
                <Input placeholder="Type something nice…" />
                <Input disabled value="Disabled input" />
              </div>
            </GalleryCard>

            {/* Alert */}
            <GalleryCard
              title="Alert"
              description="Call attention to messages with default and destructive variants."
              snippet={`<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Something happened.</AlertDescription>
</Alert>`}
            >
              <Alert className="pl-10">
                <Info className="top-3.5 left-3.5 h-4 w-4" />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>
                  This is a friendly alert message.
                </AlertDescription>
              </Alert>
            </GalleryCard>

            {/* Avatar */}
            <GalleryCard
              title="Avatar"
              description="User images with graceful initials fallbacks."
              snippet={`<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
            >
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/150?img=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    OS
                  </AvatarFallback>
                </Avatar>
              </div>
            </GalleryCard>

            {/* Switch */}
            <GalleryCard
              title="Switch"
              description="A clean toggle control for binary settings."
              snippet={`<Switch id="airplane" />
<Switch id="wifi" defaultChecked />`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="wifi" defaultChecked />
                  <label htmlFor="wifi" className="text-sm">
                    Wi-Fi
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="bluetooth" />
                  <label htmlFor="bluetooth" className="text-sm">
                    Bluetooth
                  </label>
                </div>
              </div>
            </GalleryCard>

            {/* Tooltip */}
            <GalleryCard
              title="Tooltip"
              description="Contextual hints that appear on hover or focus."
              snippet={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Hello there!</TooltipContent>
  </Tooltip>
</TooltipProvider>`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline">
                      Hover me
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thanks for stopping by!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </GalleryCard>

            {/* Progress */}
            <GalleryCard
              title="Progress"
              description="Visual indicator for completion or loading states."
              snippet={`<Progress value={60} />`}
            >
              <div className="w-full space-y-3">
                <Progress value={75} />
                <Progress value={35} />
              </div>
            </GalleryCard>

            {/* Skeleton */}
            <GalleryCard
              title="Skeleton"
              description="Placeholder loading shapes that reduce perceived wait time."
              snippet={`<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-10 w-10 rounded-full" />`}
            >
              <div className="w-full space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </GalleryCard>

            {/* Tabs */}
            <GalleryCard
              title="Tabs"
              description="Organize content into switchable panels."
              snippet={`<Tabs defaultValue="design">
  <TabsList>
    <TabsTrigger value="design">Design</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
  </TabsList>
</Tabs>`}
            >
              <Tabs defaultValue="design" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="design" className="text-sm text-muted-foreground">
                  Design view content.
                </TabsContent>
                <TabsContent value="code" className="text-sm text-muted-foreground">
                  Code view content.
                </TabsContent>
              </Tabs>
            </GalleryCard>

            {/* Dialog */}
            <GalleryCard
              title="Dialog"
              description="Accessible modal windows for confirmations and forms."
              snippet={`<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Open dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hello from OnySnowapi</DialogTitle>
                    <DialogDescription>
                      This dialog is keyboard accessible and focus trapped.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="submit">Got it</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </GalleryCard>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-peach/40 to-cream/60 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to build?</CardTitle>
              <CardDescription>
                Install OnySnowapi and start using the components in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3 font-mono text-sm shadow-sm">
                <span className="text-muted-foreground">$</span>
                <span className="flex-1">npm install onysnowapi</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleCopyInstall}
                  aria-label="Copy install command"
                >
                  {installCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <a href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Snowflake className="h-4 w-4" />
            </span>
            OnySnowapi
          </a>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OnySnowapi. Built for friendly interfaces.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#gallery" className="hover:text-foreground transition-colors">
              Components
            </a>
            <a href="mailto:hello@onysnowapi.dev" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GalleryCard({
  title,
  description,
  snippet,
  children,
}: {
  title: string;
  description: string;
  snippet: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col overflow-hidden border-none bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {title === "Card" && <CardIcon />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex min-h-[120px] flex-1 items-center justify-center rounded-xl bg-cream/60 p-4">
          {children}
        </div>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground">
            <code>{snippet}</code>
          </pre>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleCopy}
            aria-label={`Copy ${title} snippet`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CardIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
      C
    </span>
  );
}
