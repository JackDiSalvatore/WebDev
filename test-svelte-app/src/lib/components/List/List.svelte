<script lang="ts">
</script>

<div class="list">
  <slot />
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    width: var(--list-width, 100%);
    /* padding: var(--list-padding, 1rem); */
    color: var(--list-color, --primary);
    background-color: var(--list-background-color, --surface);
    border-radius: var(--list-border-radius, 4px);
    border: 1px solid rgb(0 0 0 / 0.1);
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    /* box-shadow: var(--list-box-shadow, 0px 1px 15px hsl(220 10% 10%)); */
  }
</style>
