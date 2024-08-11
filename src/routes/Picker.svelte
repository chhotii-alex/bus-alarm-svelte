<script>
  export let promise;
  export let selection;
  export let name = "thing";
</script>

<span>
  {#await promise}
    waiting for {name} options...
  {:then options}
    <div>
      {#each options as thing (thing.label)}
        <input
          type="radio"
          id={thing.label}
          value={thing.id}
          bind:group={selection}
        />
        <label for={thing.label}> {thing.name} </label>
      {/each}
    </div>
  {:catch error}
    <i> Failed to fetch {name} options: {error} </i>
  {/await}
</span>
