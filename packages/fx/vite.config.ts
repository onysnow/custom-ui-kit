import { packageConfig } from "../../tooling/vite.package";

export default packageConfig(import.meta.dirname, { entries: "modules" });
