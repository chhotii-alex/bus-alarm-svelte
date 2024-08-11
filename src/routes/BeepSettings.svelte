<script>
  export let shouldDoBeep;
  export let transit;
  export let handleInput;
</script>

<input type="checkbox" id="beep" bind:checked={shouldDoBeep} />
<label for="beep"> Beep during Yellow Alert </label>
{#if shouldDoBeep}
  every <input bind:value={transit.beepRepeatInterval} on:input={handleInput} />
  seconds between
  <input type="time" bind:value={transit.minBeepTime} on:input={handleInput} />
  and
  <input type="time" bind:value={transit.maxBeepTime} on:input={handleInput} />
{/if}
