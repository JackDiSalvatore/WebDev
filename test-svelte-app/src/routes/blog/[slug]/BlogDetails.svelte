<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<h3>{data.title}</h3>
<div class="content">{@html data.content}</div>

{#await data.comments}
  Loading comments...
{:then comments}
  <h4>Comments</h4>

  <div class="content">
    {#each comments as comment}
      <div>
        By: {comment.author}
        <p>{comment.content}</p>
      </div>
    {/each}
  </div>
{:catch error}
  <p>error loading comments: {error.message}</p>
{/await}

<style>
  .content {
    border: 1px solid black;
  }
</style>
