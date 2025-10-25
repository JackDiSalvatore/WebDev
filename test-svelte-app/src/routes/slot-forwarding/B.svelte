<script>
	import C from './C.svelte';

	let b = 0;
</script>

<button on:click={() => { b++ }}>b: { b }</button>

<C>
	<slot name="b-header" slot="header" let:counter sum={counter + b} />
</C>
