import { writable } from "svelte/store";
import type {
  AccordionOptions,
  ActiveComponentIdContext,
  ActiveComponentId,
  ColapseContext,
} from "./types";
import { getContext, setContext } from "svelte";

const activeComponentId = writable<ActiveComponentId>(null);

export function setAccordionOptions({ colapse }: AccordionOptions) {
  // Set Context
  setContext<ColapseContext>("colapse", colapse);
  setContext<ActiveComponentIdContext>("active", activeComponentId);
}

export function getAccordionOptions() {
  const colapse = getContext<ColapseContext>("colapse");
  const activeComponentId = getContext<ActiveComponentIdContext>("active");

  return { colapse, activeComponentId };
}
