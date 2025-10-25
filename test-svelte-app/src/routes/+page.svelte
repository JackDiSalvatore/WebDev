<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<h1>Welcome to SvelteKit</h1>

<div>
    <p>This is my website.</p>

    <ul>
        {#each data.pets as pet}
            <li>
                <strong>{pet.type}:</strong> {pet.name}
            </li>
        {/each}
    </ul>
</div>
