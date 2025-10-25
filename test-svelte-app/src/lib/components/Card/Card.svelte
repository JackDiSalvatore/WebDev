<section>
  <slot name="title" />
  <slot name="description" />

  <footer>
    <slot />
  </footer>
</section>

<style>
  section {
    width: var(--card-width, 100%);
    margin: var(--card-margin, 0.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid lightgrey;
    border-radius: 0.375rem;
    background-color: var(--card-background-color, grey);
    color: var(--card-color, white);
  }
</style>
