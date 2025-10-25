<script>
    import BlogDetails from "./BlogDetails.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<BlogDetails data={data}/>
