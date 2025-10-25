<script>
  import { List } from "$lib/components/List";
  import Item from "$lib/components/List/Item.svelte";
  import ToggleState from "$lib/components/ToggleState.svelte";
  import { slide } from "svelte/transition";

  let services = [
    {
      label: "Bus Stop",
      value: 204,
    },
    {
      label: "Crosswalk",
      value: 202,
    },
    {
      label: "Other",
      value: 200,
    },
  ];

  let isContentDropDownVisable = false;
  let selectedServiceValue;

  let newServiceName = "";

  function handleEditButton(value) {
    isContentDropDownVisable = true;

    selectedServiceValue = value;
  }
</script>

<section>
  <List>
    {#each services as service}
      <ToggleState startingValue={false} let:show let:toggle>
        <List.Item>
          <div class="content" slot="content">
            {#if isContentDropDownVisable && selectedServiceValue == service.value}
              <div>
                <input bind:value={newServiceName} />

                <button
                  on:click={() => {
                    isContentDropDownVisable = false;
                    newServiceName = "";
                  }}
                >
                  Cancel
                </button>
                <button on:click={() => alert(`EDIT: ${service.label}`)}
                  >Submit</button
                >
              </div>
            {:else}
              <h3>{service.label}</h3>
            {/if}

            <div>
              <button on:click|preventDefault={toggle}>{">"} </button>
              {#if show}
                <button
                  on:click|preventDefault={() =>
                    handleEditButton(service.value)}>EDIT</button
                >
              {/if}
            </div>
          </div>
        </List.Item>
      </ToggleState>
    {/each}
  </List>
</section>

<style>
  section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.375rem;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
