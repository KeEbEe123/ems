// utils/id.ts
import { v5 as uuidv5 } from "uuid";

// A fixed namespace UUID. Generate once: `npx uuid`
const NAMESPACE = "1e1eb861-ee4f-4c5e-bed1-04ee744e8559";

export function googleSubToUuid(sub: string) {
  return uuidv5(sub, NAMESPACE);
}
