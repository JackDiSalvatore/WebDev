<script>
	// access data from child +page.js load() funtion
	import { page } from '$app/stores';
</script>

<h1>
	{$page.data.parentData}
</h1>

<slot></slot>
