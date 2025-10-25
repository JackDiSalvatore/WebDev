<script>
	import B from './B.svelte';

	let a = 0;
</script>

<button on:click={() => { a++ }}>a: { a }</button>

<B>
	<div slot='b-header' let:sum>
		<h1>Header from A: { sum + a }</h1>
	</div>
</B>
