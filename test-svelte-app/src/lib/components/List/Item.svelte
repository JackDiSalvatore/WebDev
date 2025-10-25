<script lang="ts">
</script>

<div class="list-item">
  <slot name="content" />
</div>

<style>
  .list-item {
    /* display: flex; */
    /* justify-content: start; */
    /* align-items: center; */
    /* text-align: left; */
    color: var(--color, hsl(220 20% 20%));
    border: 1px solid grey;
    padding: 0.375rem;
  }

  .list-item:hover {
    background-color: var(--accordion-hover, hsl(216, 100%, 90%));
  }

  .list-item-caret {
  }

  .list-item-content {
    color: var(--color, hsl(216, 84%, 73%));
    padding: 0;
  }
</style>
