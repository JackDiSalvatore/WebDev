<script>
  import { getContextCounter } from "../../context/contextCounter";

  const contextCounter = getContextCounter();
</script>

<div>
  <p>Child: {$contextCounter}</p>
</div>

<style>
  div {
    border: 1px solid grey;
    margin: 10% 10%;
    padding: 2% 2%;
  }
</style>
