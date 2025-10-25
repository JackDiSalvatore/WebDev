<script>
  export let startingValue;

  function toggle() {
    startingValue = !startingValue;
  }
</script>

<slot show={startingValue} {toggle} />
