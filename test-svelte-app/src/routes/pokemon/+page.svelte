<script lang="ts">
  import Card from "$lib/components/Card/Card.svelte";
  export let data;
</script>

<section>
  <Card
    --card-width="50%"
    --card-margin="0.5rem"
    --card-background-color="grey"
    --card-color="aliceblue"
  >
    <h1 slot="title">
      {data.name}
      <img src={data.sprites.front_default} alt="pokemon" />
    </h1>
    <p slot="description">Description...</p>
    <p>card footer</p>
  </Card>

  <Card --card-width="50%" --card-margin="0.5rem">
    <h1 slot="title">Abilities</h1>
    <ul slot="description">
      {#each data.abilities as ability}
        <li>{ability.ability.name}</li>
      {/each}
    </ul>
  </Card>

  <Card --card-width="50%" --card-margin="0.5rem">
    <h1 slot="title">Moves</h1>
    <ul slot="description">
      {#each data.moves as move}
        <li>{move.move.name}</li>
      {/each}
    </ul>
  </Card>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 1rem;
  }
  h1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
