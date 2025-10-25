<script>
	/**
     * @type {number}
     */
	let counter = 0;
</script>

<button on:click={() => { counter++ }}>{ counter }</button>

<slot name="header" { counter }/>
<slot name="content"/>
<slot name="footer"/>
