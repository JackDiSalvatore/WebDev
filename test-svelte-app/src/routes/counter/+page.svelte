<script>
	import { counter, increase, decrease } from "../../stores/counter";
</script>

<style>
	.content {
		margin: 2%;
	}

	button {
		width: 50px;
		text-align: center;
	}
</style>

<div class="content">
	<h2>Count: {$counter}</h2>

	<button on:click|preventDefault={increase}>+</button>
	<button on:click|preventDefault={decrease}>-</button>
</div>
