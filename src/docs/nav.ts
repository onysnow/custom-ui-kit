import { COMPONENTS, GROUPS } from "./registry/components";
import { EFFECTS } from "./registry/effects";

export type NavItem = { title: string; to: string; params?: Record<string, string> };
export type NavSection = { title: string; items: NavItem[] };

export const NAV: NavSection[] = [
  {
    title: "Getting started",
    items: [
      { title: "Overview", to: "/docs" },
      { title: "Installation", to: "/docs/installation" },
      { title: "Theming", to: "/docs/theming" },
      { title: "Effects", to: "/docs/effects" },
    ],
  },
  {
    title: "Effects",
    items: EFFECTS.map((e) => ({
      title: e.title,
      to: "/docs/effects/$slug",
      params: { slug: e.slug },
    })),
  },
  ...GROUPS.map((group) => ({
    title: group,
    items: COMPONENTS.filter((c) => c.group === group).map((c) => ({
      title: c.title,
      to: "/docs/components/$slug",
      params: { slug: c.slug },
    })),
  })),
];
