<script>
  import { slide } from "svelte/transition";
  import { getAccordionOptions } from "./context";

  export let open = false;

  const componentId = crypto.randomUUID();

  const { colapse, activeComponentId } = getAccordionOptions();

  function setActiveComponentId() {
    if ($activeComponentId == componentId) {
      $activeComponentId = null;
    } else {
      $activeComponentId = componentId;
    }
  }

  function toggleItem() {
    open = !open;
  }

  function handleClick() {
    colapse ? setActiveComponentId() : toggleItem();
  }

  $: open && colapse && setActiveComponentId(); // if both "open" and "colapse" true -> setActiveComponent
  $: isActive = $activeComponentId == componentId;
  $: isOpen = colapse ? isActive : open;
</script>

<div class="accordion-item">
  <button
    class="accordion-item-toggle"
    on:click|preventDefault={handleClick}
    aria-expanded={isOpen}
    aria-controls="accordion-{componentId}"
  >
    <div class="accordion-item-title">
      <slot name="title" />
    </div>
    <div class="accordion-item-caret" class:open={isOpen} class:close={!isOpen}>
      👉
    </div>
  </button>
</div>

{#if isOpen}
  <div
    transition:slide|local
    class="accordion-item-content"
    role="region"
    aria-hidden={isOpen}
    aria-labelledby="accordion-{componentId}"
  >
    <slot name="content" />
  </div>
{/if}

<style>
  .accordion-item {
    color: var(--color, hsl(216, 84%, 73%));
  }

  .accordion-item-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: var(--color, hsl(216, 84%, 73%));
    background: none;
    border: 0px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .accordion-item-toggle:hover {
    background-color: var(--accordion-hover, hsl(220 20% 20%));
  }

  .accordion-item-caret {
  }

  .accordion-item-content {
    color: var(--color, hsl(216, 84%, 73%));
    padding: 0;
  }

  .open {
    transform: rotate(90deg);
    transition: transform 0.3s ease;
  }

  .close {
    transform: rotate(0deg);
    transition: transform 0.3s ease;
  }
</style>
