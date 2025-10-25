<script lang="ts">
  import { setAccordionOptions } from "./context";

  export let colapse = false;

  setAccordionOptions({ colapse });
</script>

<div class="accordion">
  <slot />
</div>

<style>
  .accordion {
    display: flex;
    flex-direction: column;
    width: var(--accordion-width, 100%);
    padding: var(--accordion-padding, 1rem);
    color: var(--accordion-color, hsl(220 10% 10%));
    background-color: var(--accordion-background-color, hsl(220 10% 10%));
    border-radius: var(--accordion-border-radius, 4px);
    box-shadow: var(--accordion-box-shadow, 0px 1px 15px hsl(220 10% 10%));
  }
</style>
