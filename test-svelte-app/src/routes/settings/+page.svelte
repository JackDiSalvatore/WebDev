<script>
    import { page } from "$app/stores";

    import SettingsDetails from "./SettingsDetails.svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    // console.log("Settings Page Data");
    // console.log($page.data);
    // console.log("is the same as");
    // console.log(data, "\r\n");

</script>

<!-- <h1>{$page.data.title}</h1> -->
<SettingsDetails data={data}/>
