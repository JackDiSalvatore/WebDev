import type { Writable } from "svelte/store";

export type AccordionOptions = { colapse: boolean };
export type ActiveComponentId = string | null;
export type ColapseContext = boolean;
export type ActiveComponentIdContext = Writable<ActiveComponentId>;
