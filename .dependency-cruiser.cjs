// Layering for @onysnow/fx: a folder may import from the folders below it, never above. The order is the design
// (docs/adr/0001-effects-architecture.md). Violations that predate the rule are recorded in
// .dependency-cruiser-known-violations.json; CI fails only on NEW ones, and the list only ever shrinks.
const ORDER = [
  "core",
  "engine",
  "optics",
  "materials",
  "camera",
  "light",
  "scene",
  "water",
  "balloons",
  "fireworks",
  "webs",
  "secrets",
  "tools",
  "adapters",
  "react",
];

const SRC = "^packages/fx/src";

module.exports = {
  forbidden: ORDER.slice(0, -1).map((layer, i) => ({
    name: `layer-${layer}-must-not-import-upward`,
    comment: `${layer} sits below ${ORDER.slice(i + 1).join(", ")} and must not import them.`,
    severity: "error",
    from: { path: `${SRC}/${layer}/`, pathNot: "\\.test\\.tsx?$" },
    to: { path: `${SRC}/(${ORDER.slice(i + 1).join("|")})/` },
  })),
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "liquidglass" },
    tsPreCompilationDeps: true,
  },
};
