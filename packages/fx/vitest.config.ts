import { testConfig } from "../../tooling/vitest.package";

// Node by default; the few tests that need a document opt in with a `@vitest-environment jsdom` docblock.
// The water simulation tests step a 5000 px field many times; give them room on a slow CI runner.
export default testConfig(import.meta.dirname, { environment: "node", testTimeout: 60_000 });
