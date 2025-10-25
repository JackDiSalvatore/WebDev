<script>
  import Grandparent from "./Grandparent.svelte";
  import Parent from "./Parent.svelte";
  import Child from "./Child.svelte";
</script>

<h1>Context Example</h1>

<Grandparent>
  <Parent>
    <Child />
  </Parent>
</Grandparent>

<Grandparent>
  <Parent>
    <Child />
  </Parent>
</Grandparent>
