export type ComponentGroup =
  "Inputs" | "Data display" | "Feedback" | "Surfaces" | "Navigation" | "Layout";

export type ComponentEntry = {
  /** Folder name in packages/ui/src, and the URL segment. */
  slug: string;
  title: string;
  group: ComponentGroup;
  description: string;
  /** The Radix primitive this wraps, if any (its docs describe the full prop surface). */
  radix?: string;
};

export const COMPONENTS: ComponentEntry[] = [
  {
    slug: "button",
    title: "Button",
    group: "Inputs",
    description: "Triggers an action. Six variants, four sizes, and asChild to render as a link.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Inputs",
    description: "A control that toggles between checked, unchecked and mixed.",
    radix: "checkbox",
  },
  { slug: "input", title: "Input", group: "Inputs", description: "A single-line text field." },
  {
    slug: "input-otp",
    title: "Input OTP",
    group: "Inputs",
    description: "A one-time-password field with grouped slots and paste support.",
  },
  {
    slug: "radio-group",
    title: "Radio group",
    group: "Inputs",
    description: "A set of options where only one can be selected.",
    radix: "radio-group",
  },
  {
    slug: "select",
    title: "Select",
    group: "Inputs",
    description: "Choose one value from a list, with keyboard type-ahead.",
    radix: "select",
  },
  {
    slug: "slider",
    title: "Slider",
    group: "Inputs",
    description: "Pick a value or range by dragging a thumb.",
    radix: "slider",
  },
  {
    slug: "switch",
    title: "Switch",
    group: "Inputs",
    description: "A two-state toggle for settings that take effect at once.",
    radix: "switch",
  },
  { slug: "textarea", title: "Textarea", group: "Inputs", description: "A multi-line text field." },
  {
    slug: "toggle",
    title: "Toggle",
    group: "Inputs",
    description: "A button that stays pressed.",
    radix: "toggle",
  },
  {
    slug: "toggle-group",
    title: "Toggle group",
    group: "Inputs",
    description: "A set of toggles where one or several can be pressed.",
    radix: "toggle-group",
  },
  {
    slug: "label",
    title: "Label",
    group: "Inputs",
    description: "Names a control and extends its click target.",
    radix: "label",
  },
  {
    slug: "form",
    title: "Form",
    group: "Inputs",
    description: "Accessible form fields wired to react-hook-form and zod.",
  },
  {
    slug: "calendar",
    title: "Calendar",
    group: "Inputs",
    description: "Pick a day or a range, built on react-day-picker.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    group: "Data display",
    description: "An image with a fallback for when it cannot load.",
    radix: "avatar",
  },
  {
    slug: "badge",
    title: "Badge",
    group: "Data display",
    description: "A short label for status or category.",
  },
  {
    slug: "card",
    title: "Card",
    group: "Data display",
    description: "A surface for a group of related content.",
  },
  {
    slug: "table",
    title: "Table",
    group: "Data display",
    description: "Semantic table markup with the system's spacing.",
  },
  {
    slug: "chart",
    title: "Chart",
    group: "Data display",
    description: "Recharts wrapped so series colours follow the theme.",
  },
  {
    slug: "carousel",
    title: "Carousel",
    group: "Data display",
    description: "Swipeable slides with keyboard control, built on Embla.",
  },
  {
    slug: "aspect-ratio",
    title: "Aspect ratio",
    group: "Data display",
    description: "Holds content to a fixed ratio so nothing shifts as it loads.",
    radix: "aspect-ratio",
  },
  {
    slug: "separator",
    title: "Separator",
    group: "Data display",
    description: "A thin rule between groups, horizontal or vertical.",
    radix: "separator",
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    group: "Feedback",
    description: "A placeholder shaped like the content that is loading.",
  },
  {
    slug: "alert",
    title: "Alert",
    group: "Feedback",
    description: "A callout that interrupts with something worth knowing.",
  },
  {
    slug: "progress",
    title: "Progress",
    group: "Feedback",
    description: "How far along a task is.",
    radix: "progress",
  },
  {
    slug: "sonner",
    title: "Toast",
    group: "Feedback",
    description: "Brief messages that do not block, built on Sonner.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Feedback",
    description: "A hint shown on hover or focus.",
    radix: "tooltip",
  },
  {
    slug: "accordion",
    title: "Accordion",
    group: "Surfaces",
    description: "Sections that expand and collapse, one or several at a time.",
    radix: "accordion",
  },
  {
    slug: "collapsible",
    title: "Collapsible",
    group: "Surfaces",
    description: "Show or hide one region.",
    radix: "collapsible",
  },
  {
    slug: "dialog",
    title: "Dialog",
    group: "Surfaces",
    description: "A modal window that traps focus.",
    radix: "dialog",
  },
  {
    slug: "alert-dialog",
    title: "Alert dialog",
    group: "Surfaces",
    description: "A modal that asks for confirmation before something destructive.",
    radix: "alert-dialog",
  },
  {
    slug: "drawer",
    title: "Drawer",
    group: "Surfaces",
    description: "A panel that slides up from the edge, built on Vaul.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    group: "Surfaces",
    description: "A dialog docked to a screen edge.",
    radix: "dialog",
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Surfaces",
    description: "Floating content anchored to a trigger.",
    radix: "popover",
  },
  {
    slug: "hover-card",
    title: "Hover card",
    group: "Surfaces",
    description: "A preview that appears when a link is hovered.",
    radix: "hover-card",
  },
  {
    slug: "resizable",
    title: "Resizable",
    group: "Surfaces",
    description: "Panels the reader can resize by dragging or with the keyboard.",
  },
  {
    slug: "scroll-area",
    title: "Scroll area",
    group: "Surfaces",
    description: "Custom scrollbars that keep native scrolling.",
    radix: "scroll-area",
  },
  {
    slug: "tabs",
    title: "Tabs",
    group: "Surfaces",
    description: "Switch between related views.",
    radix: "tabs",
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    group: "Navigation",
    description: "Where you are, and the way back.",
  },
  {
    slug: "command",
    title: "Command",
    group: "Navigation",
    description: "A searchable list of actions, built on cmdk.",
  },
  {
    slug: "context-menu",
    title: "Context menu",
    group: "Navigation",
    description: "A menu on right click or long press.",
    radix: "context-menu",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    group: "Navigation",
    description: "A menu opened from a button.",
    radix: "dropdown-menu",
  },
  {
    slug: "menubar",
    title: "Menubar",
    group: "Navigation",
    description: "A desktop-style bar of menus.",
    radix: "menubar",
  },
  {
    slug: "navigation-menu",
    title: "Navigation menu",
    group: "Navigation",
    description: "Site navigation with flyout panels.",
    radix: "navigation-menu",
  },
  {
    slug: "pagination",
    title: "Pagination",
    group: "Navigation",
    description: "Move through pages of results.",
  },
  {
    slug: "sidebar",
    title: "Sidebar",
    group: "Navigation",
    description: "A collapsible application sidebar with groups and menus.",
  },
  {
    slug: "layout",
    title: "Layout",
    group: "Layout",
    description: "Section, Container, Grid and equal-height cards: page geometry in one place.",
  },
];

export const GROUPS: ComponentGroup[] = [
  "Inputs",
  "Data display",
  "Feedback",
  "Surfaces",
  "Navigation",
  "Layout",
];

export const bySlug = (slug: string) => COMPONENTS.find((c) => c.slug === slug);
