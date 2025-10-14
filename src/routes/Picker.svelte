<script>
  export let promise;
  export let selection;
  export let name = "thing";

function capitalizeFirstLetter(string) {
  if (typeof string !== 'string' || string.length === 0) {
    return string; // Handle empty strings or non-string inputs
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>

  {#await promise}
    waiting for {name} options...
  {:then options}
  <span class=fieldLabel >
        {capitalizeFirstLetter(name)}:
    </span>
    <div>
      {#each options as thing (thing.label)}
        <input
          type="radio"
          id={thing.label}
          value={thing.id}
          bind:group={selection}
        />
        <label for={thing.label}> {thing.name} </label>
	<br/>
      {/each}
    </div>
  {:catch error}
    <i> Failed to fetch {name} options: {error} </i>
  {/await}

<style>

  div {
    margin: 0 1em;
  }

</style>