<script>
    import { counter } from "../stores/counter";

    /** @type {import('./$types').LayoutData} */
    export let data;
</script>

<style>
    a {
        padding: 0.5rem;
    }
</style>

<nav>
    {#each data.navOptions as nav}
        <a href={nav.link}>{nav.title}</a>
    {/each}

    {$counter}
</nav>

<!-- App "page" goes here -->
<slot></slot>
