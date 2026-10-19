import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Droplets, Layers, Lightbulb, SwatchBook } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Pane } from "@onysnow/fx/react/Pane";
import { THEMES } from "@onysnow/tokens";
import { Badge } from "@onysnow/ui/badge";
import { Button } from "@onysnow/ui/button";
import { Slider } from "@onysnow/ui/slider";
import { Switch } from "@onysnow/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@onysnow/ui/tabs";
import { InstallTabs } from "../docs/components/InstallTabs";
import { EFFECTS } from "../docs/registry/effects";
import { SITE } from "../docs/site";
import { themes } from "../docs/theme";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <>
      <Hero />
      <Pillars />
      <EffectsShowcase />
      <ThemeStrip />
      <Closing />
    </>
  );
}

function Hero() {
  return (
    <section data-photo className="relative isolate px-5 pb-24 pt-20 sm:px-8 lg:pt-28">
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge
            variant="outline"
            className="mb-6 border-border/80 bg-card/40 font-mono text-[11px] tracking-wider"
          >
            React 19 · Radix · Tailwind v4 · WebGL
          </Badge>
          <h1 className="font-display text-5xl font-light leading-[1.04] tracking-tight sm:text-7xl">
            Components with <span className="text-primary">real light</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="plastic">
              <Link to="/docs/installation">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-card/40">
              <Link to="/docs/components">Browse components</Link>
            </Button>
          </div>
          <InstallTabs className="mt-10 max-w-xl" />
        </div>
        <HeroPane />
      </div>
    </section>
  );
}

/** Real components on a real pane: the glass bends the scene behind it, and the controls are the library's own. */
function HeroPane() {
  return (
    <Pane material="frosted-float" thickness={20} edge={{ width: 28 }} gap={60}>
      <div className="space-y-6 p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl font-light">Studio settings</p>
          <Badge>Live</Badge>
        </div>
        <Tabs defaultValue="light">
          <TabsList className="w-full">
            <TabsTrigger value="light" className="flex-1">
              Light
            </TabsTrigger>
            <TabsTrigger value="glass" className="flex-1">
              Glass
            </TabsTrigger>
            <TabsTrigger value="rain" className="flex-1">
              Rain
            </TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="space-y-5 pt-5">
            <Field label="Lamp height">
              <Slider defaultValue={[64]} max={100} />
            </Field>
            <Field label="Room reflection">
              <Slider defaultValue={[38]} max={100} />
            </Field>
          </TabsContent>
          <TabsContent value="glass" className="space-y-5 pt-5">
            <Field label="Thickness">
              <Slider defaultValue={[18]} max={40} />
            </Field>
            <Field label="Frost">
              <Slider defaultValue={[55]} max={100} />
            </Field>
          </TabsContent>
          <TabsContent value="rain" className="space-y-5 pt-5">
            <Field label="Drop density">
              <Slider defaultValue={[30]} max={100} />
            </Field>
            <Field label="Wind">
              <Slider defaultValue={[12]} max={100} />
            </Field>
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Cast shadows</p>
            <p className="text-xs text-muted-foreground">Every surface throws one.</p>
          </div>
          <Switch defaultChecked aria-label="Cast shadows" />
        </div>
      </div>
    </Pane>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

const PILLARS = [
  {
    icon: Layers,
    title: "46 accessible components",
    body: "Radix primitives and Tailwind v4, one folder per component, each its own import. Copy nothing: install, import, theme.",
    to: "/docs/components",
    cta: "Browse components",
  },
  {
    icon: Lightbulb,
    title: "One scene, shared light",
    body: "Glass, plastic, photographs and type all read the same lamp and room. A shadow cast by one surface lands on the next.",
    to: "/docs/effects",
    cta: "See the effects",
  },
  {
    icon: SwatchBook,
    title: "Themes that prove themselves",
    body: "Every built-in palette passes WCAG contrast, and a theme of your own is refused if it fails. Try, then keep.",
    to: "/docs/theming",
    cta: "Theming guide",
  },
] as const;

function Pillars() {
  return (
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-screen-xl gap-5 md:grid-cols-3">
        {PILLARS.map((p) => (
          <Pane key={p.title}>
            <div className="flex h-full flex-col gap-4 p-7">
              <p.icon className="size-6 text-primary" aria-hidden />
              <h2 className="font-display text-2xl font-light">{p.title}</h2>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <Link
                to={p.to}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                {p.cta} <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Pane>
        ))}
      </div>
    </section>
  );
}

function EffectsShowcase() {
  return (
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Effects
            </p>
            <h2 className="font-display text-4xl font-light sm:text-5xl">
              Light you can build with.
            </h2>
          </div>
          <Link to="/docs/effects" className="hidden text-sm text-primary hover:underline sm:block">
            All effects →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EFFECTS.map((e) => (
            <Link
              key={e.slug}
              to="/docs/effects/$slug"
              params={{ slug: e.slug }}
              className="group block"
            >
              <Pane className="h-full transition-transform duration-500 group-hover:-translate-y-1">
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2">
                    <Droplets className="size-4 text-secondary-foreground/70" aria-hidden />
                    <h3 className="font-display text-xl font-light">{e.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                  <p className="font-mono text-xs text-muted-foreground/80">
                    {e.exports.join(" · ")}
                  </p>
                </div>
              </Pane>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const subscribe = (fn: () => void) => themes.onAppearanceChange(fn);
const current = () => themes.currentAppearance().theme;

function ThemeStrip() {
  const active = useSyncExternalStore(subscribe, current, () => "rain-noir");
  return (
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-screen-xl">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Themes
        </p>
        <h2 className="mb-3 font-display text-4xl font-light sm:text-5xl">Five rooms. Try one.</h2>
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Pick a theme and the whole site follows, components and effects together. Each passes WCAG
          contrast; the lowest pair is shown on its card.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => themes.keepAppearance({ theme: t.id })}
              aria-pressed={active === t.id}
              className="surface-read rounded-2xl border border-border p-5 text-left transition hover:-translate-y-1 aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-primary"
            >
              <div className="mb-4 flex h-12 overflow-hidden rounded-lg border border-black/30">
                {t.swatches.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <p className="font-display text-lg font-light">{t.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.mood}</p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                Contrast {t.lowestContrast}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="px-5 pb-28 pt-12 sm:px-8">
      <Pane className="mx-auto max-w-screen-lg">
        <div className="space-y-6 px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-4xl font-light sm:text-5xl">Start in five minutes.</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Install the packages, import one stylesheet, set a theme. Add effects when you want the
            room to feel real.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="lg" className="plastic">
              <Link to="/docs/installation">Installation guide</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-card/40">
              <a href={SITE.repo}>GitHub</a>
            </Button>
          </div>
        </div>
      </Pane>
    </section>
  );
}
