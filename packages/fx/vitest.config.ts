import { testConfig } from "../../tooling/vitest.package";

// Node by default; the few tests that need a document opt in with a `@vitest-environment jsdom` docblock.
export default testConfig(import.meta.dirname, { environment: "node" });
